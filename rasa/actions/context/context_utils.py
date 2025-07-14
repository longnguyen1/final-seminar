# expert-dashboard/rasa/actions/context/context_utils.py
"""
Context detection and entity extraction utilities
# Chức năng: Phát hiện context từ user message và extract entities
"""
from typing import Dict, List, Optional
from rasa_sdk import Tracker
import requests
import urllib.parse

BASE_URL = "http://localhost:3000/api/rasa"

# Context detection keywords
CONTEXT_KEYWORDS = {
    "current_workplace": [
        "hiện tại làm", "đang làm", "đang công tác", "hiện làm việc tại", 
        "bây giờ làm", "làm việc hiện tại", "công ty hiện tại", "đang công tác"
    ],
    "graduated_school": [
        "tốt nghiệp", "học ở", "cựu sinh viên", "alumni", "ra trường",
        "graduated", "học xong", "education", "đã ra trường" , "học tại"
    ],
    "previous_workplace": [
        "đã làm", "từng làm", "trước đây", "cựu nhân viên", "ex-",
        "từng công tác", "previously", "used to work", "worked at", "đã từng"
    ],
    "major": [
        "chuyên ngành về", "chuyên môn", "lĩnh vực", "chuyên môn",
        "chuyên môn bên", "chuyên ngành bên", "chuyên sâu", "theo chuyên ngành"
    ],
    "academic_title": [
        "danh hiệu", "học hàm ", "giáo sư", "associate professor", 
        "danh tiếng", "danh hiệu giảng dạy", "PhD", "academic title"
    ],
    "position": [
        "vị trí", "chức vụ", "công việc", "đảm nhiệm", "chức vị",
        "current position", "current role", "current job", "current title"
    ],
    "degree": [
        "bằng cấp", "degree", "qualification", "academic degree",
        "bằng", "học vị", "bằng cấp học thuật"
    ],
    
}

def safe_api_call_get(url: str) -> dict:
    """Simple GET API call"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        return {}
    except:
        return {}

def safe_api_call_post(url: str, payload: dict) -> dict:
    """Simple POST API call"""
    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
        return {}
    except:
        return {}
    
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

def get_expert_by_name(name: str) -> Optional[Dict]:
    """Lấy thông tin expert theo tên"""
    try:
        url = f"{BASE_URL}/experts/search-all"
        payload = {"name": name}
        encoded_name = urllib.parse.quote(name)
        print(f"[DEBUG] Gửi POST tới {url} với payload: {payload}")
        res = requests.get(f"{BASE_URL}/experts/search-all?name={encoded_name}", timeout=10)
        print(f"[DEBUG] Status code: {res.status_code}")
        print(f"[DEBUG] Response text: {res.text}")
        if res.status_code == 200 and res.text.strip():
            data = res.json()
            experts = data.get("experts", [])
            return experts[0] if experts else None
    except Exception as e:
        print(f"Error getting expert by name: {e}")
        return None
    
def extract_context_entity(tracker: Tracker, primary_entity: str, fallback_entity: str = None) -> Optional[str]:
    """Extract entity with context priority, hỗ trợ đại từ thay thế"""
    entities = tracker.latest_message.get('entities', [])
    user_message = tracker.latest_message.get('text', '').lower()

    # 1. Ưu tiên entity trong message
    for entity in entities:
        if entity.get('entity') == primary_entity:
            value = entity.get('value')
            if value and value.strip():
                return value.strip()

    # 2. Nhận diện đại từ thay thế (ví dụ: "ông ấy", "bà ấy", "trường này", "vị trí đó")
    pronoun_map = {
        "ông ấy": "expert_name",
        "ông ta": "expert_name",
        "cô ta": "expert_name",
        "bà ấy": "expert_name",
        "bà ta": "expert_name",
        "anh ấy": "expert_name",
        "anh ta": "expert_name",
        "cô ấy": "expert_name",
        "chị ấy": "expert_name",
        "chị ta": "expert_name",
        "người đó": "expert_name",
        "người này": "expert_name",
        "trường này": "graduated_school",
        "vị trí đó": "position",
        "nơi này": "current_workplace",
        "nơi đó": "previous_workplace"

    }
    for pronoun, slot_name in pronoun_map.items():
        if pronoun in user_message and slot_name == primary_entity:
            slot_value = tracker.get_slot(slot_name)
            if slot_value:
                return slot_value

    # 3. Fallback: lấy từ slot nếu không có entity trong message
    slot_value = tracker.get_slot(primary_entity)
    if slot_value:
        return slot_value

    # 4. Fallback tiếp theo (nếu có)
    if fallback_entity:
        for entity in entities:
            if entity.get('entity') == fallback_entity:
                value = entity.get('value')
                if value and value.strip():
                    return value.strip()
    
    return None

def detect_query_context(user_message: str) -> str:
    """Detect intended context from user message"""
    if not user_message:
        return "current_workplace"
        
    message_lower = user_message.lower()
    
    # Check for explicit context keywords
    for context, keywords in CONTEXT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in message_lower:
                return context
    
    # Default context based on common patterns
    if any(word in message_lower for word in ["tốt nghiệp", "học", "cựu sinh viên", "alumni"]):
        return "graduated_school"
    elif any(word in message_lower for word in ["đã làm", "từng làm", "cựu nhân viên", "former"]):
        return "previous_workplace"
    else:
        return "current_workplace"  # Default assumption

def extract_multiple_entities(tracker: Tracker, entity_name: str) -> List[str]:
    """Extract multiple entities of the same type"""
    entities = tracker.latest_message.get('entities', [])
    values = []
    
    for entity in entities:
        if entity.get('entity') == entity_name:
            value = entity.get('value')
            if value and value.strip() and value.strip() not in values:
                values.append(value.strip())
    
    return values

def get_entity_confidence(tracker: Tracker, entity_name: str) -> float:
    """Get confidence score for entity extraction"""
    entities = tracker.latest_message.get('entities', [])
    
    for entity in entities:
        if entity.get('entity') == entity_name:
            return entity.get('confidence', 0.0)
    
    return 0.0

def disambiguate_context(entities: List[Dict], user_message: str) -> Dict:
    """Disambiguate context when multiple entities detected"""
    detected_context = detect_query_context(user_message)
    
    # Find matching entity for detected context
    for entity in entities:
        entity_type = entity.get('entity', '')
        if detected_context in entity_type:
            return {
                'entity': entity,
                'context': detected_context,
                'confidence': entity.get('confidence', 0.8)
            }
    
    # Fallback to first entity with default context
    if entities:
        return {
            'entity': entities[0],
            'context': 'current_workplace',
            'confidence': 0.6
        }
    
    return {}