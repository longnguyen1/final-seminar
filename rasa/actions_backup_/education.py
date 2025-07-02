from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import urllib.parse

# Import từ utils và normalizer
from .utils import (
    extract_entity,
    extract_multiple_entities,
    safe_api_call,
    get_expert_by_name,
    BASE_URL
)
from .data_normalizer import normalizer


def get_expert_educations(expert_id: int) -> List[Dict]:
    """Lấy danh sách education theo expert ID"""
    if not expert_id:
        return []
    
    url = f"{BASE_URL}/educations/by-expert-id?id={expert_id}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def get_experts_by_school(school_name: str) -> List[Dict]:
    """TỐI ƯU: Lấy danh sách chuyên gia theo trường học với context-aware normalization"""
    if not school_name:
        return []
    
    # PLAN: Context-aware normalization cho graduated_school
    normalized_school = normalizer.normalize_graduated_school(school_name)
    search_variations = normalizer.get_search_variations(school_name, "graduated_school")
    
    # Thêm normalized value nếu khác original
    if normalized_school != school_name:
        search_variations.insert(0, normalized_school)
    
    # Remove duplicates
    search_variations = list(set([v for v in search_variations if v and v.strip()]))
    
    experts = []
    for school_variant in search_variations:
        encoded_school = urllib.parse.quote(school_variant)
        url = f"{BASE_URL}/experts/by-school?school={encoded_school}"
        data = safe_api_call(url)
        
        if data and isinstance(data, list):
            experts.extend(data)
            if experts:  # First match wins để tối ưu
                break
    
    return experts


def get_experts_by_major(major: str) -> List[Dict]:
    """TỐI ƯU: Lấy danh sách chuyên gia theo chuyên ngành với context-aware normalization"""
    if not major:
        return []
    
    # PLAN: Context-aware normalization cho major
    normalized_major = normalizer.normalize_major(major)
    search_variations = normalizer.get_search_variations(major, "major")
    
    # Thêm normalized value nếu khác original
    if normalized_major != major:
        search_variations.insert(0, normalized_major)
    
    # Remove duplicates
    search_variations = list(set([v for v in search_variations if v and v.strip()]))
    
    experts = []
    for major_variant in search_variations:
        encoded_major = urllib.parse.quote(major_variant)
        url = f"{BASE_URL}/experts/by-major?major={encoded_major}"
        data = safe_api_call(url)
        
        if data and isinstance(data, list):
            experts.extend(data)
        elif data and data.get("experts"):
            experts.extend(data.get("experts", []))
        
        if experts:  # First match wins để tối ưu
            break
    
    return experts


def format_education_list(educations: List[Dict], expert_name: str) -> str:
    """Format danh sách quá trình đào tạo"""
    if not educations:
        return f"Không tìm thấy thông tin quá trình đào tạo của chuyên gia {expert_name}."
    
    message = f"✅ Quá trình đào tạo của chuyên gia {expert_name}:\n"
    
    # Sắp xếp theo năm
    sorted_educations = sorted(educations, key=lambda x: x.get("year", 0))
    
    for edu in sorted_educations:
        year = edu.get("year", "Chưa có")
        school = edu.get("school", "Chưa có")
        major = edu.get("major", "Chưa có")
        message += f"- {year}: Tốt nghiệp {school}, chuyên ngành {major}\n"
    
    return message


def format_experts_by_school(experts: List[Dict], school_name: str) -> str:
    """UPDATED: Format danh sách chuyên gia theo trường với normalized school name"""
    if not experts:
        # Hiển thị normalized school name
        display_school = normalizer.normalize_graduated_school(school_name)
        return f"Không tìm thấy chuyên gia nào tốt nghiệp từ {display_school}."
    
    # Hiển thị normalized school name
    display_school = normalizer.normalize_graduated_school(school_name)
    message = f"✅ Danh sách chuyên gia tốt nghiệp từ {display_school}:\n"
    
    max_show = 10  # Reduced for small project
    for i, expert in enumerate(experts[:max_show], 1):
        name = expert.get("fullName", "Không rõ")
        major = expert.get("major", "Chưa có")
        year = expert.get("year", "")
        
        message += f"{i}. {name}"
        if major != "Chưa có":
            message += f" - {major}"
        if year:
            message += f" ({year})"
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message


def format_experts_by_major(experts: List[Dict], major: str) -> str:
    """NEW: Format danh sách chuyên gia theo chuyên ngành với normalized major name"""
    if not experts:
        # Hiển thị normalized major name
        display_major = normalizer.normalize_major(major)
        return f"Không tìm thấy chuyên gia nào có chuyên ngành {display_major}."
    
    # Hiển thị normalized major name
    display_major = normalizer.normalize_major(major)
    message = f"✅ Danh sách chuyên gia có chuyên ngành {display_major}:\n"
    
    max_show = 10  # Reduced for small project
    for i, expert in enumerate(experts[:max_show], 1):
        name = expert.get("fullName", "Không rõ")
        organization = expert.get("organization", "")
        
        message += f"{i}. {name}"
        if organization:
            message += f" - {organization}"
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message


class ActionTraCuuQuaTrinhDaoTao(Action):
    def name(self) -> Text:
        return "action_tra_cuu_qua_trinh_dao_tao"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            dispatcher.utter_message(text="Bạn muốn tra cứu quá trình đào tạo của chuyên gia nào?")
            return []
        
        try:
            # Bước 1: Lấy thông tin expert
            expert = get_expert_by_name(expert_name)
            if not expert:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
                return [SlotSet("name", expert_name)]
            
            expert_id = expert.get("id")
            if not expert_id:
                dispatcher.utter_message(text="Không thể lấy ID của chuyên gia.")
                return [SlotSet("name", expert_name)]
            
            # Bước 2: Lấy danh sách education
            educations = get_expert_educations(expert_id)
            
            # Bước 3: Format và gửi response
            message = format_education_list(educations, expert.get('fullName', expert_name))
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu quá trình đào tạo.")
        
        return [SlotSet("name", expert_name)]


class ActionTraCuuChuyenGiaTheoTruongTotNghiep(Action):
    """UPDATED: Action cho graduated_school - Education.school field với context-aware normalization"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_truong_tot_nghiep"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # PLAN: Ưu tiên graduated_school entity mới
        graduated_school = extract_entity(tracker, "graduated_school")
        school = extract_entity(tracker, "school")  # Legacy fallback
        
        # Support multiple school entities từ NLU cũ
        school_entities = extract_multiple_entities(tracker, "school")
        if school_entities:
            school = " ".join(school_entities)
        
        target_school = graduated_school or school
        
        if not target_school:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia tốt nghiệp từ trường nào?")
            return []
        
        try:
            # CONTEXT-AWARE: Search trong Education.school field với normalization
            experts = get_experts_by_school(target_school)
            
            # Format và gửi response với normalized school name
            message = format_experts_by_school(experts, target_school)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo trường tốt nghiệp.")
        
        return [
            SlotSet("graduated_school", graduated_school),
            SlotSet("school", school)
        ]


class ActionTraCuuChuyenGiaTheoChuyenNganh(Action):
    """UPDATED: Action cho major - Education.major field với context-aware normalization"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_chuyen_nganh"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # PLAN: Ưu tiên major entity mới
        major = extract_entity(tracker, "major")
        field = extract_entity(tracker, "field")  # Legacy fallback
        
        target_major = major or field
        
        if not target_major:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia theo chuyên ngành nào?")
            return []
        
        try:
            # CONTEXT-AWARE: Search trong Education.major field với normalization
            experts = get_experts_by_major(target_major)
            
            # Format và gửi response với normalized major name
            message = format_experts_by_major(experts, target_major)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo chuyên ngành.")
        
        return [
            SlotSet("major", major),
            SlotSet("field", field)
        ]


# KEEP: Action cũ để backward compatibility
class ActionTraCuuChuyenGiaTheoNoiTotNghiep(Action):
    """LEGACY: Alias cho ActionTraCuuChuyenGiaTheoTruongTotNghiep"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_noi_tot_nghiep"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Redirect to new action
        action = ActionTraCuuChuyenGiaTheoTruongTotNghiep()
        return action.run(dispatcher, tracker, domain)

