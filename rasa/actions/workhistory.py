from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import urllib.parse

# Import context utilities
from .context.context_utils import extract_context_entity, extract_multiple_entities
from .context.context_normalizer import normalizer
from .utils import (
    extract_entity,
    safe_api_call,
    get_expert_by_name,
    BASE_URL
)


def get_expert_work_history_standard(expert_id: int) -> List[Dict]:
    """EXISTING ROUTE: Individual expert work history"""
    if not expert_id:
        return []
    
    # EXISTING ROUTE: GET /api/experts/[id]/workHistories
    url = f"{BASE_URL}/experts/{expert_id}/workHistories"
    data = safe_api_call(url)
    
    return data if isinstance(data, list) else []


def search_experts_by_workplace(workplace: str) -> List[Dict]:
    """NEW ROUTE: Tìm kiếm chuyên gia theo previous workplace"""
    if not workplace:
        return []
    
    # Context-aware normalization
    normalized_workplace = normalizer.normalize_previous_workplace(workplace)
    search_variations = normalizer.get_search_variations(workplace, "previous_workplace")
    
    experts = []
    for workplace_variant in search_variations:
        encoded_workplace = urllib.parse.quote(workplace_variant)
        # NEW ROUTE: GET /api/experts/search/by-workplace
        url = f"{BASE_URL}/experts/search/by-workplace?workplace={encoded_workplace}"
        
        data = safe_api_call(url)
        if data and isinstance(data.get("data"), list):
            experts = data.get("data", [])
            break  # First successful match wins
    
    return experts


def search_experts_by_position(position: str) -> List[Dict]:
    """NEW ROUTE: Tìm kiếm chuyên gia theo position"""
    if not position:
        return []
    
    # Context-aware normalization
    normalized_position = normalizer.normalize_position(position)
    search_variations = normalizer.get_search_variations(position, "position")
    
    experts = []
    for position_variant in search_variations:
        encoded_position = urllib.parse.quote(position_variant)
        # NEW ROUTE: GET /api/experts/search/by-position
        url = f"{BASE_URL}/experts/search/by-position?position={encoded_position}"
        
        data = safe_api_call(url)
        if data and isinstance(data.get("data"), list):
            experts = data.get("data", [])
            break  # First successful match wins
    
    return experts


def format_work_history_standard(work_histories: List[Dict], expert_name: str) -> str:
    """STANDARD: Format lịch sử làm việc"""
    if not work_histories:
        return f"Không tìm thấy thông tin lịch sử làm việc của chuyên gia {expert_name}."
    
    message = f"✅ Lịch sử làm việc của chuyên gia {expert_name}:\n"
    
    # Sort theo năm bắt đầu (mới nhất trước)
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
        
        # Normalize display names
        normalized_workplace = normalizer.normalize_previous_workplace(workplace)
        normalized_position = normalizer.normalize_position(position)
        
        # Format time period
        if start_year == "Chưa rõ":
            time_period = "Thời gian không rõ"
        elif end_year == "Hiện tại" or not end_year:
            time_period = f"{start_year} - Hiện tại"
        else:
            time_period = f"{start_year} - {end_year}"
        
        message += f"🏢 {normalized_workplace}\n"
        message += f"   📋 Vị trí: {normalized_position}\n"
        message += f"   📅 Thời gian: {time_period}\n\n"
    
    return message.rstrip()


def format_experts_by_previous_workplace(experts: List[Dict], workplace: str) -> str:
    """CONTEXT-AWARE: Format chuyên gia theo previous workplace"""
    if not experts:
        display_workplace = normalizer.normalize_previous_workplace(workplace)
        return f"Không tìm thấy chuyên gia nào từng làm việc tại {display_workplace}."
    
    display_workplace = normalizer.normalize_previous_workplace(workplace)
    message = f"✅ Danh sách chuyên gia từng làm việc tại {display_workplace}:\n"
    
    max_show = 8  # Optimized limit
    for i, expert in enumerate(experts[:max_show], 1):
        name = expert.get("fullName", "Không rõ")
        position = expert.get("position", "")
        start_year = expert.get("startYear", "")
        end_year = expert.get("endYear", "")
        current_org = expert.get("organization", "")
        
        message += f"{i}. {name}"
        
        # Add position if available
        if position:
            normalized_position = normalizer.normalize_position(position)
            message += f" - {normalized_position}"
        
        # Add time period
        if start_year:
            if end_year:
                message += f" ({start_year}-{end_year})"
            else:
                message += f" ({start_year}-?)"
        
        # Add current organization
        if current_org:
            normalized_current = normalizer.normalize_current_workplace(current_org)
            message += f" - Hiện tại: {normalized_current}"
        
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message


def format_experts_by_position(experts: List[Dict], position: str) -> str:
    """CONTEXT-AWARE: Format chuyên gia theo position"""
    if not experts:
        display_position = normalizer.normalize_position(position)
        return f"Không tìm thấy chuyên gia có vị trí '{display_position}'."
    
    display_position = normalizer.normalize_position(position)
    message = f"✅ Danh sách chuyên gia có/từng có vị trí {display_position}:\n"
    
    max_show = 8  # Optimized limit
    for i, expert in enumerate(experts[:max_show], 1):
        name = expert.get("fullName", "Không rõ")
        workplace = expert.get("workplace", "")
        current_org = expert.get("organization", "")
        
        message += f"{i}. {name}"
        
        # Add previous workplace if available
        if workplace:
            normalized_workplace = normalizer.normalize_previous_workplace(workplace)
            message += f" - Từng: {normalized_workplace}"
        
        # Add current organization
        if current_org:
            normalized_current = normalizer.normalize_current_workplace(current_org)
            message += f" - Hiện tại: {normalized_current}"
        
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message


def filter_unique_workhistory_experts(experts: List[Dict]) -> List[Dict]:
    """OPTIMIZED: Lọc duplicate experts"""
    if not experts:
        return []
    
    unique_experts = []
    seen_keys = set()
    
    for expert in experts:
        if expert.get("deleted", False):
            continue
        
        name = expert.get('fullName', '').strip().lower()
        email = expert.get('email', '').strip().lower()
        expert_id = expert.get('id', '')
        
        # Priority: id > email > name
        if expert_id:
            key = f"id_{expert_id}"
        elif email:
            key = f"email_{email}"
        else:
            key = f"name_{name}"
        
        if key not in seen_keys and name:
            unique_experts.append(expert)
            seen_keys.add(key)
    
    return unique_experts


class ActionTraCuuLichSuLamViec(Action):
    """EXISTING ROUTE: Individual expert work history"""
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
            # Get expert info
            expert = get_expert_by_name(expert_name)
            if not expert:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
                return [SlotSet("name", expert_name)]
            
            expert_id = expert.get("id")
            if not expert_id:
                dispatcher.utter_message(text="Không thể lấy ID của chuyên gia.")
                return [SlotSet("name", expert_name)]
            
            # EXISTING ROUTE: GET /api/experts/[id]/workHistories
            work_histories = get_expert_work_history_standard(expert_id)
            
            # Format and send response
            message = format_work_history_standard(work_histories, expert.get('fullName', expert_name))
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu lịch sử làm việc.")
        
        return [SlotSet("name", expert_name)]


class ActionTraCuuChuyenGiaTheoNoiLamViec(Action):
    """NEW ROUTE: Previous workplace search"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_noi_lam_viec"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # CONTEXT-AWARE: Priority extraction
        previous_workplace = extract_context_entity(
            tracker,
            primary_entity="previous_workplace",
            fallback_entity="workplace"
        )
        
        if not previous_workplace:
            dispatcher.utter_message(response="utter_hoi_noi_lam_viec")
            return []
        
        try:
            # NEW ROUTE: GET /api/experts/search/by-workplace
            experts = search_experts_by_workplace(previous_workplace)
            
            # Filter unique experts
            unique_experts = filter_unique_workhistory_experts(experts)
            
            # Format response với context clarity
            message = format_experts_by_previous_workplace(unique_experts, previous_workplace)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo nơi làm việc.")
        
        return [SlotSet("previous_workplace", previous_workplace)]


class ActionTraCuuChuyenGiaTheoViTri(Action):
    """NEW ROUTE: Position search"""
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_vi_tri"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        position = extract_entity(tracker, "position")
        
        if not position:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia có vị trí công việc gì?")
            return []
        
        try:
            # NEW ROUTE: GET /api/experts/search/by-position
            experts = search_experts_by_position(position)
            
            # Filter unique experts
            unique_experts = filter_unique_workhistory_experts(experts)
            
            # Format response với context clarity
            message = format_experts_by_position(unique_experts, position)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            dispatcher.utter_message(text="Có lỗi khi tra cứu chuyên gia theo vị trí.")
        
        return [SlotSet("position", position)]