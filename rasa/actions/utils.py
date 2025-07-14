# File: expert-dashboard/rasa/actions/utils.py
import requests
import urllib.parse
from typing import Optional, Dict, List

BASE_URL = "http://localhost:3000/api"


def search_experts(
    expert_name=None,
    current_work=None,
    degree=None,
    academic_title=None,
    phone=None,
    email=None,
    school=None,
    major=None,
    position=None,
    limit=10,
    offset=0,
    **kwargs
):
    url = "http://localhost:3000/api/experts/search-advance"
    payload = {
        "expert_name": expert_name,
        "current_workplace": current_work,
        "degree": degree,
        "academic_title": academic_title,
        "phone": phone,
        "email": email,
        "graduated_school": school,
        "major": major,
        "position": position,
        "limit": limit,
        "offset": offset,
    }
    # Bỏ các key có giá trị None để tránh gửi thừa
    payload = {k: v for k, v in payload.items() if v is not None}
    payload.update(kwargs)
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        return data.get("data", []), data.get("total", 0)
    return [], 0

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