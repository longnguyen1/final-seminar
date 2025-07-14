from typing import Any, Text, Dict, List, Tuple
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import urllib.parse

# Import context utilities
from .context.context_utils import extract_context_entity
from .context.context_normalizer import normalizer
from .context.entity_mapper import entity_mapper
from .utils import get_expert_by_name, safe_api_call_get, safe_api_call_post

BASE_URL = "http://localhost:3000/api"

def get_expert_workhistories_simple(expert_id: int) -> List[Dict]:
    """EXISTING ROUTE: Individual expert work history"""
    if not expert_id:
        return []
    
    # EXISTING ROUTE: GET /api/rasa/workhistory/expert-workhistory
    url = f"{BASE_URL}/rasa/workhistory/expert-workhistory?expertId={expert_id}&limit=10"
    response = safe_api_call_get(url)
    if response and response.get("success"):
        return response.get("data", [])
    return []

def format_workhistory_timeline(workhistories: List[Dict], expert_name: str) -> str:
    """Format work history into a timeline string."""
    if not workhistories:
        return f"Không tìm thấy lịch sử làm việc cho {expert_name}."
    
    messages = [f"Lịch sử làm việc của {expert_name}:\n"]
    for wh in workhistories:
        position = wh.get("position", "Vị trí không rõ")
        workplace = wh.get("workplace", "Nơi làm việc không rõ")
        start_year = wh.get("startYear", "Năm bắt đầu không rõ")
        end_year = wh.get("endYear", "Năm kết thúc không rõ")
        messages.append(f"- {position} tại {workplace} ({start_year} - {end_year})\n")
    return "".join(messages)

def get_experts_by_position_and_workplace(position: str, workplace: str, mode: str = "and") -> Tuple[List[Dict], int]:
    """Gọi API tìm chuyên gia theo position và/or workplace."""
    url = f"{BASE_URL}/rasa/workhistory/by_position_workplace"
    payload = {
        "position": position or "",
        "workplace": workplace or "",
        "limit": 10,
        "offset": 0,
        "mode": mode
    }
    print(f"[DEBUG] Calling API: {url} with payload: {payload}")
    response = safe_api_call_post(url, payload)
    print(f"[DEBUG] API response: {response}")
    if response and response.get("success"):
        return response.get("data", []), response.get("total", 0)
    return [], 0

def format_experts_by_position_workplace(experts: List[Dict], position: str, workplace: str) -> str:
    if not experts:
        if position and workplace:
            return f"Không tìm thấy chuyên gia nào từng làm {position} ở {workplace}."
        elif position:
            return f"Không tìm thấy chuyên gia nào từng làm vị trí {position}."
        elif workplace:
            return f"Không tìm thấy chuyên gia nào từng làm ở {workplace}."
        else:
            return "Không tìm thấy chuyên gia phù hợp."
    message = "🔎 **Danh sách chuyên gia phù hợp:**\n"
    for i, item in enumerate(experts[:10], 1):
        expert = item.get("expert", {})
        name = expert.get("fullName", "Không rõ")
        degree = expert.get("degree", "")
        work_histories = item.get("workHistories", [])
        # Lấy vị trí và nơi làm việc đầu tiên (nếu có)
        if work_histories:
            wh = work_histories[0]
            pos = wh.get("position", "")
            workplace_ = wh.get("workplace", "")
            field = wh.get("field", "")
            message += f"{i}. {name} ({degree}) - {pos} tại {workplace_}"
            if field:
                message += f" - {field}"
        else:
            message += f"{i}. {name} ({degree})"
        message += "\n"
    return message

class ActionAskWorkHistory(Action):
    """Action to retrieve and format work history of an expert."""
    
    def name(self) -> Text:
        return "action_potfolio_workhistory"

    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        expert_name = extract_context_entity(tracker, "expert_name")
        if not expert_name:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        name_norm = normalizer.normalize_expert_name(expert_name)
        name_canonical = entity_mapper.get_canonical_form(name_norm)

        expert = get_expert_by_name(name_canonical) or get_expert_by_name(name_norm)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia với tên '{expert_name}'.")
            return [SlotSet("expert_name", expert_name)]
        expert_id = expert.get("id")
        workhistories = get_expert_workhistories_simple(expert_id)
        message = format_workhistory_timeline(workhistories, expert.get('fullName', expert_name))
        dispatcher.utter_message(text=message)
        return [SlotSet("expert_name", expert_name)]
    
class ActionListExpertsByPositionAndOrPreviousWorkplace(Action):
    def name(self) -> Text:
        return "action_list_experts_by_position_and_or_previous_workplace"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Lấy dữ liệu từ slot do form đã điền
        position_canonical = tracker.get_slot("position")
        workplace_canonical = tracker.get_slot("previous_workplace")

        # Xác định mode tìm kiếm
        if position_canonical and workplace_canonical:
            mode = "and"
        elif position_canonical:
            mode = "position"
        elif workplace_canonical:
            mode = "workplace"
        else:
            dispatcher.utter_message(response="utter_ask_position_or_workplace")
            return []

        # Gọi API truy vấn
        experts, total = get_experts_by_position_and_workplace(position_canonical, workplace_canonical, mode)

        if not experts:
            dispatcher.utter_message(text="Không tìm thấy chuyên gia với các tiêu chí bạn đã cung cấp. Vui lòng thử lại với thông tin khác.")
            return []

        # Format và trả kết quả
        search_criteria_text = ""
        if position_canonical and workplace_canonical:
            search_criteria_text = f"vị trí {position_canonical} và từng làm việc tại {workplace_canonical}"
        elif position_canonical:
            search_criteria_text = f"vị trí {position_canonical}"
        elif workplace_canonical:
            search_criteria_text = f"từng làm việc tại {workplace_canonical}"

        message = f"📚 Có tổng cộng {total} chuyên gia {search_criteria_text}.\n\n"
        message += format_experts_by_position_workplace(experts, position_canonical, workplace_canonical)
        dispatcher.utter_message(text=message)
        return [SlotSet("position", position_canonical), SlotSet("previous_workplace", workplace_canonical)]