from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

BASE_URL = "http://localhost:3000/api"

class ActionTraCuuLichSuLamViec(Action):
    def name(self) -> Text:
        return "action_tra_cuu_lich_su_lam_viec"

    def extract_name(self, tracker: Tracker) -> Text:
        entities = tracker.latest_message.get("entities", [])
        for entity in entities:
            if entity.get("entity") == "name":
                return entity.get("value")
        return tracker.get_slot("name")

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        expert_name = self.extract_name(tracker)
        if not expert_name:
            dispatcher.utter_message(response="utter_hoi_chuyen_gia")
            return []
        try:
            # Lấy expertId từ tên chuyên gia
            res = requests.get(f"{BASE_URL}/experts/search-all?name={expert_name}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message("Không tìm thấy chuyên gia này.")
                return [SlotSet("name", expert_name)]
            data = res.json()
            experts = data.get("experts", [])
            if not experts or not isinstance(experts, list):
                dispatcher.utter_message("Không tìm thấy chuyên gia này.")
                return [SlotSet("name", expert_name)]
            expert = experts[0]
            expert_id = expert.get("id")
            if not expert_id:
                dispatcher.utter_message("Không tìm thấy chuyên gia này.")
                return [SlotSet("name", expert_name)]

            # Lấy lịch sử làm việc theo expertId
            api_url = f"{BASE_URL}/workHistories/by-expert-id?id={expert_id}"
            response = requests.get(api_url)
            if response.status_code != 200 or not response.text.strip():
                dispatcher.utter_message("Không tìm thấy thông tin lịch sử làm việc.")
                return [SlotSet("name", expert_name)]
            try:
                work_data = response.json()
            except Exception:
                dispatcher.utter_message("Kết quả trả về không hợp lệ hoặc không phải JSON.")
                return [SlotSet("name", expert_name)]
            if not work_data:
                dispatcher.utter_message(response="utter_Khong_tim_thay_lich_su_lam_viec")
                return [SlotSet("name", expert_name)]

            message = f"✅ Lịch sử làm việc của chuyên gia {expert_name}:\n"
            for work in work_data:
                start = work.get("startYear", "Chưa rõ")
                end = work.get("endYear", "Chưa rõ")
                position = work.get("position", "Chưa rõ")
                workplace = work.get("workplace", "Chưa rõ")
                message += f"- {workplace} ({position}, {start} - {end})\n"
            dispatcher.utter_message(text=message)
            return [SlotSet("name", expert_name)]
        except Exception as e:
            dispatcher.utter_message(text=f"Đã có lỗi khi tra cứu lịch sử làm việc: {str(e)}")
            return []

class ActionTraCuuChuyenGiaTheoNoiLamViec(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_noi_lam_viec"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        workplaces = list(tracker.get_latest_entity_values("workplace"))
        workplace = " - ".join(workplaces) if workplaces else None
        if not workplace:
            dispatcher.utter_message(response="utter_hoi_noi_lam_viec")
            return []
        try:
            # Lấy danh sách workhistory có nơi làm việc phù hợp
            res = requests.get(f"{BASE_URL}/experts/by-workplace?workplace={workplace}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message("Không tìm thấy chuyên gia làm việc tại nơi này.")
                return [SlotSet("workplace", workplace)]
            try:
                work_data = res.json()
            except Exception:
                dispatcher.utter_message("Kết quả trả về không hợp lệ hoặc không phải JSON.")
                return [SlotSet("workplace", workplace)]
            if not work_data:
                dispatcher.utter_message(response="utter_Khong_tim_thay_noi_lam_viec")
                return [SlotSet("workplace", workplace)]

            message = f"✅ Danh sách chuyên gia từng làm việc tại {workplace}:\n"
            for expert in work_data:
                name = expert.get("fullName", "Không rõ")
                # Nếu có thể, lấy thêm các trường khác phù hợp với cấu trúc trả về
                message += f"- {name}\n"
            dispatcher.utter_message(text=message)
            return [SlotSet("workplace", workplace)]
        except Exception as e:
            dispatcher.utter_message(text=f"Đã có lỗi khi tra cứu nơi làm việc: {str(e)}")
            return []