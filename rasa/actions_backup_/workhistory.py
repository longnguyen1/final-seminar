from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import urllib.parse

# Import từ utils và normalizer
from .utils import (
    extract_entity,
    extract_multiple_entities,
    safe_api_call,
    get_expert_by_name,
    format_expert_list,
    BASE_URL
)
from .data_normalizer import normalizer


def get_expert_work_history(expert_id: int) -> List[Dict]:
    """Lấy lịch sử làm việc theo expert ID"""
    if not expert_id:
        return []
    
    url = f"{BASE_URL}/workHistories/by-expert-id?id={expert_id}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def get_experts_by_workplace(workplace: str) -> List[Dict]:
    """TỐI ƯU: Lấy danh sách chuyên gia theo nơi làm việc với context-aware normalization"""
    if not workplace:
        return []
    
    # PLAN: Context-aware normalization cho previous_workplace
    normalized_workplace = normalizer.normalize_previous_workplace(workplace)
    search_variations = normalizer.get_search_variations(workplace, "previous_workplace")
    
    # Thêm normalized value nếu khác original
    if normalized_workplace != workplace:
        search_variations.insert(0, normalized_workplace)
    
    # Remove duplicates
    search_variations = list(set([v for v in search_variations if v and v.strip()]))
    
    experts = []
    for workplace_variant in search_variations:
        encoded_workplace = urllib.parse.quote(workplace_variant)
        url = f"{BASE_URL}/experts/by-workplace?workplace={encoded_workplace}"
        data = safe_api_call(url)
        
        if data and isinstance(data, list):
            experts.extend(data)
            if experts:  # First match wins để tối ưu
                break
    
    return experts


def format_work_history(work_histories: List[Dict], expert_name: str) -> str:
    """Format lịch sử làm việc"""
    if not work_histories:
        return f"Không tìm thấy thông tin lịch sử làm việc của chuyên gia {expert_name}."
    
    message = f"✅ Lịch sử làm việc của chuyên gia {expert_name}:\n"
    
    # Sắp xếp theo năm bắt đầu (mới nhất trước)
    sorted_histories = sorted(
        work_histories, 
        key=lambda x: x.get("startYear", 0), 
        reverse=True
    )
    
    for work in sorted_histories:
        start_year = work.get("startYear", "Chưa rõ")
        end_year = work.get("endYear", "Hiện tại")
        position = work.get("position", "Chưa rõ")
        workplace = work.get("workplace", "Chưa rõ")
        
        # Format time period
        if start_year == "Chưa rõ":
            time_period = "Thời gian không rõ"
        elif end_year == "Hiện tại" or not end_year:
            time_period = f"{start_year} - Hiện tại"
        else:
            time_period = f"{start_year} - {end_year}"
        
        # PLAN: Hiển thị normalized workplace name
        normalized_workplace = normalizer.normalize_previous_workplace(workplace)
        
        message += f"- {normalized_workplace}\n"
        message += f"  Vị trí: {position}\n"
        message += f"  Thời gian: {time_period}\n\n"
    
    return message.rstrip()


def format_experts_by_workplace(experts: List[Dict], workplace: str) -> str:
    """UPDATED: Format danh sách chuyên gia theo nơi làm việc với normalized workplace name"""
    if not experts:
        # Hiển thị normalized workplace name
        display_workplace = normalizer.normalize_previous_workplace(workplace)
        return f"Không tìm thấy chuyên gia nào từng làm việc tại {display_workplace}."
    
    # Hiển thị normalized workplace name
    display_workplace = normalizer.normalize_previous_workplace(workplace)
    message = f"✅ Danh sách chuyên gia từng làm việc tại {display_workplace}:\n"
    
    max_show = 10  # Reduced for small project
    for i, expert in enumerate(experts[:max_show], 1):
        name = expert.get("fullName", "Không rõ")
        position = expert.get("position", "")
        start_year = expert.get("startYear", "")
        end_year = expert.get("endYear", "")
        
        message += f"{i}. {name}"
        
        # Thêm thông tin vị trí nếu có
        if position:
            normalized_position = normalizer.normalize_position(position)
            message += f" - {normalized_position}"
        
        # Thêm thông tin thời gian nếu có
        if start_year:
            if end_year:
                message += f" ({start_year}-{end_year})"
            else:
                message += f" ({start_year}-Hiện tại)"
        
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message


def format_experts_by_position(experts: List[Dict], position: str) -> str:
    """NEW: Format danh sách chuyên gia theo vị trí với normalized position name"""
    if not experts:
        # Hiển thị normalized position name
        display_position = normalizer.normalize_position(position)
        return f"Không tìm thấy chuyên gia có vị trí '{display_position}'."
    
    # Hiển thị normalized position name
    display_position = normalizer.normalize_position(position)
    message = f"✅ Danh sách chuyên gia có/từng có vị trí {display_position}:\n"
    
    max_show = 10  # Reduced for small project
    for i, expert in enumerate(experts[:max_show], 1):
        name = expert.get("fullName", "Không rõ")
        workplace = expert.get("workplace", "")
        
        message += f"{i}. {name}"
        if workplace:
            # PLAN: Hiển thị normalized workplace name
            normalized_workplace = normalizer.normalize_previous_workplace(workplace)
            message += f" - {normalized_workplace}"
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message


def filter_unique_work_experts(experts: List[Dict]) -> List[Dict]:
    """TỐI ƯU: Lọc duplicate experts trong work history - simplified"""
    if not experts:
        return []
    
    unique_experts = []
    seen_names = set()
    
    for expert in experts:
        if expert.get("deleted", False):
            continue
            
        # Simple deduplication by name + email  
        name = expert.get('fullName', '').strip().lower()
        email = expert.get('email', '').strip().lower()
        key = f"{name}_{email}" if email else name
        
        if key not in seen_names and name:
            unique_experts.append(expert)
            seen_names.add(key)
    
    return unique_experts


class ActionTraCuuLichSuLamViec(Action):
    def name(self) -> Text:
        return "action_tra_cuu_lich_su_lam_viec"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            dispatcher.utter_message(text="Bạn muốn tra cứu lịch sử làm việc của chuyên gia nào?")
            return []
        
        try:
            # Bước 1: Lấy thông tin expert
            expert = get_expert_by_name(expert_name)
            if not expert:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
                return [SlotSet("name", expert_name)]
            
            expert_id = expert.get("id")
            if not expert_id:
                dispatcher.utter_message(text="Không thể lấy ID của chuyên gia.")
                return [SlotSet("name", expert_name)]
            
            # Bước 2: Lấy lịch sử làm việc
            work_histories = get_expert_work_history(expert_id)
            
            # Bước 3: Format và gửi response
            message = format_work_history(work_histories, expert.get('fullName', expert_name))
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu lịch sử làm việc.")
        
        return [SlotSet("name", expert_name)]


class ActionTraCuuChuyenGiaTheoNoiLamViec(Action):
    """UPDATED: Action cho previous_workplace - WorkHistory.workplace field với context-aware normalization"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_noi_lam_viec"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # PLAN: Ưu tiên previous_workplace entity mới
        previous_workplace = extract_entity(tracker, "previous_workplace")
        workplace = extract_entity(tracker, "workplace")  # Legacy fallback
        
        # Support multiple workplace entities từ NLU cũ
        workplace_entities = extract_multiple_entities(tracker, "workplace")
        if workplace_entities:
            workplace = " ".join(workplace_entities)
        
        target_workplace = previous_workplace or workplace
        
        if not target_workplace:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia đã làm việc tại đâu?")
            return []
        
        try:
            # CONTEXT-AWARE: Search trong WorkHistory.workplace field với normalization
            experts = get_experts_by_workplace(target_workplace)
            
            # Lọc duplicate experts
            unique_experts = filter_unique_work_experts(experts)
            
            # Format và gửi response với normalized workplace name
            message = format_experts_by_workplace(unique_experts, target_workplace)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo nơi làm việc.")
        
        return [
            SlotSet("previous_workplace", previous_workplace),
            SlotSet("workplace", workplace)
        ]


class ActionTraCuuChuyenGiaTheoViTri(Action):
    """UPDATED: Action cho position - WorkHistory.position field với context-aware normalization"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_vi_tri"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # PLAN: Position entity cho WorkHistory context
        position = extract_entity(tracker, "position")
        
        if not position:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia có vị trí công việc gì?")
            return []
        
        try:
            # CONTEXT-AWARE: Search với position normalization
            normalized_position = normalizer.normalize_position(position)
            search_variations = normalizer.get_search_variations(position, "position")
            
            # Thêm normalized value nếu khác original
            if normalized_position != position:
                search_variations.insert(0, normalized_position)
            
            # Remove duplicates
            search_variations = list(set([v for v in search_variations if v and v.strip()]))
            
            experts = []
            for position_variant in search_variations:
                encoded_position = urllib.parse.quote(position_variant)
                url = f"{BASE_URL}/experts/by-position?position={encoded_position}"
                data = safe_api_call(url)
                
                if data:
                    if isinstance(data, list):
                        experts.extend(data)
                    elif data.get("experts"):
                        experts.extend(data.get("experts", []))
                    
                    if experts:  # First match wins để tối ưu
                        break
            
            # Lọc duplicate experts
            unique_experts = filter_unique_work_experts(experts)
            
            # Format response với normalized position name
            message = format_experts_by_position(unique_experts, position)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo vị trí.")
        
        return [SlotSet("position", position)]