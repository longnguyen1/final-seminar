import requests
from typing import Dict, List, Optional
import urllib.parse

BASE_URL = "http://localhost:3000/api"

def get_expert_by_name(name: str) -> Optional[Dict]:
    """Lấy thông tin expert theo tên"""
    try:
        encoded_name = urllib.parse.quote(name)
        res = requests.get(f"{BASE_URL}/experts/search-all?name={encoded_name}", timeout=10)
        if res.status_code == 200 and res.text.strip():
            data = res.json()
            experts = data.get("experts", [])
            return experts[0] if experts else None
    except Exception as e:
        print(f"Error getting expert by name: {e}")
        return None

def format_expert_list(experts: List[Dict], max_show: int = 12) -> str:
    """Format danh sách chuyên gia"""
    if not experts:
        return "Không tìm thấy chuyên gia nào."
    
    message = ""
    for expert in experts[:max_show]:
        message += f"- {expert.get('fullName', 'Không rõ')}"
        if expert.get('academicTitle'):
            message += f" ({expert.get('academicTitle')})"
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message

def safe_api_call(url: str) -> Optional[Dict]:
    """Safe API call với error handling"""
    try:
        print(f"DEBUG: Calling API: {url}")
        res = requests.get(url, timeout=10)
        print(f"DEBUG: Response status: {res.status_code}")
        
        if res.status_code == 200 and res.text.strip():
            data = res.json()
            print(f"DEBUG: Response data type: {type(data)}")
            return data
    except requests.exceptions.Timeout:
        print("DEBUG: API call timeout")
    except requests.exceptions.RequestException as e:
        print(f"DEBUG: Request error: {e}")
    except ValueError as e:
        print(f"DEBUG: JSON parse error: {e}")
    except Exception as e:
        print(f"DEBUG: Unexpected error: {e}")
    return None

def extract_entity(tracker, entity_name: str) -> Optional[str]:
    """Extract entity value từ tracker"""
    try:
        # Ưu tiên latest entity
        value = next(tracker.get_latest_entity_values(entity_name), None)
        if value and value.strip():
            return value.strip()
        
        # Fallback to slot
        slot_value = tracker.get_slot(entity_name)
        return slot_value.strip() if slot_value and slot_value.strip() else None
    except Exception:
        return None

def extract_multiple_entities(tracker, entity_name: str) -> List[str]:
    """Extract multiple entity values"""
    try:
        entities = tracker.latest_message.get("entities", [])
        values = [e.get("value") for e in entities if e.get("entity") == entity_name and e.get("value")]
        return [v.strip() for v in values if v and v.strip()]
    except Exception:
        return []

def format_expert_detail(expert: Dict) -> str:
    """Format thông tin chi tiết expert"""
    name = expert.get('fullName', 'Không rõ')
    message = f"✅ Thông tin chuyên gia {name}:\n"
    message += f"- Đơn vị: {expert.get('organization', 'Chưa có')}\n"
    message += f"- Giới tính: {expert.get('gender', 'Chưa có')}\n"
    message += f"- Năm sinh: {expert.get('birthYear', 'Chưa có')}\n"
    message += f"- Học vị: {expert.get('degree', 'Chưa có')}\n"
    
    if expert.get('academicTitle'):
        message += f"- Học hàm: {expert.get('academicTitle')}\n"
    
    message += f"- Email: {expert.get('email', 'Không có')}\n"
    message += f"- Số điện thoại: {expert.get('phone', 'Không có')}\n"
    
    return message