from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

BASE_URL = "http://localhost:3000/api"

# -------------------------------
# Action 1: Đếm số lượng công trình khoa học
# -------------------------------
class ActionThongKeCongTrinhKhoaHoc(Action):
    def name(self) -> Text:
        return "action_thong_ke_cong_trinh_khoa_hoc"

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
            dispatcher.utter_message("Không rõ chuyên gia nào để truy xuất công trình.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

        res = requests.get(f"{BASE_URL}/publications/by-expert-id?id={expert_id}")
        if res.status_code == 200:
            pubs = res.json()
            total = len(pubs)
            dispatcher.utter_message(text=f"✅ Chuyên gia {expert_name} có tổng cộng {total} công trình khoa học.")
            return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]
        else:
            dispatcher.utter_message(text="Không tìm thấy công trình khoa học.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

# -------------------------------
# Action 2: Liệt kê 20 công trình đầu tiên (đầy đủ thông tin)
# -------------------------------
class ActionLietKeCongTrinhKhoaHoc(Action):
    def name(self) -> Text:
        return "action_liet_ke_cong_trinh_khoa_hoc"

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
            dispatcher.utter_message(text="Không rõ chuyên gia nào để truy xuất công trình.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

        res = requests.get(f"{BASE_URL}/publications/by-expert-id?id={expert_id}")
        if res.status_code == 200:
            publications = res.json()
            top20 = publications[:20]
            remaining = len(publications) - 20

            if not top20:
                dispatcher.utter_message(text="Không tìm thấy công trình nào.")
                return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]

            # Liệt kê đầy đủ thông tin từng công trình
            msg = f"📄 Danh sách công trình của {expert_name}:\n"
            for i, pub in enumerate(top20, 1):
                year = pub.get('year', '')
                place = pub.get('place', '')
                title = pub.get('title', 'Không rõ tên')
                pub_type = pub.get('type', '')
                author = pub.get('author', '')
                msg += f"{i}. {title}"
                detail = []
                if year: detail.append(f"Năm: {year}")
                if place: detail.append(f"Nơi: {place}")
                if pub_type: detail.append(f"Loại: {pub_type}")
                if author: detail.append(f"Tác giả: {author}")
                if detail:
                    msg += " (" + "; ".join(detail) + ")"
                msg += "\n"

            if remaining > 0:
                msg += f"\n(Còn {remaining} công trình khác. Bạn muốn xem tiếp không?)"

            dispatcher.utter_message(text=msg)
            return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]
        else:
            dispatcher.utter_message(text="Lỗi khi lấy danh sách công trình.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

# -------------------------------
# Action 3: Liệt kê toàn bộ công trình còn lại (trừ 20 cái đầu, đầy đủ thông tin)
# -------------------------------
class ActionLietKeCongTrinhKhoaHocConLai(Action):
    def name(self) -> Text:
        return "action_liet_ke_cong_trinh_khoa_hoc_con_lai"

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

        res = requests.get(f"{BASE_URL}/publications/by-expert-id?id={expert_id}")
        if res.status_code == 200:
            pubs = res.json()
            if len(pubs) <= 20:
                dispatcher.utter_message(text="Không còn công trình nào nữa.")
                return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]

            remaining = pubs[20:]
            msg = f"📌 Các công trình còn lại của {expert_name}:\n"
            for i, pub in enumerate(remaining, 21):
                year = pub.get('year', '')
                place = pub.get('place', '')
                title = pub.get('title', 'Không rõ tên')
                pub_type = pub.get('type', '')
                author = pub.get('author', '')
                msg += f"{i}. {title}"
                detail = []
                if year: detail.append(f"Năm: {year}")
                if place: detail.append(f"Nơi: {place}")
                if pub_type: detail.append(f"Loại: {pub_type}")
                if author: detail.append(f"Tác giả: {author}")
                if detail:
                    msg += " (" + "; ".join(detail) + ")"
                msg += "\n"

            dispatcher.utter_message(text=msg)
            return [SlotSet("expert_id", expert_id), SlotSet("expert_name", expert_name), SlotSet("name", expert_name)]
        else:
            dispatcher.utter_message(text="Không thể truy xuất dữ liệu.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

# -------------------------------
# Ghi chú:
# - Khi liệt kê công trình, bot sẽ trả về đầy đủ các trường: năm, nơi, tên, loại, tác giả.
# - Khi đếm, chỉ trả về số lượng.
# - Nếu trường nào không có, sẽ bỏ qua trường đó trong thông báo.
