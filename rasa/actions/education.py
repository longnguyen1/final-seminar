# rasa/actions/education.py
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

from .context.context_utils import extract_context_entity
from .context.context_normalizer import normalizer
from .context.entity_mapper import entity_mapper
from .utils import get_expert_by_name, safe_api_call_get, safe_api_call_post

BASE_URL = "http://localhost:3000/api"

def get_expert_educations_simple(expert_id: int) -> List[Dict]:
    if not expert_id:
        return []
    url = f"{BASE_URL}/rasa/education/expert-education?expertId={expert_id}&limit=10"
    response = safe_api_call_get(url)
    if response and response.get("success"):
        return response.get("data", [])
    return []

def get_experts_by_school_simple(school_name: str) -> List[Dict]:
    if not school_name:
        return []
    # Chuẩn hóa & mapping
    school_norm = normalizer.normalize_graduated_school(school_name)
    school_canonical = entity_mapper.get_canonical_form(school_norm)
    url = f"{BASE_URL}/rasa/education/by-school"
    payload = {
        "entity_value": school_canonical,
        "context": "education_school_search"
    }
    response = safe_api_call_post(url, payload)
    if response and response.get("success"):
        return response.get("data", []), response.get("total", 0)
    return []

def get_experts_by_major_simple(major: str) -> List[Dict]:
    if not major:
        return []
    # Chuẩn hóa & mapping
    major_norm = normalizer.normalize_major(major)
    major_canonical = entity_mapper.get_canonical_form(major_norm)
    url = f"{BASE_URL}/rasa/education/by-major"
    payload = {
        "entity_value": major_canonical,
        "context": "education_major_search"
    }
    response = safe_api_call_post(url, payload)
    if response and response.get("success"):
        return response.get("data", []), response.get("total", 0)
    return []

def format_education_timeline(educations: List[Dict], expert_name: str) -> str:
    if not educations:
        return f"Không tìm thấy thông tin học tập của {expert_name}."
    message = f"📚 **Quá trình đào tạo của {expert_name}:**\n\n"
    sorted_educations = sorted(educations, key=lambda x: x.get("year", 0), reverse=True)
    for edu in sorted_educations:
        year = edu.get("year", "Không rõ")
        school = edu.get("school", "Không rõ")
        major = edu.get("major", "Không rõ")
        message += f"🎓 **{year}**: {school}\n"
        message += f"   📖 Chuyên ngành: {major}\n\n"
    return message

def format_experts_by_school(experts_data: List[Dict], school_name: str) -> str:
    if not experts_data:
        return f"Không tìm thấy chuyên gia nào tốt nghiệp từ {school_name}."
    message = f"🏫 **Danh sách 10 chuyên gia đầu tiên :**\n\n"
    for i, expert_data in enumerate(experts_data[:10], 1):
        expert = expert_data.get("expert", {})
        educations = expert_data.get("educations", [])
        name = expert.get("fullName", "Không rõ")
        message += f"{i}. **{name}**"
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
    return message

def format_experts_by_major(experts_data: List[Dict], major: str) -> str:
    if not experts_data:
        return f"Không tìm thấy chuyên gia nào có chuyên ngành {major}."
    message = f"📖 ** Danh sách 10 chuyên gia chuyên gia đầu tiên:**\n\n"
    for i, expert_data in enumerate(experts_data[:10], 1):
        expert = expert_data.get("expert", {})
        educations = expert_data.get("educations", [])
        name = expert.get("fullName", "Không rõ")
        message += f"{i}. **{name}**"
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
    return message

class ActionTraCuuQuaTrinhDaoTao(Action):
    def name(self) -> Text:
        return "action_tra_cuu_qua_trinh_dao_tao"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # 1. Extract & chuẩn hóa tên chuyên gia
        expert_name = extract_context_entity(tracker, "expert_name") or extract_context_entity(tracker, "name")
        if not expert_name:
            dispatcher.utter_message(text="Bạn muốn tra cứu quá trình đào tạo của chuyên gia nào?")
            return []
        name_norm = normalizer.normalize_expert_name(expert_name)
        name_canonical = entity_mapper.get_canonical_form(name_norm)
        # 2. Lấy expert theo canonical hoặc chuẩn hóa
        expert = get_expert_by_name(name_canonical) or get_expert_by_name(name_norm)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
            return [SlotSet("name", expert_name)]
        expert_id = expert.get("id")
        educations = get_expert_educations_simple(expert_id)
        message = format_education_timeline(educations, expert.get('fullName', expert_name))
        dispatcher.utter_message(text=message)
        return [SlotSet("name", expert_name)]

class ActionTraCuuChuyenGiaTheoTruongTotNghiep(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_truong_tot_nghiep"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        school = extract_context_entity(tracker, "graduated_school") or extract_context_entity(tracker, "school")
        if not school:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia tốt nghiệp từ trường nào?")
            return []
        school_norm = normalizer.normalize_graduated_school(school)
        school_canonical = entity_mapper.get_canonical_form(school_norm)
        experts_data, total = get_experts_by_school_simple(school_canonical)
        if not experts_data:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào tốt nghiệp từ trường {school_canonical}.\n\n")
            return [SlotSet("graduated_school", school_canonical)]
        message = f"🏫 Có tổng cộng {total} chuyên gia tốt nghiệp từ {school_canonical}.\n\n"
        message += format_experts_by_school(experts_data, school_canonical)
        dispatcher.utter_message(text=message)
        return [SlotSet("graduated_school", school_canonical)]

class ActionTraCuuChuyenGiaTheoChuyenNganh(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_chuyen_nganh"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # 1. Extract & chuẩn hóa chuyên ngành
        major = extract_context_entity(tracker, "major") or extract_context_entity(tracker, "field")
        if not major:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia theo chuyên ngành nào?")
            return []
        major_norm = normalizer.normalize_major(major)
        major_canonical = entity_mapper.get_canonical_form(major_norm)
        experts_data, total = get_experts_by_major_simple(major_canonical)
        if not experts_data:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào có chuyên ngành {major_canonical}.\n\n")
            return [SlotSet("major", major_canonical)]
        message = f"📖 Có tổng cộng {total} chuyên gia chuyên ngành {major_canonical}.\n\n"
        message += format_experts_by_major(experts_data, major_canonical)
        dispatcher.utter_message(text=message)
        return [SlotSet("major", major_canonical)]
