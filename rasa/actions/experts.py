from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

BASE_URL = "http://localhost:3000/api"

class ActionTraCuuChuyenGia(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        name = next(tracker.get_latest_entity_values("name"), None)
        if not name:
            dispatcher.utter_message(response="utter_hoi_chuyen_gia")
            return []
        try:
            res = requests.get(f"{BASE_URL}/experts/search-all?name={name}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message(response="utter_Khong_tim_thay_chuyen_gia")
                return [SlotSet("name", name)]
            data = res.json()
            experts = data.get("experts", [])
            if not experts or not isinstance(experts, list):
                dispatcher.utter_message(response="utter_Khong_tim_thay_chuyen_gia")
                return [SlotSet("name", name)]
            expert = experts[0]
            message = f"✅ Thông tin chuyên gia {expert.get('fullName', name)}:\n"
            message += f"- Đơn vị: {expert.get('organization', 'Chưa có')}\n"
            message += f"- Lĩnh vực: {expert.get('field', 'Chưa có')}\n"
            message += f"- Giới tính: {expert.get('gender', 'Chưa có')}\n"
            message += f"- Năm sinh: {expert.get('birthYear', 'Chưa có')}\n"
            message += f"- Học vị: {expert.get('degree', 'Chưa có')}\n"
            message += f"- Email: {expert.get('email', 'Không có')}\n"
            message += f"- Số điện thoại: {expert.get('phone', 'Không có')}\n"
            dispatcher.utter_message(text=message)
        except Exception as e:
            dispatcher.utter_message(text=f"Có lỗi khi truy vấn thông tin: {e}")
        return [SlotSet("name", name)]

class ActionTraCuuChuyenGiaTheoDonVi(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_don_vi"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Ghép tất cả entity organization lại thành một chuỗi
        entities = tracker.latest_message.get("entities", [])
        organizations = [e.get("value") for e in entities if e.get("entity") == "organization"]
        organization = " ".join(organizations) if organizations else tracker.get_slot("organization")
        if not organization:
            dispatcher.utter_message(response="utter_hoi_don_vi")
            return []
        try:
            res = requests.get(f"{BASE_URL}/experts/search-all?org={organization}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message(response="utter_Khong_tim_thay_don_vi")
                return [SlotSet("organization", organization)]
            data = res.json()
            experts = data.get("experts", [])
            # Lọc bỏ các chuyên gia bị xóa (deleted = 1)
            experts = [e for e in experts if not e.get("deleted", False)]
            if not experts or not isinstance(experts, list):
                dispatcher.utter_message(response="utter_Khong_tim_thay_don_vi")
                return [SlotSet("organization", organization)]
            # Lọc trùng theo (fullName, email, phone)
            unique_experts = []
            seen = set()
            for expert in experts:
                key = (
                    expert.get('fullName', '').strip().lower(),
                    (expert.get('email') or '').strip().lower(),
                    (expert.get('phone') or '').strip()
                )
                if key not in seen:
                    unique_experts.append(expert)
                    seen.add(key)
            # Giới hạn số lượng trả về
            max_show = 12
            message = f"✅ Danh sách chuyên gia tại {organization}:\n"
            for expert in unique_experts[:max_show]:
                message += f"- {expert.get('fullName', 'Không rõ')}\n"
            if len(unique_experts) > max_show:
                message += f"... (Còn {len(unique_experts) - max_show} chuyên gia khác)"
            dispatcher.utter_message(text=message)
        except Exception as e:
            dispatcher.utter_message(text=f"Có lỗi khi truy vấn thông tin: {e}")
        return [SlotSet("organization", organization)]

class ActionTraCuuChuyenGiaTheoHocVi(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_hoc_vi"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        degree = next(tracker.get_latest_entity_values("degree"), None)
        if not degree:
            dispatcher.utter_message(response="utter_hoi_hoc_vi")
            return []
        try:
            res = requests.get(f"{BASE_URL}/experts/search-all?degree={degree}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message(response="utter_Khong_tim_thay_hoc_vi")
                return [SlotSet("degree", degree)]
            data = res.json()
            experts = data.get("experts", [])
            # Lọc bỏ các chuyên gia bị xóa (deleted = 1)
            experts = [e for e in experts if not e.get("deleted", False)]
            if not experts or not isinstance(experts, list):
                dispatcher.utter_message(response="utter_Khong_tim_thay_hoc_vi")
                return [SlotSet("degree", degree)]
            # Lọc trùng theo (fullName, email, phone)
            unique_experts = []
            seen = set()
            for expert in experts:
                key = (
                    expert.get('fullName', '').strip().lower(),
                    (expert.get('email') or '').strip().lower(),
                    (expert.get('phone') or '').strip()
                )
                if key not in seen:
                    unique_experts.append(expert)
                    seen.add(key)
            # Giới hạn số lượng trả về
            max_show = 12
            message = f"✅ Danh sách chuyên gia có học vị {degree}:\n"
            for expert in unique_experts[:max_show]:
                message += f"- {expert.get('fullName', 'Không rõ')}\n"
            if len(unique_experts) > max_show:
                message += f"... (Còn {len(unique_experts) - max_show} chuyên gia khác)"
            dispatcher.utter_message(text=message)
        except Exception as e:
            dispatcher.utter_message(text=f"Có lỗi khi truy vấn thông tin: {e}")
        return [SlotSet("degree", degree)]

class ActionTraCuuChuyenGiaTheoHocHam(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_hoc_ham"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        academic_title = next(tracker.get_latest_entity_values("academicTitle"), None)
        if not academic_title:
            dispatcher.utter_message(text="Bạn muốn tra cứu học hàm nào?")
            return []
        try:
            res = requests.get(f"{BASE_URL}/experts/search-all?academicTitle={academic_title}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message(text="Không tìm thấy chuyên gia có học hàm này.")
                return [SlotSet("academicTitle", academic_title)]
            data = res.json()
            experts = data.get("experts", [])
            experts = [e for e in experts if not e.get("deleted", False)]
            if not experts or not isinstance(experts, list):
                dispatcher.utter_message(text="Không tìm thấy chuyên gia có học hàm này.")
                return [SlotSet("academicTitle", academic_title)]
            # Lọc trùng
            unique_experts = []
            seen = set()
            for expert in experts:
                key = (
                    expert.get('fullName', '').strip().lower(),
                    (expert.get('email') or '').strip().lower(),
                    (expert.get('phone') or '').strip()
                )
                if key not in seen:
                    unique_experts.append(expert)
                    seen.add(key)
            max_show = 12
            message = f"✅ Danh sách chuyên gia có học hàm {academic_title}:\n"
            for expert in unique_experts[:max_show]:
                message += f"- {expert.get('fullName', 'Không rõ')}\n"
            if len(unique_experts) > max_show:
                message += f"... (Còn {len(unique_experts) - max_show} chuyên gia khác)"
            dispatcher.utter_message(text=message)
        except Exception as e:
            dispatcher.utter_message(text=f"Có lỗi khi truy vấn thông tin: {e}")
        return [SlotSet("academicTitle", academic_title)]



