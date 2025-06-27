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
            res = requests.get(f"{BASE_URL}/experts/search?name={name}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message(response="utter_Khong_tim_thay_chuyen_gia")
                return [SlotSet("name", name)]
            data = res.json()
            # Nếu data là list, lấy phần tử đầu tiên
            if isinstance(data, list):
                if not data:
                    dispatcher.utter_message(response="utter_Khong_tim_thay_chuyen_gia")
                    return [SlotSet("name", name)]
                data = data[0]
            if not data or "fullName" not in data:
                dispatcher.utter_message(response="utter_Khong_tim_thay_chuyen_gia")
                return [SlotSet("name", name)]
            message = f"✅ Thông tin chuyên gia {data['fullName']}:\n"
            message += f"- Đơn vị: {data.get('organization', 'Chưa có')}\n"
            message += f"- Lĩnh vực: {data.get('field', 'Chưa có')}\n"
            message += f"- Giới tính: {data.get('gender', 'Chưa có')}\n"
            message += f"- Năm sinh: {data.get('birthYear', 'Chưa có')}\n"
            message += f"- Học vị: {data.get('degree', 'Chưa có')}\n"
            message += f"- Email: {data.get('email', 'Không có')}\n"
            message += f"- Số điện thoại: {data.get('phone', 'Không có')}\n"
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
        organization = next(tracker.get_latest_entity_values("organization"), None)
        if not organization:
            dispatcher.utter_message(response="utter_hoi_don_vi")
            return []
        try:
            res = requests.get(f"{BASE_URL}/experts/search?organization={organization}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message(response="utter_Khong_tim_thay_don_vi")
                return [SlotSet("organization", organization)]
            data = res.json()
            if not data or not isinstance(data, list):
                dispatcher.utter_message(response="utter_Khong_tim_thay_don_vi")
                return [SlotSet("organization", organization)]
            message = f"✅ Danh sách chuyên gia tại {organization}:\n"
            for expert in data:
                message += f"- {expert.get('fullName', 'Không rõ')}\n"
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
            res = requests.get(f"{BASE_URL}/experts/search?degree={degree}")
            if res.status_code != 200 or not res.text.strip():
                dispatcher.utter_message(response="utter_Khong_tim_thay_hoc_vi")
                return [SlotSet("degree", degree)]
            data = res.json()
            if not data or not isinstance(data, list):
                dispatcher.utter_message(response="utter_Khong_tim_thay_hoc_vi")
                return [SlotSet("degree", degree)]
            message = f"✅ Danh sách chuyên gia có học vị {degree}:\n"
            for expert in data:
                message += f"- {expert.get('fullName', 'Không rõ')}\n"
            dispatcher.utter_message(text=message)
        except Exception as e:
            dispatcher.utter_message(text=f"Có lỗi khi truy vấn thông tin: {e}")
        return [SlotSet("degree", degree)]



