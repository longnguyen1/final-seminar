from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import urllib.parse

# Import từ modules tối ưu
from .utils import (
    extract_entity, 
    format_expert_detail, 
    format_expert_list, 
    safe_api_call,
    BASE_URL
)
from .data_normalizer import normalizer


def search_experts_optimized(param_name: str, param_value: str, entity_type: str = None) -> List[Dict]:
    """TỐI ƯU: Tìm kiếm chuyên gia với context-aware normalization"""
    experts = []
    
    # Context-specific normalization theo plan (chỉ cho Expert table)
    if entity_type == "current_workplace":
        normalized_value = normalizer.normalize_current_workplace(param_value)
        search_variations = [param_value, normalized_value]
    elif entity_type == "degree":
        normalized_value = normalizer.normalize_degree(param_value)
        search_variations = [param_value, normalized_value]
    elif entity_type == "academic_title":
        normalized_value = normalizer.normalize_academic_title(param_value)
        search_variations = [param_value, normalized_value]
    elif entity_type == "position":
        normalized_value = normalizer.normalize_position(param_value)
        search_variations = [param_value, normalized_value]
    else:
        # Basic normalization cho name và other entities
        search_variations = [param_value, param_value.lower(), param_value.title()]
    
    # Remove duplicates
    search_variations = list(set([v for v in search_variations if v and v.strip()]))
    
    # Search với first match optimization
    for search_value in search_variations:
        encoded_value = urllib.parse.quote(search_value)
        url = f"{BASE_URL}/experts/search-all?{param_name}={encoded_value}"
        
        data = safe_api_call(url)
        if data and data.get("experts"):
            experts = data.get("experts", [])
            break  # First match wins để tối ưu performance
    
    return experts


def filter_unique_experts(experts: List[Dict]) -> List[Dict]:
    """TỐI ƯU: Lọc duplicate experts - simplified"""
    if not experts:
        return []
    
    unique_experts = []
    seen_names = set()
    
    for expert in experts:
        if expert.get("deleted", False):
            continue
            
        # Simple deduplication by name + email
        name = expert.get('fullName', '').strip().lower()
        email = expert.get('email', '').strip().lower()
        key = f"{name}_{email}" if email else name
        
        if key not in seen_names and name:
            unique_experts.append(expert)
            seen_names.add(key)
    
    return unique_experts


class ActionTraCuuChuyenGia(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        name = extract_entity(tracker, "name")
        if not name:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia nào?")
            return []
        
        try:
            experts = search_experts_optimized("name", name)
            
            if not experts:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{name}'.")
                return [SlotSet("name", name)]
            
            unique_experts = filter_unique_experts(experts)
            expert = unique_experts[0] if unique_experts else None
            
            if expert:
                message = format_expert_detail(expert)
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text=f"Không tìm thấy thông tin chi tiết cho '{name}'.")
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi truy vấn thông tin chuyên gia.")
        
        return [SlotSet("name", name)]


class ActionTraCuuChuyenGiaTheoDonVi(Action):
    """UPDATED: Action cho current workplace - Expert.organization field"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_don_vi"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # PLAN: Ưu tiên current_workplace entity mới
        current_workplace = extract_entity(tracker, "current_workplace")
        organization = extract_entity(tracker, "organization")  # Legacy fallback
        
        workplace = current_workplace or organization
        
        if not workplace:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia đang làm việc tại đơn vị nào?")
            return []
        
        try:
            # CONTEXT-AWARE: Search current workplace trong Expert.organization
            experts = search_experts_optimized("org", workplace, "current_workplace")
            
            if not experts:
                # Try with exact organization name từ database
                normalized_org = normalizer.normalize_current_workplace(workplace)
                if normalized_org != workplace:
                    experts = search_experts_optimized("org", normalized_org, "current_workplace")
            
            if not experts:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào hiện đang làm việc tại '{workplace}'.")
                return [
                    SlotSet("current_workplace", current_workplace),
                    SlotSet("organization", organization)
                ]
            
            unique_experts = filter_unique_experts(experts)
            display_org = normalizer.normalize_current_workplace(workplace)
            
            message = f"✅ Danh sách chuyên gia hiện đang làm việc tại {display_org}:\n"
            message += format_expert_list(unique_experts, max_show=10)  # Reduced for small project
            
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi truy vấn theo đơn vị làm việc.")
        
        return [
            SlotSet("current_workplace", current_workplace),
            SlotSet("organization", organization)
        ]


class ActionTraCuuChuyenGiaTheoHocVi(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_hoc_vi"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        degree = extract_entity(tracker, "degree")
        if not degree:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia có học vị gì?")
            return []
        
        try:
            experts = search_experts_optimized("degree", degree, "degree")
            
            if not experts:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có học vị '{degree}'.")
                return [SlotSet("degree", degree)]
            
            unique_experts = filter_unique_experts(experts)
            display_degree = normalizer.normalize_degree(degree)
            
            message = f"✅ Danh sách chuyên gia có học vị {display_degree}:\n"
            message += format_expert_list(unique_experts, max_show=10)
            
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi truy vấn theo học vị.")
        
        return [SlotSet("degree", degree)]


class ActionTraCuuChuyenGiaTheoHocHam(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_hoc_ham"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        academic_title = extract_entity(tracker, "academicTitle")
        if not academic_title:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia có học hàm gì?")
            return []
        
        try:
            experts = search_experts_optimized("academicTitle", academic_title, "academic_title")
            
            if not experts:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có học hàm '{academic_title}'.")
                return [SlotSet("academicTitle", academic_title)]
            
            unique_experts = filter_unique_experts(experts)
            display_title = normalizer.normalize_academic_title(academic_title)
            
            message = f"✅ Danh sách chuyên gia có học hàm {display_title}:\n"
            message += format_expert_list(unique_experts, max_show=10)
            
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi truy vấn theo học hàm.")
        
        return [SlotSet("academicTitle", academic_title)]





