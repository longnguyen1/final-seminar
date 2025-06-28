from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

BASE_URL = "http://localhost:3000/api"

class ActionTraCuuQuaTrinhDaoTao(Action):
    def name(self) -> Text:
        return "action_tra_cuu_qua_trinh_dao_tao"
    
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
            # Bước 1: Lấy expertId từ tên chuyên gia
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

            # Bước 2: Lấy quá trình đào tạo theo expertId
            api_url = f"{BASE_URL}/educations/by-expert-id?id={expert_id}"
            response = requests.get(api_url)
            if response.status_code != 200 or not response.text.strip():
                dispatcher.utter_message("Không tìm thấy thông tin quá trình đào tạo.")
                return [SlotSet("name", expert_name)]
            try:
                data = response.json()
            except Exception:
                dispatcher.utter_message("Kết quả trả về không hợp lệ hoặc không phải JSON.")
                return [SlotSet("name", expert_name)]
            if not data:
                dispatcher.utter_message(response="utter_Khong_tim_thay_qua_trinh_dao_tao")
                return [SlotSet("name", expert_name)]
            
            message = f"✅ Quá trình đào tạo của chuyên gia {expert_name}:\n"
            for edu in data:
                year = edu.get("year", "Chưa có")
                school = edu.get("school", "Chưa có")
                major = edu.get("major", "Chưa có")
                message += f"- {year}: Tốt nghiệp {school}, chuyên ngành {major}\n"
            dispatcher.utter_message(text=message)
            return [SlotSet("name", expert_name)]
        except Exception as e:
            dispatcher.utter_message(text=f"Đã có lỗi khi tra cứu quá trình đào tạo: {str(e)}")
            return []
        
class ActionTraCuuChuyenGiaTheoNoiTotNghiep(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_noi_tot_nghiep"  
    def extract_school(self, tracker: Tracker) -> Text:
        entities = tracker.latest_message.get("entities", [])
        for entity in entities:
            if entity.get("entity") == "school":
                return entity.get("value")
        return tracker.get_slot("school")
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        school_name = self.extract_school(tracker)
        if not school_name:
            dispatcher.utter_message(response="utter_hoi_noi_tot_nghiep")
            return []
        try:
            # Bước 1: Lấy danh sách chuyên gia theo trường tốt nghiệp
            api_url = f"{BASE_URL}/experts/by-school?school={school_name}"
            response = requests.get(api_url)
            if response.status_code != 200 or not response.text.strip():
                dispatcher.utter_message("Không tìm thấy chuyên gia tốt nghiệp từ trường này.")
                return [SlotSet("school", school_name)]
            try:
                data = response.json()
            except Exception:
                dispatcher.utter_message("Kết quả trả về không hợp lệ hoặc không phải JSON.")
                return [SlotSet("school", school_name)] 
            if not data:
                dispatcher.utter_message("Không tìm thấy chuyên gia tốt nghiệp từ trường này.")
                return [SlotSet("school", school_name)]
            message = f"✅ Danh sách chuyên gia tốt nghiệp từ trường {school_name}:\n"
            for expert in data:
                name = expert.get("name", "Chưa có")
                major = expert.get("major", "Chưa có")
                message += f"- {name}, chuyên ngành {major}\n"
            dispatcher.utter_message(text=message)
            return [SlotSet("school", school_name)]
        except Exception as e:
            dispatcher.utter_message(text=f"Đã có lỗi khi tra cứu chuyên gia: {str(e)}")
            return [SlotSet("school", school_name)]

