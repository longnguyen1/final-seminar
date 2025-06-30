from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

BASE_URL = "http://localhost:3000/api"

class ActionTraCuuNgoaiNgu(Action):

    def name(self) -> Text:
        return "action_tra_cuu_ngoai_ngu"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = next(tracker.get_latest_entity_values("name"), None)
        print("Expert name:", expert_name)
        if expert_name:
            res = requests.get(f"{BASE_URL}/experts/search-all?name={expert_name}")
            data = res.json()
            if not data or not isinstance(data, dict) or not data.get("experts"):
                dispatcher.utter_message(response="utter_Khong_tim_thay_chuyen_gia")
                return []
            expert = data["experts"][0]
            expert_id = expert["id"]
            name = expert["fullName"]
        else:
            expert_id = tracker.get_slot("expert_id")
            name = tracker.get_slot("expert_name")
            if not expert_id:
                dispatcher.utter_message(text="Bạn vui lòng cung cấp tên chuyên gia.")
                return []

        lang_res = requests.get(f"{BASE_URL}/languages/by-expert-id?id={expert_id}")
        if lang_res.status_code != 200:
            dispatcher.utter_message(response="utter_Khong_tim_thay_ngoai_ngu")
            return []
        languages = lang_res.json()
        if not languages or not isinstance(languages, list):
            dispatcher.utter_message(response="utter_Khong_tim_thay_ngoai_ngu")
            return []

        # Debugging information
        print("Expert name:", expert_name)
        print("Expert ID:", expert_id)
        print("API trả về:", languages)

        # Hiển thị đầy đủ các kỹ năng
        lang_text = ""
        for l in languages:
            lang_text += f"- {l.get('language', 'Không rõ')}"
            skills = []
            if l.get('listening'): skills.append(f"Nghe: {l['listening']}")
            if l.get('speaking'): skills.append(f"Nói: {l['speaking']}")
            if l.get('reading'): skills.append(f"Đọc: {l['reading']}")
            if l.get('writing'): skills.append(f"Viết: {l['writing']}")
            if skills:
                lang_text += " (" + ", ".join(skills) + ")"
            lang_text += "\n"

        dispatcher.utter_message(text=f"Chuyên gia {name} sử dụng các ngoại ngữ sau:\n{lang_text}")

        return [SlotSet("expert_id", expert_id), SlotSet("expert_name", name)]
