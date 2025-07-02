from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import urllib.parse

# Import context utilities
from .context.context_utils import extract_context_entity, detect_query_context
from .context.context_normalizer import normalizer
from .utils import (
    extract_entity, 
    format_expert_detail, 
    format_expert_list, 
    safe_api_call,
    BASE_URL
)


def search_experts_by_name(name: str) -> List[Dict]:
    """NEW ROUTE: Tìm kiếm chuyên gia theo tên"""
    if not name:
        return []
    
    # Normalize name variations
    search_variations = [name, name.lower(), name.title(), name.upper()]
    search_variations = list(set([v for v in search_variations if v and v.strip()]))
    
    experts = []
    for name_variant in search_variations:
        encoded_name = urllib.parse.quote(name_variant)
        # NEW ROUTE: GET /api/experts/search/by-name
        url = f"{BASE_URL}/experts/search/by-name?name={encoded_name}"
        
        data = safe_api_call(url)
        if data and isinstance(data.get("data"), list):
            experts = data.get("data", [])
            break  # First successful match wins
    
    return experts


def search_experts_by_organization(organization: str) -> List[Dict]:
    """NEW ROUTE: Tìm kiếm chuyên gia theo current workplace"""
    if not organization:
        return []
    
    # Context-aware normalization
    normalized_org = normalizer.normalize_current_workplace(organization)
    search_variations = normalizer.get_search_variations(organization, "current_workplace")
    
    experts = []
    for org_variant in search_variations:
        encoded_org = urllib.parse.quote(org_variant)
        # NEW ROUTE: GET /api/experts/search/by-organization
        url = f"{BASE_URL}/experts/search/by-organization?org={encoded_org}"
        
        data = safe_api_call(url)
        if data and isinstance(data.get("data"), list):
            experts = data.get("data", [])
            break  # First successful match wins
    
    return experts


def search_experts_by_degree(degree: str) -> List[Dict]:
    """NEW ROUTE: Tìm kiếm chuyên gia theo học vị"""
    if not degree:
        return []
    
    # Context-aware normalization
    normalized_degree = normalizer.normalize_degree(degree)
    search_variations = normalizer.get_search_variations(degree, "degree")
    
    experts = []
    for degree_variant in search_variations:
        encoded_degree = urllib.parse.quote(degree_variant)
        # NEW ROUTE: GET /api/experts/search/by-degree
        url = f"{BASE_URL}/experts/search/by-degree?degree={encoded_degree}"
        
        data = safe_api_call(url)
        if data and isinstance(data.get("data"), list):
            experts = data.get("data", [])
            break  # First successful match wins
    
    return experts


def search_experts_by_academic_title(academic_title: str) -> List[Dict]:
    """NEW ROUTE: Tìm kiếm chuyên gia theo học hàm"""
    if not academic_title:
        return []
    
    # Context-aware normalization
    normalized_title = normalizer.normalize_academic_title(academic_title)
    search_variations = normalizer.get_search_variations(academic_title, "academic_title")
    
    experts = []
    for title_variant in search_variations:
        encoded_title = urllib.parse.quote(title_variant)
        # NEW ROUTE: GET /api/experts/search/by-academic-title
        url = f"{BASE_URL}/experts/search/by-academic-title?title={encoded_title}"
        
        data = safe_api_call(url)
        if data and isinstance(data.get("data"), list):
            experts = data.get("data", [])
            break  # First successful match wins
    
    return experts


def filter_unique_experts_optimized(experts: List[Dict]) -> List[Dict]:
    """OPTIMIZED: Lọc duplicate experts"""
    if not experts:
        return []
    
    unique_experts = []
    seen_keys = set()
    
    for expert in experts:
        if expert.get("deleted", False):
            continue
        
        name = expert.get('fullName', '').strip().lower()
        email = expert.get('email', '').strip().lower()
        expert_id = expert.get('id', '')
        
        # Priority: id > email > name
        if expert_id:
            key = f"id_{expert_id}"
        elif email:
            key = f"email_{email}"
        else:
            key = f"name_{name}"
        
        if key not in seen_keys and name:
            unique_experts.append(expert)
            seen_keys.add(key)
    
    return unique_experts


class ActionTraCuuChuyenGia(Action):
    """NEW ROUTE: Expert search by name"""
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
            # NEW ROUTE: GET /api/experts/search/by-name
            experts = search_experts_by_name(name)
            
            if not experts:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{name}'.")
                return [SlotSet("name", name)]
            
            unique_experts = filter_unique_experts_optimized(experts)
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
    """NEW ROUTE: Current workplace search"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_don_vi"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # CONTEXT-AWARE: Priority extraction
        current_workplace = extract_context_entity(
            tracker, 
            primary_entity="current_workplace",
            fallback_entity="organization"
        )
        
        if not current_workplace:
            dispatcher.utter_message(response="utter_hoi_don_vi")
            return []
        
        try:
            # NEW ROUTE: GET /api/experts/search/by-organization
            experts = search_experts_by_organization(current_workplace)
            
            if not experts:
                normalized_workplace = normalizer.normalize_current_workplace(current_workplace)
                dispatcher.utter_message(
                    text=f"Không tìm thấy chuyên gia nào hiện đang làm việc tại {normalized_workplace}."
                )
                return [SlotSet("current_workplace", current_workplace)]
            
            unique_experts = filter_unique_experts_optimized(experts)
            normalized_workplace = normalizer.normalize_current_workplace(current_workplace)
            
            # Format response với context clarity
            message = f"✅ Danh sách chuyên gia hiện đang làm việc tại {normalized_workplace}:\n"
            message += format_expert_list(unique_experts, max_show=8)
            
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo đơn vị làm việc.")
        
        return [SlotSet("current_workplace", current_workplace)]


class ActionTraCuuChuyenGiaTheoHocVi(Action):
    """NEW ROUTE: Degree search"""
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
            # NEW ROUTE: GET /api/experts/search/by-degree
            experts = search_experts_by_degree(degree)
            
            if not experts:
                normalized_degree = normalizer.normalize_degree(degree)
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có học vị '{normalized_degree}'.")
                return [SlotSet("degree", degree)]
            
            unique_experts = filter_unique_experts_optimized(experts)
            normalized_degree = normalizer.normalize_degree(degree)
            
            message = f"✅ Danh sách chuyên gia có học vị {normalized_degree}:\n"
            message += format_expert_list(unique_experts, max_show=8)
            
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu theo học vị.")
        
        return [SlotSet("degree", degree)]


class ActionTraCuuChuyenGiaTheoHocHam(Action):
    """NEW ROUTE: Academic title search"""
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
            # NEW ROUTE: GET /api/experts/search/by-academic-title
            experts = search_experts_by_academic_title(academic_title)
            
            if not academic_title:
                normalized_title = normalizer.normalize_academic_title(academic_title)
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có học hàm '{normalized_title}'.")
                return [SlotSet("academicTitle", academic_title)]
            
            unique_experts = filter_unique_experts_optimized(experts)
            normalized_title = normalizer.normalize_academic_title(academic_title)
            
            message = f"✅ Danh sách chuyên gia có học hàm {normalized_title}:\n"
            message += format_expert_list(unique_experts, max_show=8)
            
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu theo học hàm.")
        
        return [SlotSet("academicTitle", academic_title)]





