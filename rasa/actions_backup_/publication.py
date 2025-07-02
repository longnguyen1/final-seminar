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


def get_expert_publications(expert_id: int) -> List[Dict]:
    """Lấy danh sách publications theo expert ID"""
    if not expert_id:
        return []
    
    url = f"{BASE_URL}/publications/by-expert-id?id={expert_id}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def format_publication_count(publications: List[Dict], expert_name: str) -> str:
    """Format số lượng công trình khoa học"""
    total = len(publications)
    return f"✅ Chuyên gia {expert_name} có tổng cộng {total} công trình khoa học."


def format_publication_list(publications: List[Dict], expert_name: str, start_index: int = 1, max_show: int = 20) -> str:
    """Format danh sách công trình khoa học"""
    if not publications:
        return f"Không tìm thấy công trình khoa học nào của chuyên gia {expert_name}."
    
    # Lấy publications trong range cần thiết
    end_index = start_index + max_show - 1
    selected_pubs = publications[start_index-1:start_index-1+max_show]
    
    if not selected_pubs:
        return "Không còn công trình nào nữa."
    
    # Sắp xếp theo năm (mới nhất trước)
    sorted_pubs = sorted(
        selected_pubs,
        key=lambda x: x.get("year", 0),
        reverse=True
    )
    
    if start_index == 1:
        message = f"📄 Danh sách công trình của {expert_name}:\n"
    else:
        message = f"📌 Các công trình còn lại của {expert_name}:\n"
    
    for i, pub in enumerate(sorted_pubs, start_index):
        title = pub.get('title', 'Không rõ tên')
        year = pub.get('year', '')
        place = pub.get('place', '')
        pub_type = pub.get('type', '')
        author = pub.get('author', '')
        
        message += f"{i}. {title}"
        
        # Thêm thông tin chi tiết trong ngoặc
        details = []
        if year:
            details.append(f"Năm: {year}")
        if place:
            details.append(f"Nơi: {place}")
        if pub_type:
            details.append(f"Loại: {pub_type}")
        if author and author != expert_name:
            details.append(f"Tác giả: {author}")
        
        if details:
            message += " (" + "; ".join(details) + ")"
        message += "\n"
    
    # Thông báo về số lượng còn lại
    remaining = len(publications) - end_index
    if remaining > 0:
        message += f"\n(Còn {remaining} công trình khác. Bạn muốn xem tiếp không?)"
    
    return message


def get_publications_by_type(pub_type: str) -> List[Dict]:
    """Lấy danh sách publications theo loại"""
    if not pub_type:
        return []
    
    encoded_type = urllib.parse.quote(pub_type)
    url = f"{BASE_URL}/publications/by-type?type={encoded_type}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def get_publications_by_year(year: int) -> List[Dict]:
    """Lấy danh sách publications theo năm"""
    if not year:
        return []
    
    url = f"{BASE_URL}/publications/by-year?year={year}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def format_publications_by_criteria(publications: List[Dict], criteria: str, value: str) -> str:
    """Format danh sách publications theo tiêu chí"""
    if not publications:
        return f"Không tìm thấy công trình nào {criteria} '{value}'."
    
    message = f"✅ Danh sách công trình {criteria} '{value}':\n"
    
    # Sắp xếp theo năm
    sorted_pubs = sorted(publications, key=lambda x: x.get("year", 0), reverse=True)
    
    max_show = 15
    for i, pub in enumerate(sorted_pubs[:max_show], 1):
        title = pub.get('title', 'Không rõ')
        year = pub.get('year', '')
        author = pub.get('author', '')
        
        message += f"{i}. {title}"
        if year:
            message += f" ({year})"
        if author:
            message += f" - {author}"
        message += "\n"
    
    if len(sorted_pubs) > max_show:
        message += f"... (Còn {len(sorted_pubs) - max_show} công trình khác)"
    
    return message


class ActionThongKeCongTrinhKhoaHoc(Action):
    def name(self) -> Text:
        return "action_thong_ke_cong_trinh_khoa_hoc"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            # Fallback to slot values
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")
            
            if not expert_id:
                dispatcher.utter_message(text="Bạn muốn thống kê công trình khoa học của chuyên gia nào?")
                return []
        else:
            expert_id = None

        print(f"DEBUG: Counting publications for: {expert_name}")

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

            # Lấy danh sách publications
            publications = get_expert_publications(expert_id)
            
            # Format và gửi response
            message = format_publication_count(publications, expert_name)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in publication count: {e}")
            dispatcher.utter_message(text="Có lỗi khi thống kê công trình khoa học.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionLietKeCongTrinhKhoaHoc(Action):
    def name(self) -> Text:
        return "action_liet_ke_cong_trinh_khoa_hoc"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            # Fallback to slot values
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")
            
            if not expert_id:
                dispatcher.utter_message(text="Bạn muốn liệt kê công trình khoa học của chuyên gia nào?")
                return []
        else:
            expert_id = None

        print(f"DEBUG: Listing publications for: {expert_name}")

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

            # Lấy danh sách publications
            publications = get_expert_publications(expert_id)
            
            if not publications:
                dispatcher.utter_message(text=f"Không tìm thấy công trình nào của chuyên gia {expert_name}.")
                return [
                    SlotSet("expert_id", expert_id), 
                    SlotSet("expert_name", expert_name), 
                    SlotSet("name", expert_name)
                ]

            # Format và gửi response (20 công trình đầu tiên)
            message = format_publication_list(publications, expert_name, start_index=1, max_show=20)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in publication listing: {e}")
            dispatcher.utter_message(text="Có lỗi khi liệt kê công trình khoa học.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionLietKeCongTrinhKhoaHocConLai(Action):
    def name(self) -> Text:
        return "action_liet_ke_cong_trinh_khoa_hoc_con_lai"

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
                dispatcher.utter_message(text="Chưa rõ chuyên gia nào cần liệt kê công trình.")
                return []

        print(f"DEBUG: Listing remaining publications for expert ID: {expert_id}")

        try:
            # Lấy danh sách publications
            publications = get_expert_publications(expert_id)

            if len(publications) <= 20:
                dispatcher.utter_message(text="Không còn công trình nào nữa.")
                return [
                    SlotSet("expert_id", expert_id), 
                    SlotSet("expert_name", expert_name), 
                    SlotSet("name", expert_name)
                ]

            # Format và gửi response (từ công trình thứ 21 trở đi)
            message = format_publication_list(publications, expert_name, start_index=21, max_show=len(publications)-20)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in remaining publications: {e}")
            dispatcher.utter_message(text="Có lỗi khi liệt kê công trình còn lại.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionTraCuuCongTrinhTheoLoai(Action):
    def name(self) -> Text:
        return "action_tra_cuu_cong_trinh_theo_loai"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        pub_type = extract_entity(tracker, "publication_type")
        if not pub_type:
            dispatcher.utter_message(text="Bạn muốn tra cứu công trình loại gì?")
            return []
        
        print(f"DEBUG: Searching publications by type: {pub_type}")
        
        try:
            publications = get_publications_by_type(pub_type)
            message = format_publications_by_criteria(publications, "có loại", pub_type)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"DEBUG: Exception in publication type search: {e}")
            dispatcher.utter_message(text=f"Có lỗi khi tra cứu công trình theo loại: {e}")
        
        return [SlotSet("publication_type", pub_type)]


class ActionTraCuuCongTrinhTheoNam(Action):
    def name(self) -> Text:
        return "action_tra_cuu_cong_trinh_theo_nam"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        year_str = extract_entity(tracker, "year")
        if not year_str:
            dispatcher.utter_message(text="Bạn muốn tra cứu công trình năm nào?")
            return []
        
        try:
            year = int(year_str)
            print(f"DEBUG: Searching publications by year: {year}")
            
            publications = get_publications_by_year(year)
            message = format_publications_by_criteria(publications, "năm", str(year))
            dispatcher.utter_message(text=message)
            
        except ValueError:
            dispatcher.utter_message(text=f"'{year_str}' không phải là năm hợp lệ.")
        except Exception as e:
            print(f"DEBUG: Exception in publication year search: {e}")
            dispatcher.utter_message(text=f"Có lỗi khi tra cứu công trình theo năm: {e}")
        
        return [SlotSet("year", year_str)]
