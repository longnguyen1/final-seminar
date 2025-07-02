"""
Project search actions for Rasa chatbot
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

class ActionThongKeDuAn(Action):
    def name(self) -> Text:
        return "action_thong_ke_du_an"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            dispatcher.utter_message(text="Xin lỗi, tôi cần biết tên chuyên gia để thống kê dự án.")
            return []

        expert = get_expert_by_name(expert_name)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia tên {expert_name}.")
            return []

        expert_id = expert.get("id")
        response = safe_api_call(f"{BASE_URL}/projects/by-expert-id?id={expert_id}")
        
        if response and response.get("data"):
            projects = response["data"]
            count = len(projects)
            if count > 0:
                message = f"{expert_name} có tổng cộng {count} dự án:\n\n"
                # Count by status
                status_count = {}
                for project in projects:
                    status = project.get("status", "Không xác định")
                    status_count[status] = status_count.get(status, 0) + 1
                
                for status, cnt in status_count.items():
                    message += f"📊 {status}: {cnt} dự án\n"
            else:
                message = f"{expert_name} chưa có dự án nào."
        else:
            message = "Không thể thống kê dự án."
            
        dispatcher.utter_message(text=message)
        return []

class ActionLietKeDuAn(Action):
    def name(self) -> Text:
        return "action_liet_ke_du_an"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            dispatcher.utter_message(text="Xin lỗi, tôi cần biết tên chuyên gia để liệt kê dự án.")
            return []

        expert = get_expert_by_name(expert_name)
        if not expert:
            dispatcher.utter_message(text=f"Không tìm thấy chuyên gia tên {expert_name}.")
            return []

        expert_id = expert.get("id")
        response = safe_api_call(f"{BASE_URL}/projects/by-expert-id?id={expert_id}")
        
        if response and response.get("data"):
            projects = response["data"]
            if projects:
                message = f"Danh sách dự án của {expert_name}:\n\n"
                for i, project in enumerate(projects[:5], 1):
                    title = project.get("title", "N/A")
                    role = project.get("role", "N/A")
                    status = project.get("status", "N/A")
                    start_year = project.get("startYear", "N/A")
                    
                    message += f"{i}. 🚀 {title}\n"
                    message += f"   👔 Vai trò: {role}\n"
                    message += f"   📊 Trạng thái: {status}\n"
                    message += f"   📅 Năm bắt đầu: {start_year}\n\n"
                
                if len(projects) > 5:
                    message += f"... và {len(projects) - 5} dự án khác."
            else:
                message = f"{expert_name} chưa có dự án nào."
        else:
            message = "Không thể liệt kê dự án."
            
        dispatcher.utter_message(text=message)
        return []

class ActionTraCuuDuAnTheoTrangThai(Action):
    def name(self) -> Text:
        return "action_tra_cuu_du_an_theo_trang_thai"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        project_status = extract_entity(tracker, "project_status")
        if not project_status:
            dispatcher.utter_message(text="Xin lỗi, tôi cần biết trạng thái dự án để tìm kiếm.")
            return []

        response = safe_api_call(f"{BASE_URL}/experts/by-project-status?status={project_status}")
        
        if response and response.get("data"):
            experts = response["data"]
            if experts:
                count = len(experts)
                message = f"Tìm thấy {count} chuyên gia có dự án với trạng thái '{project_status}':\n\n"
                for expert in experts[:5]:
                    name = expert.get("fullName", "N/A")
                    org = expert.get("organization", "N/A")
                    message += f"👨‍🏫 {name}\n🏢 {org}\n\n"
                if count > 5:
                    message += f"... và {count - 5} chuyên gia khác."
            else:
                message = f"Không tìm thấy chuyên gia có dự án với trạng thái '{project_status}'."
        else:
            message = "Không thể tìm kiếm dự án."
            
        dispatcher.utter_message(text=message)
        return []