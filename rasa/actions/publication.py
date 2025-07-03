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

def get_expert_publications_simple(expert_id: int) -> List[Dict]:
    if not expert_id:
        return []
    url = f"{BASE_URL}/rasa/publication/expert_publication?expertId={expert_id}&limit=5"
    response = safe_api_call_get(url)
    if response and response.get("success"):
        return response.get("data", [])
    return []

def format_publication_timeline(publications: List[Dict], expert_name: str) -> str:
    if not publications:
        return f"Không tìm thấy các công trình nghiên cứu của chuyên gia {expert_name}."
    
    messages = [f"Các công trình nghiên cứu của chuyên gia {expert_name}:"]
    for pub in publications:
        type = pub.get("type", "không rõ")
        year = pub.get("year", "không rõ")
        title = pub.get("title", "không rõ")
        type = pub.get("type", "không rõ")
        author = pub.get("author", "không rõ")
        place = pub.get("place", "không rõ")
        messages.append(f"- {type} ({year}): {title} - Tác giả: {author}, Nơi xuất bản: {place}\n")
    return "\n".join(messages)
        
class ActionLietKeCongTrinhKhoaHoc(Action):
    def name(self) -> Text:
        return "action_liet_ke_cong_trinh_khoa_hoc"

    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict]:
        expert_name = extract_context_entity(tracker, "expert_name")
        if not expert_name:
            dispatcher.utter_message(text="Vui lòng cung cấp tên chuyên gia.")
            return []
        name_norm = normalizer.normalize_expert_name(expert_name)
        name_canonical = entity_mapper.get_canonical_form(name_norm)

        expert = get_expert_by_name(name_canonical) or get_expert_by_name(name_norm)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia {expert_name}.")
            return []

        expert_id = expert.get("id")
        publications = get_expert_publications_simple(expert_id)
        message = format_publication_timeline(publications, expert.get("name", expert_name))
        dispatcher.utter_message(text=message)
        return [SlotSet("expert_name", expert_name)]