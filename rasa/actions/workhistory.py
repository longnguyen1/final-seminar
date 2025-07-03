from typing import Any, Text, Dict, List
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
    
    # EXISTING ROUTE: GET /api/experts/[id]/workHistories
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

class ActionTraCuuLichSuLamViec(Action):
    """Action to retrieve and format work history of an expert."""
    
    def name(self) -> Text:
        return "action_tra_cuu_lich_su_lam_viec"

    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        expert_name = extract_context_entity(tracker, "expert_name")
        if not expert_name:
            dispatcher.utter_message(text="Xin vui lòng cung cấp tên chuyên gia.")
            return []
        name_norm = normalizer.normalize_expert_name(expert_name)
        name_canonical = entity_mapper.get_canonical_form(name_norm)

        expert = get_expert_by_name(name_canonical) or get_expert_by_name(name_norm)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia với tên '{expert_name}'.")
            return [SlotSet("expert_name", expert_name)]
        experet_id = expert.get("id")
        workhistories = get_expert_workhistories_simple(experet_id)
        message = format_workhistory_timeline(workhistories, expert.get('fullName', expert_name))
        dispatcher.utter_message(text=message)
        return [SlotSet("name", expert_name)]