"""
Language skills search actions for Rasa chatbot
"""
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

from .utils import (
    extract_entity,
    safe_api_call,
    get_expert_by_name,
    BASE_URL
)

class ActionTraCuuNgoaiNgu(Action):
    def name(self) -> Text:
        return "action_tra_cuu_ngoai_ngu"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            dispatcher.utter_message(text="Xin lỗi, tôi cần biết tên chuyên gia để tra cứu ngoại ngữ.")
            return []

        expert = get_expert_by_name(expert_name)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia tên {expert_name}.")
            return []

        expert_id = expert.get("id")
        response = safe_api_call(f"{BASE_URL}/languages/by-expert-id?id={expert_id}")
        
        if response and response.get("data"):
            languages = response["data"]
            if languages:
                message = f"Thông tin ngoại ngữ của {expert_name}:\n\n"
                for lang in languages:
                    message += f"🌍 Ngôn ngữ: {lang.get('language', 'N/A')}\n"
                    message += f"👂 Nghe: {lang.get('listening', 'N/A')}\n"
                    message += f"🗣️ Nói: {lang.get('speaking', 'N/A')}\n"
                    message += f"📖 Đọc: {lang.get('reading', 'N/A')}\n"
                    message += f"✍️ Viết: {lang.get('writing', 'N/A')}\n\n"
            else:
                message = f"{expert_name} chưa có thông tin ngoại ngữ."
        else:
            message = "Không thể lấy thông tin ngoại ngữ."
            
        dispatcher.utter_message(text=message)
        return []

class ActionTraCuuChuyenGiaTheoNgoaiNgu(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_ngoai_ngu"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        language = extract_entity(tracker, "language")
        if not language:
            dispatcher.utter_message(text="Xin lỗi, tôi cần biết ngôn ngữ để tìm chuyên gia.")
            return []

        response = safe_api_call(f"{BASE_URL}/experts/by-language?language={language}")
        
        if response and response.get("data"):
            experts = response["data"]
            if experts:
                count = len(experts)
                message = f"Tìm thấy {count} chuyên gia biết {language}:\n\n"
                for expert in experts[:5]:
                    name = expert.get("fullName", "N/A")
                    org = expert.get("organization", "N/A")
                    message += f"👨‍🏫 {name}\n🏢 {org}\n\n"
                if count > 5:
                    message += f"... và {count - 5} chuyên gia khác."
            else:
                message = f"Không tìm thấy chuyên gia biết {language}."
        else:
            message = "Không thể tìm kiếm chuyên gia."
            
        dispatcher.utter_message(text=message)
        return []

class ActionTraCuuChuyenGiaTheoTrinhDoNgoaiNgu(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_trinh_do_ngoai_ngu"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        language_level = extract_entity(tracker, "language_level")
        if not language_level:
            dispatcher.utter_message(text="Xin lỗi, tôi cần biết trình độ ngoại ngữ để tìm chuyên gia.")
            return []

        response = safe_api_call(f"{BASE_URL}/experts/by-language-level?level={language_level}")
        
        if response and response.get("data"):
            experts = response["data"]
            if experts:
                count = len(experts)
                message = f"Tìm thấy {count} chuyên gia có trình độ ngoại ngữ {language_level}:\n\n"
                for expert in experts[:5]:
                    name = expert.get("fullName", "N/A")
                    org = expert.get("organization", "N/A")
                    message += f"👨‍🏫 {name}\n🏢 {org}\n\n"
                if count > 5:
                    message += f"... và {count - 5} chuyên gia khác."
            else:
                message = f"Không tìm thấy chuyên gia có trình độ {language_level}."
        else:
            message = "Không thể tìm kiếm chuyên gia."
            
        dispatcher.utter_message(text=message)
        return []
