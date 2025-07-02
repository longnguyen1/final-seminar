# rasa/actions/education.py
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import json

# Import existing utilities
from .utils import extract_entity, get_expert_by_name, BASE_URL
from .data_normalizer import normalizer

# ===== SIMPLIFIED API FUNCTIONS =====

def safe_api_call_get(url: str) -> dict:
    """Simple GET API call"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        return {}
    except:
        return {}

def safe_api_call_post(url: str, payload: dict) -> dict:
    """Simple POST API call"""
    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
        return {}
    except:
        return {}

def get_expert_educations_simple(expert_id: int) -> List[Dict]:
    """Get education data using RASA API"""
    if not expert_id:
        return []
    
    url = f"{BASE_URL}/api/rasa/education/expert-education?expertId={expert_id}&limit=10"
    response = safe_api_call_get(url)
    
    if response.get("success"):
        return response.get("data", [])
    return []

def get_experts_by_school_simple(school_name: str) -> List[Dict]:
    """Get experts by school using RASA API"""
    if not school_name:
        return []
    
    # Simple normalization
    normalized_school = normalizer.normalize_graduated_school(school_name)
    
    url = f"{BASE_URL}/api/rasa/education/by-school"
    payload = {
        "entity_value": normalized_school,
        "limit": 10,
        "context": "education_school_search"
    }
    
    response = safe_api_call_post(url, payload)
    
    if response.get("success"):
        return response.get("data", [])
    return []

def get_experts_by_major_simple(major: str) -> List[Dict]:
    """Get experts by major using RASA API"""
    if not major:
        return []
    
    # Simple normalization
    normalized_major = normalizer.normalize_major(major)
    
    url = f"{BASE_URL}/api/rasa/education/by-major"
    payload = {
        "entity_value": normalized_major,
        "limit": 10,
        "context": "education_major_search"
    }
    
    response = safe_api_call_post(url, payload)
    
    if response.get("success"):
        return response.get("data", [])
    return []

# ===== SIMPLIFIED FORMATTING =====

def format_education_timeline(educations: List[Dict], expert_name: str) -> str:
    """Simple education timeline format"""
    if not educations:
        return f"Không tìm thấy thông tin học tập của {expert_name}."
    
    message = f"📚 **Quá trình đào tạo của {expert_name}:**\n\n"
    
    # Sort by year (newest first)
    sorted_educations = sorted(educations, key=lambda x: x.get("year", 0), reverse=True)
    
    for edu in sorted_educations:
        year = edu.get("year", "Không rõ")
        school = edu.get("school", "Không rõ")
        major = edu.get("major", "Không rõ")
        
        message += f"🎓 **{year}**: {school}\n"
        message += f"   📖 Chuyên ngành: {major}\n\n"
    
    return message

def format_experts_by_school(experts_data: List[Dict], school_name: str) -> str:
    """Simple school experts format"""
    if not experts_data:
        return f"Không tìm thấy chuyên gia nào tốt nghiệp từ {school_name}."
    
    message = f"🏫 **Chuyên gia tốt nghiệp từ {school_name}:**\n\n"
    
    for i, expert_data in enumerate(experts_data[:8], 1):
        expert = expert_data.get("expert", {})
        educations = expert_data.get("educations", [])
        
        name = expert.get("fullName", "Không rõ")
        message += f"{i}. **{name}**"
        
        # Find relevant education
        for edu in educations:
            if school_name.lower() in edu.get("school", "").lower():
                major = edu.get("major", "")
                year = edu.get("year", "")
                if major:
                    message += f" - {major}"
                if year:
                    message += f" ({year})"
                break
        
        message += "\n"
    
    if len(experts_data) > 8:
        message += f"\n... *(Còn {len(experts_data) - 8} chuyên gia khác)*"
    
    return message

def format_experts_by_major(experts_data: List[Dict], major: str) -> str:
    """Simple major experts format"""
    if not experts_data:
        return f"Không tìm thấy chuyên gia nào có chuyên ngành {major}."
    
    message = f"📖 **Chuyên gia chuyên ngành {major}:**\n\n"
    
    for i, expert_data in enumerate(experts_data[:8], 1):
        expert = expert_data.get("expert", {})
        educations = expert_data.get("educations", [])
        
        name = expert.get("fullName", "Không rõ")
        message += f"{i}. **{name}**"
        
        # Find relevant education
        for edu in educations:
            if major.lower() in edu.get("major", "").lower():
                school = edu.get("school", "")
                year = edu.get("year", "")
                if school:
                    message += f" - {school}"
                if year:
                    message += f" ({year})"
                break
        
        message += "\n"
    
    if len(experts_data) > 8:
        message += f"\n... *(Còn {len(experts_data) - 8} chuyên gia khác)*"
    
    return message

# ===== 3 REQUIRED ACTIONS ONLY =====

class ActionTraCuuQuaTrinhDaoTao(Action):
    """
    INTENT: hoi_qua_trinh_dao_tao
    ENTITY: expert_name
    """
    def name(self) -> Text:
        return "action_tra_cuu_qua_trinh_dao_tao"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        expert_name = extract_entity(tracker, "expert_name") or extract_entity(tracker, "name")
        
        if not expert_name:
            dispatcher.utter_message(text="Bạn muốn tra cứu quá trình đào tạo của chuyên gia nào?")
            return []
        
        try:
            expert = get_expert_by_name(expert_name)
            if not expert:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
                return [SlotSet("name", expert_name)]
            
            expert_id = expert.get("id")
            educations = get_expert_educations_simple(expert_id)
            
            message = format_education_timeline(educations, expert.get('fullName', expert_name))
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"❌ Education error: {e}")
            dispatcher.utter_message(text="Có lỗi khi tra cứu quá trình đào tạo.")
        
        return [SlotSet("name", expert_name)]

class ActionTraCuuChuyenGiaTheoTruongTotNghiep(Action):
    """
    INTENT: tra_cuu_chuyen_gia_theo_truong_tot_nghiep
    ENTITY: graduated_school
    """
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_truong_tot_nghiep"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        school = (extract_entity(tracker, "graduated_school") or 
                 extract_entity(tracker, "school"))
        
        if not school:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia tốt nghiệp từ trường nào?")
            return []
        
        try:
            experts_data = get_experts_by_school_simple(school)
            message = format_experts_by_school(experts_data, school)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"❌ School search error: {e}")
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo trường.")
        
        return [SlotSet("graduated_school", school)]

class ActionTraCuuChuyenGiaTheoChuyenNganh(Action):
    """
    INTENT: tra_cuu_chuyen_gia_theo_chuyen_nganh
    ENTITY: major
    """
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_chuyen_nganh"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        major = extract_entity(tracker, "major") or extract_entity(tracker, "field")
        
        if not major:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia theo chuyên ngành nào?")
            return []
        
        try:
            experts_data = get_experts_by_major_simple(major)
            message = format_experts_by_major(experts_data, major)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"❌ Major search error: {e}")
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo chuyên ngành.")
        
        return [SlotSet("major", major)]

