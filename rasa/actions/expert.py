from typing import Any, Dict, List, Text, Optional
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

from .context.context_utils import extract_context_entity
from .context.context_normalizer import normalizer
from .context.entity_mapper import entity_mapper
from .utils import get_expert_by_name, format_expert_detail, format_expert_list, safe_api_call_get, safe_api_call_post

def get_experts_by_organization_simple(organization: str) -> List[Dict]:
    if not organization:
        return []
    org_norm = normalizer.normalize_current_workplace(organization)
    org_canonical = entity_mapper.get_canonical_form(org_norm)
    url = f"http://localhost:3000/api/rasa/experts/by-organization"
    payload = {
        "entity_value": org_canonical,
        "context": "organization_search"
    }
    response = safe_api_call_post(url, payload)
    if response and response.get("success"):
        return response.get("data", []), response.get("total", 0)
    return []

def get_experts_by_degree_simple(degree: str) -> List[Dict]:
    if not degree:
        return []
    degree_norm = normalizer.normalize_degree(degree)
    degree_canonical = entity_mapper.get_canonical_form(degree_norm)
    url = f"http://localhost:3000/api/rasa/experts/by-degree"
    payload = {
        "entity_value": degree_canonical,
        "context": "degree_search"
    }
    response = safe_api_call_post(url, payload)
    if response and response.get("success"):
        return response.get("data", []), response.get("total", 0)
    return []

def get_experts_by_academic_title_simple(title: str) -> List[Dict]:
    if not title:
        return []
    title_norm = normalizer.normalize_academic_title(title)
    title_canonical = entity_mapper.get_canonical_form(title_norm)
    url = f"http://localhost:3000/api/rasa/experts/by-academic-title"
    payload = {
        "entity_value": title_canonical,
        "context": "academic_title_search"
    }
    response = safe_api_call_post(url, payload)
    if response and response.get("success"):
        return response.get("data", []), response.get("total", 0)
    return []

def format_expert_by_organization(experts: List[Dict], organization: str) -> str:
    if not experts:
        return f"Không tìm thấy chuyên gia nào thuộc đơn vị {organization}."
    message = f"🏢 **Danh sách 10 chuyên gia thuộc đơn vị {organization}:**\n\n"
    for i, expert in enumerate(experts[:10], 1):
        name = expert.get("fullName", "Không rõ")
        position = expert.get("position", "Không rõ")
        message += f"{i}. {name} - {position}\n"
    return message

def format_expert_by_degree(experts: List[Dict], degree: str) -> str:
    if not experts:
        return f"Không tìm thấy chuyên gia nào có học vị {degree}."
    message = f"🎓 **Danh sách 10 chuyên gia có học vị {degree}:**\n\n"
    for i, expert in enumerate(experts[:10], 1):
        name = expert.get("fullName", "Không rõ")
        position = expert.get("position", "Không rõ")
        message += f"{i}. {name} - {position}\n"
    return message

def format_expert_by_academic_title(experts: List[Dict], title: str) -> str:
    if not experts:
        return f"Không tìm thấy chuyên gia nào có học hàm {title}."
    message = f"🏅 **Danh sách 10 chuyên gia có học hàm {title}:**\n\n"
    for i, expert in enumerate(experts[:10], 1):
        name = expert.get("fullName", "Không rõ")
        position = expert.get("position", "Không rõ")
        message += f"{i}. {name} - {position}\n"
    return message

class ActionTraCuuChuyenGia(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_name = extract_context_entity(tracker, "expert_name", "name")
        if not raw_name:
            dispatcher.utter_message("Bạn vui lòng cung cấp tên chuyên gia cần tra cứu.")
            return []
        name_norm = normalizer.normalize_expert_name(raw_name)
        name_canonical = entity_mapper.get_canonical_form(name_norm)
        expert = get_expert_by_name(name_canonical) or get_expert_by_name(name_norm)
        if not expert:
            dispatcher.utter_message(f"Không tìm thấy chuyên gia tên {raw_name}.")
            return []
        message = format_expert_detail(expert)
        dispatcher.utter_message(message)
        return [SlotSet("expert_name", name_norm)]

class ActionTraCuuChuyenGiaTheoDonVi(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_don_vi"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_org = extract_context_entity(tracker, "current_workplace", "organization")
        print(f"[DEBUG] Raw organization input: {raw_org}")
        if not raw_org:
            dispatcher.utter_message("Bạn vui lòng cung cấp tên đơn vị cần tra cứu.")
            return []
        org_norm = normalizer.normalize_current_workplace(raw_org)
        print(f"[DEBUG] Normalized organization: {org_norm}")
        org_canonical = entity_mapper.get_canonical_form(org_norm)
        print(f"[DEBUG] Canonical organization: {org_canonical}")
        experts_data , total = get_experts_by_organization_simple(org_canonical)
        if not experts_data:
            dispatcher.utter_message(f"Không tìm thấy chuyên gia thuộc đơn vị {org_canonical}.")
            return []
        message = f"🏢 Có tổng cộng {total} chuyên gia thuộc đơn vị {raw_org}.\n\n"
        message += format_expert_by_organization(experts_data, org_canonical)
        dispatcher.utter_message(message)
        return [SlotSet("current_workplace", org_canonical)]

class ActionTraCuuChuyenGiaTheoHocVi(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_hoc_vi"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_degree = extract_context_entity(tracker, "degree")
        if not raw_degree:
            dispatcher.utter_message("Bạn vui lòng cung cấp học vị cần tra cứu.")
            return []
        degree_norm = normalizer.normalize_degree(raw_degree)
        degree_canonical = entity_mapper.get_canonical_form(degree_norm)
        experts_data, total = get_experts_by_degree_simple(degree_canonical)
        if not experts_data:
            dispatcher.utter_message(f"Không tìm thấy chuyên gia có học vị {degree_canonical}.")
            return [SlotSet(experts_data, degree_canonical)]
        message = f"🎓 Có tổng cộng {total} chuyên gia có học vị {degree_canonical}.\n\n"
        message += format_expert_by_degree(experts_data, degree_canonical)
        dispatcher.utter_message(message)
        return [SlotSet("degree", degree_canonical)]

class ActionTraCuuChuyenGiaTheoHocHam(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_hoc_ham"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_title = extract_context_entity(tracker, "academic_title", "academic-title")
        if not raw_title:
            dispatcher.utter_message("Bạn vui lòng cung cấp học hàm cần tra cứu.")
            return []
        title_norm = normalizer.normalize_academic_title(raw_title)
        title_canonical = entity_mapper.get_canonical_form(title_norm)
        print(f"[DEBUG] Normalized academic title: {title_norm}")
        print(f"[DEBUG] Canonical academic title: {title_canonical}")
        experts, total = get_experts_by_academic_title_simple(title_canonical)
        if not experts:
            dispatcher.utter_message(f"Không tìm thấy chuyên gia có học hàm {title_canonical}.")
            return []
        message = f"🏅 Có tổng cộng {total} chuyên gia có học hàm {title_canonical}.\n\n"
        message += format_expert_by_academic_title(experts, title_canonical)
        dispatcher.utter_message(message)
        return [SlotSet("academic_title", title_canonical)]





