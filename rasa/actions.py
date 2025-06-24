from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests

class ActionSearchExpert(Action):
    def name(self):
        return "action_search_expert"

    def run(self, dispatcher, tracker, domain):
        name = tracker.get_slot('name')
        if not name:
            dispatcher.utter_message("Bạn muốn tìm chuyên gia nào?")
            return []

        # 👉 Gọi API Next.js (update URL nếu cần)
        res = requests.get(f"http://localhost:3000/api/experts?name={name}")
        if res.status_code == 200 and res.json():
            expert = res.json()[0]  # giả sử trả về list
            text = f"{expert['fullName']} - {expert['degree']}, {expert['organization']}"
        else:
            text = "Xin lỗi, tôi không tìm thấy chuyên gia này."
        dispatcher.utter_message(text)
        return []

class ActionCountDegree(Action):
    def name(self):
        return "action_count_degree"

    def run(self, dispatcher, tracker, domain):
        res = requests.get("http://localhost:3000/api/statistics")
        if res.status_code == 200:
            stats = res.json()
            text = f"Hệ thống có {stats['total_ts']} tiến sĩ và {stats['total_ths']} thạc sĩ."
        else:
            text = "Xin lỗi, hiện tôi không lấy được dữ liệu thống kê."
        dispatcher.utter_message(text)
        return []
