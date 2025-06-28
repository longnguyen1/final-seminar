from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

BASE_URL = "http://localhost:3000/api"

# -------------------------------
# Action 1: Đếm số lượng dự án
# -------------------------------
class ActionThongKeDuAn(Action):
    def name(self) -> Text:
        return "action_thong_ke_du_an"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = next(tracker.get_latest_entity_values("name"), None)
        expert_id = None

        if expert_name:
            res = requests.get(f"{BASE_URL}/experts/search-all?name={expert_name}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message("Không tìm thấy chuyên gia.")
                return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]
            data = res.json()
            experts = data.get("experts", [])
            if not experts or not isinstance(experts, list):
                dispatcher.utter_message("Không tìm thấy chuyên gia.")
                return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]
            expert = experts[0]
            expert_id = expert.get("id")
            expert_name = expert.get("fullName")
        else:
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")

        if not expert_id:
            dispatcher.utter_message("Không rõ chuyên gia nào để truy xuất dự án.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

        res = requests.get(f"{BASE_URL}/projects/by-expert-id?id={expert_id}")
        if res.status_code == 200:
            projects = res.json()
            total = len(projects)
            dispatcher.utter_message(text=f"✅ Chuyên gia {expert_name} đã/tham gia tổng cộng {total} dự án.")
            return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]
        else:
            dispatcher.utter_message(text="Không tìm thấy dự án.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

# -------------------------------
# Action 2: Liệt kê 20 dự án đầu tiên
# -------------------------------
class ActionLietKeDuAn(Action):
    def name(self) -> Text:
        return "action_liet_ke_du_an"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = next(tracker.get_latest_entity_values("name"), None)
        expert_id = None

        if expert_name:
            res = requests.get(f"{BASE_URL}/experts/search-all?name={expert_name}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message("Không tìm thấy chuyên gia.")
                return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]
            data = res.json()
            experts = data.get("experts", [])
            if not experts or not isinstance(experts, list):
                dispatcher.utter_message("Không tìm thấy chuyên gia.")
                return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]
            expert = experts[0]
            expert_id = expert.get("id")
            expert_name = expert.get("fullName")
        else:
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")

        if not expert_id:
            dispatcher.utter_message(text="Không rõ chuyên gia nào để truy xuất dự án.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

        res = requests.get(f"{BASE_URL}/projects/by-expert-id?id={expert_id}")
        if res.status_code == 200:
            projects = res.json()
            top20 = projects[:20]
            remaining = len(projects) - 20

            if not top20:
                dispatcher.utter_message(text="Không tìm thấy dự án nào.")
                return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]

            msg = f"📋 Danh sách dự án của {expert_name}:\n"
            for i, prj in enumerate(top20, 1):
                start = prj.get('startYear', '')
                end = prj.get('endYear', '')
                years = f"{start}-{end}" if start or end else ""
                status = prj.get('status', '')
                role = prj.get('role', '')
                msg += f"{i}. {prj.get('title', 'Không rõ tên')}"
                if years or status or role:
                    msg += " ("
                    if years: msg += f"{years}"
                    if status: msg += f", {status}"
                    if role: msg += f", {role}"
                    msg += ")"
                msg += "\n"

            if remaining > 0:
                msg += f"\n(Còn {remaining} dự án khác. Bạn muốn xem tiếp không?)"

            dispatcher.utter_message(text=msg)
            return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]
        else:
            dispatcher.utter_message(text="Lỗi khi lấy danh sách dự án.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

# -------------------------------
# Action 3: Liệt kê toàn bộ dự án còn lại (trừ 20 cái đầu)
# -------------------------------
class ActionLietKeDuAnConLai(Action):
    def name(self) -> Text:
        return "action_liet_ke_du_an_con_lai"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = next(tracker.get_latest_entity_values("name"), None)
        expert_id = None

        if expert_name:
            res = requests.get(f"{BASE_URL}/experts/search-all?name={expert_name}")
            if res.status_code == 200 and res.text.strip():
                data = res.json()
                experts = data.get("experts", [])
                if experts and isinstance(experts, list):
                    expert = experts[0]
                    expert_id = expert.get("id")
                    expert_name = expert.get("fullName")
        if not expert_id:
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")

        if not expert_id:
            dispatcher.utter_message(text="Chưa rõ chuyên gia nào.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

        res = requests.get(f"{BASE_URL}/projects/by-expert-id?id={expert_id}")
        if res.status_code == 200:
            projects = res.json()
            if len(projects) <= 20:
                dispatcher.utter_message(text="Không còn dự án nào nữa.")
                return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]

            remaining = projects[20:]
            msg = f"📌 Các dự án còn lại của {expert_name}:\n"
            for i, prj in enumerate(remaining, 21):
                start = prj.get('startYear', '')
                end = prj.get('endYear', '')
                years = f"{start}-{end}" if start or end else ""
                status = prj.get('status', '')
                role = prj.get('role', '')
                msg += f"{i}. {prj.get('title', 'Không rõ tên')}"
                if years or status or role:
                    msg += " ("
                    if years: msg += f"{years}"
                    if status: msg += f", {status}"
                    if role: msg += f", {role}"
                    msg += ")"
                msg += "\n"

            dispatcher.utter_message(text=msg)
            return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]
        else:
            dispatcher.utter_message(text="Không thể truy xuất dữ liệu.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]