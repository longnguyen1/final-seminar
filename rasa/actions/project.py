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

def get_expert_projects_simple(expert_id: int) -> List[Dict]:
    if not expert_id:
        return []
    url = f"{BASE_URL}/rasa/project/expert-project?expertId={expert_id}&limit=5"
    response = safe_api_call_get(url)
    if response and response.get("success"):
        return response.get("data", [])
    return []

def format_project_timeline(projects: List[Dict], expert_name: str) -> str:
    if not projects:
        return f"Không tìm thấy các dự án của chuyên gia {expert_name}."
    
    messages = [f"Các dự án của chuyên gia {expert_name}:"]
    for proj in projects:
        title = proj.get("title", "không rõ")
        status = proj.get("status", "không rõ")
        role = proj.get("role", "không rõ")
        startyear = proj.get("startYear", "không rõ")
        endyear = proj.get("endYear", "không rõ")
        messages.append(
            f"- {title} ({startyear} - {endyear}): Trạng thái: {status}, Vai trò: {role}\n"
        )
    return "\n".join(messages)

class ActionAskProjects(Action):
    def name(self) -> Text:
        return "action_potfolio_project"

    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict]:
        expert_name = extract_context_entity(tracker, "expert_name")
        if not expert_name:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        name_norm = normalizer.normalize_expert_name(expert_name)
        name_canonical = entity_mapper.get_canonical_form(name_norm)

        expert = get_expert_by_name(name_canonical) or get_expert_by_name(name_norm)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia {expert_name}.")
            return []

        expert_id = expert.get("id")
        projects = get_expert_projects_simple(expert_id)
        message = format_project_timeline(projects, expert.get("name", expert_name))
        dispatcher.utter_message(text=message)
        
        return []