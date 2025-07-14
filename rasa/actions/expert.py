from typing import Any, Dict, List, Text, Optional, Tuple
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

import urllib

from .context.context_utils import extract_context_entity
from .context.context_normalizer import normalizer
from .context.entity_mapper import entity_mapper
from .utils import safe_api_call_get

BASE_URL = "http://localhost:3000/api"


def search_experts(
    name: Optional[str] = None,
    organization: Optional[str] = None,
    degree: Optional[str] = None,
    academic_title: Optional[str] = None,
    limit: int = 10,
    offset: int = 0
) -> Tuple[List[Dict], int]:
    """Tìm kiếm chuyên gia theo nhiều tiêu chí."""
    params = {}
    if name:
        params["name"] = name
    if organization:
        params["organization"] = organization
    if degree:
        params["degree"] = degree
    if academic_title:
        params["academicTitle"] = academic_title
    params["limit"] = limit
    params["offset"] = offset

    url = f"{BASE_URL}/experts/search-all?" + urllib.parse.urlencode(params)
    response = safe_api_call_get(url)
    if response and response.get("success"):
        return response.get("experts", []), response.get("total", 0)
    return [], 0

def safe_value(val):
    return val if val not in [None, ""] else "Không rõ"

def format_expert_info(expert: Dict) -> str:
    if not expert:
        return "Không tìm thấy thông tin chuyên gia."
    
    name = safe_value(expert.get("fullName"))
    position = safe_value(expert.get("position"))
    organization = safe_value(expert.get("organization"))
    degree = safe_value(expert.get("degree"))
    academic_title = safe_value(expert.get("academicTitle"))
    email = safe_value(expert.get("email"))
    phone = safe_value(expert.get("phone"))
    
    message = f"👤 **Thông tin chuyên gia:**\n\n"
    message += f"**Tên:** {name}\n"
    message += f"**Chức vụ:** {position}\n"
    message += f"**Đơn vị công tác:** {organization}\n"
    message += f"**Học vị:** {degree}\n"
    message += f"**Học hàm:** {academic_title}\n"
    message += f"**Email:** {email}\n"
    message += f"**Số điện thoại:** {phone}\n"
    return message

def format_expert_by_organization(experts: List[Dict], organization: str) -> str:
    if not experts:
        return f"Không tìm thấy chuyên gia nào thuộc đơn vị {organization}."
    message = f"🏢 **Danh sách 10 chuyên gia thuộc đơn vị {organization}:**\n\n"
    for i, expert in enumerate(experts[:10], 1):
        name = expert.get("fullName", "Không rõ")
        email = expert.get("email", "Không rõ")
        phone = expert.get("phone", "Không rõ")
        message += f"{i}. {name} - Email: {email}, SĐT: {phone}\n"
    return message

def format_expert_by_degree(experts: List[Dict], degree: str) -> str:
    if not experts:
        return f"Không tìm thấy chuyên gia nào có học vị {degree}."
    message = f"🎓 **Danh sách 10 chuyên gia có học vị {degree}:**\n\n"
    for i, expert in enumerate(experts[:10], 1):
        name = expert.get("fullName", "Không rõ")
        email = expert.get("email", "Không rõ")
        phone = expert.get("phone", "Không rõ")
        message += f"{i}. {name} - Email: {email}, SĐT: {phone}\n"
    return message

def format_expert_by_academic_title(experts: List[Dict], title: str) -> str:
    if not experts:
        return f"Không tìm thấy chuyên gia nào có học hàm {title}."
    message = f"🏅 **Danh sách 10 chuyên gia có học hàm {title}:**\n\n"
    for i, expert in enumerate(experts[:10], 1):
        name = expert.get("fullName", "Không rõ")
        email = expert.get("email", "Không rõ")
        phone = expert.get("phone", "Không rõ")
        message += f"{i}. {name} - Email: {email}, SĐT: {phone}\n"
    return message

class ActionPotfolioExpert(Action):
    def name(self) -> Text:
        return "action_potfolio_expert"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_name = extract_context_entity(tracker, "expert_name")
        if not raw_name:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        name_norm = normalizer.normalize_expert_name(raw_name)
        name_canonical = entity_mapper.get_canonical_form(name_norm)
        experts, total = search_experts(expert_name = name_canonical)
        expert = experts[0] if experts else None
        if not expert:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        message = format_expert_info(expert)
        dispatcher.utter_message(message)
        return [SlotSet("expert_name", name_norm)]

class ActionListExpertsByCurrentWorkplace(Action):
    def name(self) -> Text:
        return "action_list_experts_by_current_workplace"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_current_workplace = extract_context_entity(tracker, "current_workplace")
        
        if not raw_current_workplace:
            dispatcher.utter_message(response= "utter_ask_current_workplace")
            return []

        # Bước 1: Chuẩn hóa và ánh xạ chính tắc
        current_workplace_norm = normalizer.normalize_current_workplace(raw_current_workplace)
        current_workplace_canonical = entity_mapper.get_canonical_form(current_workplace_norm)

        # Bước 2: Thử tìm kiếm với giá trị chính tắc
        experts, total = search_experts(organization = current_workplace_canonical)

        if not experts:
            # Nếu không tìm thấy, thử tìm gợi ý gần đúng
            all_known_workplaces = list(normalizer.INSTITUTION_MAP.values()) # Lấy tất cả các giá trị chuẩn tắc từ map
            
            # Chỉ lấy các giá trị duy nhất
            unique_known_workplaces = list(set(all_known_workplaces))

            best_match = entity_mapper.find_best_match(current_workplace_norm, unique_known_workplaces, threshold=0.7)
            
            if best_match:
                # Gợi ý cho người dùng giá trị gần đúng nhất
                dispatcher.utter_message(text=f"Tôi không tìm thấy chuyên gia làm việc tại '{raw_current_workplace}'. Bạn có muốn tìm chuyên gia làm việc tại '{best_match}' không?")
                # Đặt slot tạm thời hoặc một cờ để bot biết người dùng đang được hỏi xác nhận
                return [SlotSet("proposed_current_workplace", best_match), SlotSet("original_current_workplace", raw_current_workplace)]
            else:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào đang làm việc tại '{raw_current_workplace}'. Vui lòng cung cấp một đơn vị khác.")
                return []
        
        # Nếu tìm thấy chuyên gia
        message = f"🏢 Có tổng cộng {len(experts)} chuyên gia đang làm việc tại {current_workplace_canonical}.\n\n"
        message += format_expert_by_organization(experts, current_workplace_canonical) # Sử dụng format_expert_list từ utils.py
        dispatcher.utter_message(text=message)
        return [
            SlotSet("current_workplace", current_workplace_canonical),
            SlotSet("expert_search_result", experts)  # Lưu danh sách chuyên gia vào slot
        ]


# ----- Cải thiện ActionListExpertsByDegree -----
class ActionListExpertsByDegree(Action):
    def name(self) -> Text:
        return "action_list_experts_by_degree"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_degree = extract_context_entity(tracker, "degree")
        if not raw_degree:
            dispatcher.utter_message(response="utter_ask_degree")
            return []
        
        # Bước 1: Chuẩn hóa và ánh xạ chính tắc
        degree_norm = normalizer.normalize_degree(raw_degree)
        degree_canonical = entity_mapper.get_canonical_form(degree_norm)

        # Bước 2: Thử tìm kiếm với giá trị chính tắc
        experts, total = search_experts(degree = degree_canonical)

        if not experts:
            # Nếu không tìm thấy, thử tìm gợi ý gần đúng
            all_known_degrees = list(normalizer.DEGREE_MAP.values())
            unique_known_degrees = list(set(all_known_degrees))

            best_match = entity_mapper.find_best_match(degree_norm, unique_known_degrees, threshold=0.7)
            
            if best_match:
                dispatcher.utter_message(text=f"Tôi không tìm thấy chuyên gia có học vị '{raw_degree}'. Bạn có muốn tìm chuyên gia có học vị '{best_match}' không?")
                return [SlotSet("proposed_degree", best_match), SlotSet("original_degree", raw_degree)]
            else:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có học vị '{raw_degree}'. Vui lòng cung cấp một học vị khác.")
                return []

        # Nếu tìm thấy chuyên gia
        message = f"🎓 Có tổng cộng {len(experts)} chuyên gia có học vị {degree_canonical}.\n\n"
        message += format_expert_by_degree(experts, degree_canonical)
        dispatcher.utter_message(message)
        return [
            SlotSet("degree", degree_canonical),
            SlotSet("expert_search_result", experts)  # Lưu danh sách chuyên gia vào slot
        ]

# ----- Cải thiện ActionListExpertsByAcademicTitle -----
class ActionListExpertsByAcademicTitle(Action):
    def name(self) -> Text:
        return "action_list_experts_by_academic_title"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_academic_title = extract_context_entity(tracker, "academic_title")
        if not raw_academic_title:
            dispatcher.utter_message(response="utter_ask_academic_title")
            return []
        
        # Bước 1: Chuẩn hóa và ánh xạ chính tắc
        academic_title_norm = normalizer.normalize_academic_title(raw_academic_title)
        academic_title_canonical = entity_mapper.get_canonical_form(academic_title_norm)

        # Bước 2: Thử tìm kiếm với giá trị chính tắc
        experts, total = search_experts(academic_title = academic_title_canonical)

        if not experts:
            # Nếu không tìm thấy, thử tìm gợi ý gần đúng
            all_known_titles = list(normalizer.ACADEMIC_TITLE_MAP.values()) # Đảm bảo bạn có map này trong context_normalizer
            unique_known_titles = list(set(all_known_titles))

            best_match = entity_mapper.find_best_match(academic_title_norm, unique_known_titles, threshold=0.7)
            
            if best_match:
                dispatcher.utter_message(text=f"Tôi không tìm thấy chuyên gia có học hàm '{raw_academic_title}'. Bạn có muốn tìm chuyên gia có học hàm '{best_match}' không?")
                return [SlotSet("proposed_academic_title", best_match), SlotSet("original_academic_title", raw_academic_title)]
            else:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có học hàm '{raw_academic_title}'. Vui lòng cung cấp một học hàm khác.")
                return []

        # Nếu tìm thấy chuyên gia
        message = f"🏅 Có tổng cộng {len(experts)} chuyên gia có học hàm {academic_title_canonical}.\n\n"
        message += format_expert_by_academic_title(experts, academic_title_canonical)
        dispatcher.utter_message(message)
        return [
            SlotSet("academic_title", academic_title_canonical),
            SlotSet("expert_search_result", experts)  # Lưu danh sách chuyên gia vào slot
        ]





