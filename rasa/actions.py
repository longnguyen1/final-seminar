<<<<<<< HEAD
from rasa_sdk import Action
from rasa_sdk.executor import CollectingDispatcher
import requests

class ActionMostPublications(Action):
    def name(self):
        return "action_most_publications"

    def run(self, dispatcher, tracker, domain):
        # Gọi API của bạn, ví dụ: /api/statistics hoặc /api/experts?sort=publications
        res = requests.get("http://localhost:3000/api/statistics")
        data = res.json()
        # Ví dụ trả về top expert
        top = data.get("most_publications", {})
        msg = f"Chuyên gia {top.get('fullName', '')} có nhiều công trình nhất: {top.get('count', 0)} công trình."
        dispatcher.utter_message(msg)
        return []

class ActionTopOrganization(Action):
    def name(self):
        return "action_top_organization"

    def run(self, dispatcher, tracker, domain):
        try:
            res = requests.get("http://localhost:3000/api/statistics")
            res.raise_for_status()
            data = res.json()
            orgs = data.get("byOrganization", [])
            if not orgs:
                dispatcher.utter_message("Không có dữ liệu về đơn vị.")
                return []
            top_org = max(orgs, key=lambda x: x["_count"]["organization"])
            msg = f"Đơn vị có nhiều chuyên gia nhất là {top_org['organization']} với {top_org['_count']['organization']} chuyên gia."
            dispatcher.utter_message(msg)
        except Exception:
            dispatcher.utter_message("Xin lỗi, tôi không lấy được dữ liệu đơn vị.")
        return []

class ActionYoungestOldestExpert(Action):
    def name(self):
        return "action_youngest_oldest_expert"

    def run(self, dispatcher, tracker, domain):
        res = requests.get("http://localhost:3000/api/statistics")
        data = res.json()
        youngest = data.get("youngest_expert", {})
        oldest = data.get("oldest_expert", {})
        msg = f"Chuyên gia trẻ nhất là {youngest.get('fullName')} ({youngest.get('birthYear')}). Chuyên gia lớn tuổi nhất là {oldest.get('fullName')} ({oldest.get('birthYear')})."
        dispatcher.utter_message(msg)
        return []
    
=======
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

>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442
class ActionCountDegree(Action):
    def name(self):
        return "action_count_degree"

    def run(self, dispatcher, tracker, domain):
<<<<<<< HEAD
        # Gọi API statistics
        res = requests.get("http://localhost:3000/api/statistics")
        data = res.json()
        count = 0
        for d in data['byDegree']:
            if d['degree'] == "Tiến sĩ":
                count = d['_count']['degree']
                break
        dispatcher.utter_message(text=f"Số lượng Tiến sĩ là: {count}")
=======
        res = requests.get("http://localhost:3000/api/statistics")
        if res.status_code == 200:
            stats = res.json()
            text = f"Hệ thống có {stats['total_ts']} tiến sĩ và {stats['total_ths']} thạc sĩ."
        else:
            text = "Xin lỗi, hiện tôi không lấy được dữ liệu thống kê."
        dispatcher.utter_message(text)
>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442
        return []
