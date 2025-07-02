from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import urllib.parse

# Import từ utils và normalizer
from .utils import (
    extract_entity,
    safe_api_call,
    get_expert_by_name,
    BASE_URL
)
from .data_normalizer import normalizer


def get_expert_projects(expert_id: int) -> List[Dict]:
    """Lấy danh sách projects theo expert ID"""
    if not expert_id:
        return []
    
    url = f"{BASE_URL}/projects/by-expert-id?id={expert_id}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def format_project_count(projects: List[Dict], expert_name: str) -> str:
    """Format số lượng dự án"""
    total = len(projects)
    return f"✅ Chuyên gia {expert_name} đã/tham gia tổng cộng {total} dự án."


def format_project_list(projects: List[Dict], expert_name: str, start_index: int = 1, max_show: int = 20) -> str:
    """Format danh sách dự án"""
    if not projects:
        return f"Không tìm thấy dự án nào của chuyên gia {expert_name}."
    
    # Lấy projects trong range cần thiết
    end_index = start_index + max_show - 1
    selected_projects = projects[start_index-1:start_index-1+max_show]
    
    if not selected_projects:
        return "Không còn dự án nào nữa."
    
    # Sắp xếp theo năm bắt đầu (mới nhất trước)
    sorted_projects = sorted(
        selected_projects,
        key=lambda x: x.get("startYear", 0),
        reverse=True
    )
    
    if start_index == 1:
        message = f"📋 Danh sách dự án của {expert_name}:\n"
    else:
        message = f"📌 Các dự án còn lại của {expert_name}:\n"
    
    for i, project in enumerate(sorted_projects, start_index):
        title = project.get('title', 'Không rõ tên')
        start_year = project.get('startYear', '')
        end_year = project.get('endYear', '')
        status = project.get('status', '')
        role = project.get('role', '')
        
        message += f"{i}. {title}"
        
        # Thêm thông tin chi tiết trong ngoặc
        details = []
        
        # Format time period
        if start_year or end_year:
            if start_year and end_year:
                details.append(f"{start_year}-{end_year}")
            elif start_year:
                details.append(f"{start_year}-Hiện tại")
            elif end_year:
                details.append(f"Đến {end_year}")
        
        if status:
            details.append(f"Trạng thái: {status}")
        if role:
            details.append(f"Vai trò: {role}")
        
        if details:
            message += " (" + "; ".join(details) + ")"
        message += "\n"
    
    # Thông báo về số lượng còn lại
    remaining = len(projects) - end_index
    if remaining > 0:
        message += f"\n(Còn {remaining} dự án khác. Bạn muốn xem tiếp không?)"
    
    return message


def get_projects_by_status(status: str) -> List[Dict]:
    """Lấy danh sách projects theo trạng thái"""
    if not status:
        return []
    
    # Normalize status
    normalized_status = normalizer.normalize_project_status(status)
    
    encoded_status = urllib.parse.quote(normalized_status)
    url = f"{BASE_URL}/projects/by-status?status={encoded_status}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def get_projects_by_year(year: int) -> List[Dict]:
    """Lấy danh sách projects theo năm"""
    if not year:
        return []
    
    url = f"{BASE_URL}/projects/by-year?year={year}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def format_projects_by_criteria(projects: List[Dict], criteria: str, value: str) -> str:
    """Format danh sách projects theo tiêu chí"""
    if not projects:
        return f"Không tìm thấy dự án nào {criteria} '{value}'."
    
    message = f"✅ Danh sách dự án {criteria} '{value}':\n"
    
    # Sắp xếp theo năm bắt đầu
    sorted_projects = sorted(projects, key=lambda x: x.get("startYear", 0), reverse=True)
    
    max_show = 15
    for i, project in enumerate(sorted_projects[:max_show], 1):
        title = project.get('title', 'Không rõ')
        start_year = project.get('startYear', '')
        end_year = project.get('endYear', '')
        role = project.get('role', '')
        
        message += f"{i}. {title}"
        
        # Thêm thông tin thời gian
        if start_year or end_year:
            if start_year and end_year:
                message += f" ({start_year}-{end_year})"
            elif start_year:
                message += f" ({start_year}-Hiện tại)"
            elif end_year:
                message += f" (Đến {end_year})"
        
        # Thêm role nếu có
        if role:
            message += f" - {role}"
        
        message += "\n"
    
    if len(sorted_projects) > max_show:
        message += f"... (Còn {len(sorted_projects) - max_show} dự án khác)"
    
    return message


class ActionThongKeDuAn(Action):
    def name(self) -> Text:
        return "action_thong_ke_du_an"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            # Fallback to slot values
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")
            
            if not expert_id:
                dispatcher.utter_message(text="Bạn muốn thống kê dự án của chuyên gia nào?")
                return []
        else:
            expert_id = None

        print(f"DEBUG: Counting projects for: {expert_name}")

        try:
            # Lấy thông tin expert nếu chưa có ID
            if not expert_id:
                expert = get_expert_by_name(expert_name)
                if not expert:
                    dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
                    return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]
                
                expert_id = expert.get("id")
                expert_name = expert.get("fullName", expert_name)

            if not expert_id:
                dispatcher.utter_message(text="Không thể lấy ID của chuyên gia.")
                return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

            # Lấy danh sách projects
            projects = get_expert_projects(expert_id)
            
            # Format và gửi response
            message = format_project_count(projects, expert_name)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in project count: {e}")
            dispatcher.utter_message(text="Có lỗi khi thống kê dự án.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionLietKeDuAn(Action):
    def name(self) -> Text:
        return "action_liet_ke_du_an"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            # Fallback to slot values
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")
            
            if not expert_id:
                dispatcher.utter_message(text="Bạn muốn liệt kê dự án của chuyên gia nào?")
                return []
        else:
            expert_id = None

        print(f"DEBUG: Listing projects for: {expert_name}")

        try:
            # Lấy thông tin expert nếu chưa có ID
            if not expert_id:
                expert = get_expert_by_name(expert_name)
                if not expert:
                    dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
                    return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]
                
                expert_id = expert.get("id")
                expert_name = expert.get("fullName", expert_name)

            if not expert_id:
                dispatcher.utter_message(text="Không thể lấy ID của chuyên gia.")
                return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]

            # Lấy danh sách projects
            projects = get_expert_projects(expert_id)
            
            if not projects:
                dispatcher.utter_message(text=f"Không tìm thấy dự án nào của chuyên gia {expert_name}.")
                return [
                    SlotSet("expert_id", expert_id), 
                    SlotSet("expert_name", expert_name), 
                    SlotSet("name", expert_name)
                ]

            # Format và gửi response (20 dự án đầu tiên)
            message = format_project_list(projects, expert_name, start_index=1, max_show=20)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in project listing: {e}")
            dispatcher.utter_message(text="Có lỗi khi liệt kê dự án.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionLietKeDuAnConLai(Action):
    def name(self) -> Text:
        return "action_liet_ke_du_an_con_lai"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = extract_entity(tracker, "name")
        expert_id = tracker.get_slot("expert_id")
        
        # Prioritize slot values for continuation
        if not expert_id and expert_name:
            expert = get_expert_by_name(expert_name)
            if expert:
                expert_id = expert.get("id")
                expert_name = expert.get("fullName", expert_name)

        if not expert_id:
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")
            if not expert_name:
                dispatcher.utter_message(text="Chưa rõ chuyên gia nào cần liệt kê dự án.")
                return []

        print(f"DEBUG: Listing remaining projects for expert ID: {expert_id}")

        try:
            # Lấy danh sách projects
            projects = get_expert_projects(expert_id)

            if len(projects) <= 20:
                dispatcher.utter_message(text="Không còn dự án nào nữa.")
                return [
                    SlotSet("expert_id", expert_id), 
                    SlotSet("expert_name", expert_name), 
                    SlotSet("name", expert_name)
                ]

            # Format và gửi response (từ dự án thứ 21 trở đi)
            message = format_project_list(projects, expert_name, start_index=21, max_show=len(projects)-20)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in remaining projects: {e}")
            dispatcher.utter_message(text="Có lỗi khi liệt kê dự án còn lại.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionTraCuuDuAnTheoTrangThai(Action):
    def name(self) -> Text:
        return "action_tra_cuu_du_an_theo_trang_thai"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        status = extract_entity(tracker, "project_status") or extract_entity(tracker, "status")
        if not status:
            dispatcher.utter_message(text="Bạn muốn tra cứu dự án có trạng thái gì?")
            return []
        
        print(f"DEBUG: Searching projects by status: {status}")
        
        try:
            projects = get_projects_by_status(status)
            normalized_status = normalizer.normalize_project_status(status)
            message = format_projects_by_criteria(projects, "có trạng thái", normalized_status)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"DEBUG: Exception in project status search: {e}")
            dispatcher.utter_message(text=f"Có lỗi khi tra cứu dự án theo trạng thái: {e}")
        
        return [SlotSet("project_status", status), SlotSet("status", status)]


class ActionTraCuuDuAnTheoNam(Action):
    def name(self) -> Text:
        return "action_tra_cuu_du_an_theo_nam"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        year_str = extract_entity(tracker, "year")
        if not year_str:
            dispatcher.utter_message(text="Bạn muốn tra cứu dự án năm nào?")
            return []
        
        try:
            year = int(year_str)
            print(f"DEBUG: Searching projects by year: {year}")
            
            projects = get_projects_by_year(year)
            message = format_projects_by_criteria(projects, "năm", str(year))
            dispatcher.utter_message(text=message)
            
        except ValueError:
            dispatcher.utter_message(text=f"'{year_str}' không phải là năm hợp lệ.")
        except Exception as e:
            print(f"DEBUG: Exception in project year search: {e}")
            dispatcher.utter_message(text=f"Có lỗi khi tra cứu dự án theo năm: {e}")
        
        return [SlotSet("year", year_str)]


class ActionTraCuuDuAnTheoVaiTro(Action):
    def name(self) -> Text:
        return "action_tra_cuu_du_an_theo_vai_tro"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        role = extract_entity(tracker, "project_role") or extract_entity(tracker, "role")
        if not role:
            dispatcher.utter_message(text="Bạn muốn tra cứu dự án theo vai trò nào?")
            return []
        
        print(f"DEBUG: Searching projects by role: {role}")
        
        try:
            # Normalize role
            normalized_role = normalizer.normalize_project_role(role)
            
            encoded_role = urllib.parse.quote(normalized_role)
            url = f"{BASE_URL}/projects/by-role?role={encoded_role}"
            data = safe_api_call(url)
            
            if not data:
                dispatcher.utter_message(text=f"Không tìm thấy dự án nào có vai trò '{role}'.")
                return [SlotSet("project_role", role), SlotSet("role", role)]
            
            projects = data if isinstance(data, list) else data.get("projects", [])
            message = format_projects_by_criteria(projects, "có vai trò", normalized_role)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"DEBUG: Exception in project role search: {e}")
            dispatcher.utter_message(text=f"Có lỗi khi tra cứu dự án theo vai trò: {e}")
        
        return [SlotSet("project_role", role), SlotSet("role", role)]