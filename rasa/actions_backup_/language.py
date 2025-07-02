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


def get_expert_languages(expert_id: int) -> List[Dict]:
    """Lấy danh sách ngoại ngữ theo expert ID"""
    if not expert_id:
        return []
    
    url = f"{BASE_URL}/languages/by-expert-id?id={expert_id}"
    data = safe_api_call(url)
    
    if data and isinstance(data, list):
        return data
    return []


def get_experts_by_language(language: str) -> List[Dict]:
    """Lấy danh sách chuyên gia theo ngoại ngữ với normalization"""
    if not language:
        return []
    
    # Tạo search variations cho language
    search_variations = normalizer.get_search_variations(language, "language")
    
    experts = []
    for language_variant in search_variations:
        encoded_language = urllib.parse.quote(language_variant)
        url = f"{BASE_URL}/experts/by-language?language={encoded_language}"
        data = safe_api_call(url)
        
        if data and isinstance(data, list):
            experts.extend(data)
            if experts:  # Nếu tìm thấy rồi thì dừng
                break
    
    return experts


def format_language_skills(languages: List[Dict], expert_name: str) -> str:
    """Format kỹ năng ngoại ngữ"""
    if not languages:
        return f"Không tìm thấy thông tin ngoại ngữ của chuyên gia {expert_name}."
    
    message = f"✅ Kỹ năng ngoại ngữ của chuyên gia {expert_name}:\n"
    
    # Sắp xếp theo tên ngôn ngữ
    sorted_languages = sorted(languages, key=lambda x: x.get("language", ""))
    
    for i, lang in enumerate(sorted_languages, 1):
        language_name = lang.get('language', 'Không rõ')
        normalized_lang = normalizer.normalize_language(language_name)
        display_lang = normalized_lang if normalized_lang != language_name else language_name
        
        message += f"{i}. {display_lang}:\n"
        
        # Hiển thị từng kỹ năng
        skills = []
        skill_levels = {
            'listening': 'Nghe',
            'speaking': 'Nói', 
            'reading': 'Đọc',
            'writing': 'Viết'
        }
        
        for skill_key, skill_name in skill_levels.items():
            level = lang.get(skill_key, '')
            if level:
                skills.append(f"   • {skill_name}: {level}")
        
        if skills:
            message += "\n".join(skills) + "\n"
        else:
            message += "   • Chưa có thông tin chi tiết\n"
        
        message += "\n"
    
    return message.rstrip()


def format_language_summary(languages: List[Dict], expert_name: str) -> str:
    """Format tóm tắt ngoại ngữ (dạng ngắn gọn)"""
    if not languages:
        return f"Chuyên gia {expert_name} chưa có thông tin ngoại ngữ."
    
    language_list = []
    for lang in languages:
        language_name = lang.get('language', 'Không rõ')
        normalized_lang = normalizer.normalize_language(language_name)
        display_lang = normalized_lang if normalized_lang != language_name else language_name
        
        # Tìm kỹ năng cao nhất
        levels = []
        for skill in ['listening', 'speaking', 'reading', 'writing']:
            level = lang.get(skill, '')
            if level:
                levels.append(level)
        
        if levels:
            # Lấy level đại diện (có thể cải thiện logic này)
            representative_level = max(levels, key=len) if levels else ""
            language_list.append(f"{display_lang} ({representative_level})")
        else:
            language_list.append(display_lang)
    
    languages_text = ", ".join(language_list)
    return f"✅ Chuyên gia {expert_name} sử dụng các ngoại ngữ: {languages_text}."


def format_experts_by_language(experts: List[Dict], language: str) -> str:
    """Format danh sách chuyên gia theo ngoại ngữ"""
    if not experts:
        normalized_lang = normalizer.normalize_language(language)
        display_lang = normalized_lang if normalized_lang != language else language
        return f"Không tìm thấy chuyên gia nào sử dụng {display_lang}."
    
    normalized_lang = normalizer.normalize_language(language)
    display_lang = normalized_lang if normalized_lang != language else language
    
    message = f"✅ Danh sách chuyên gia sử dụng {display_lang}:\n"
    
    max_show = 15  # Hiển thị tối đa 15 chuyên gia
    for i, expert in enumerate(experts[:max_show], 1):
        name = expert.get("fullName", "Không rõ")
        organization = expert.get("organization", "")
        level = expert.get("level", "")  # Level của language skill nếu có
        
        message += f"{i}. {name}"
        if organization:
            message += f" - {organization}"
        if level:
            message += f" (Trình độ: {level})"
        message += "\n"
    
    if len(experts) > max_show:
        message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
    
    return message


def filter_unique_language_experts(experts: List[Dict]) -> List[Dict]:
    """Lọc duplicate experts trong language search"""
    unique_experts = []
    seen = set()
    
    for expert in experts:
        # Sử dụng fullName và language để tạo unique key
        key = (
            expert.get('fullName', '').strip().lower(),
            expert.get('language', '').strip().lower()
        )
        
        if key not in seen:
            unique_experts.append(expert)
            seen.add(key)
    
    return unique_experts


class ActionTraCuuNgoaiNgu(Action):
    def name(self) -> Text:
        return "action_tra_cuu_ngoai_ngu"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            # Fallback to slot values
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")
            
            if not expert_id:
                dispatcher.utter_message(text="Bạn muốn tra cứu ngoại ngữ của chuyên gia nào?")
                return []
        else:
            expert_id = None

        print(f"DEBUG: Searching languages for: {expert_name}")

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

            print(f"DEBUG: Found expert ID: {expert_id}")

            # Lấy danh sách ngoại ngữ
            languages = get_expert_languages(expert_id)
            
            # Format và gửi response
            message = format_language_skills(languages, expert_name)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in language search: {e}")
            dispatcher.utter_message(text="Có lỗi khi tra cứu thông tin ngoại ngữ.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionTraCuuNgoaiNguTomTat(Action):
    def name(self) -> Text:
        return "action_tra_cuu_ngoai_ngu_tom_tat"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        expert_name = extract_entity(tracker, "name")
        if not expert_name:
            expert_id = tracker.get_slot("expert_id")
            expert_name = tracker.get_slot("expert_name") or tracker.get_slot("name")
            
            if not expert_id:
                dispatcher.utter_message(text="Bạn muốn tra cứu ngoại ngữ của chuyên gia nào?")
                return []
        else:
            expert_id = None

        try:
            # Lấy thông tin expert nếu chưa có ID
            if not expert_id:
                expert = get_expert_by_name(expert_name)
                if not expert:
                    dispatcher.utter_message(text=f"Không tìm thấy chuyên gia có tên '{expert_name}'.")
                    return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]
                
                expert_id = expert.get("id")
                expert_name = expert.get("fullName", expert_name)

            # Lấy danh sách ngoại ngữ và format tóm tắt
            languages = get_expert_languages(expert_id)
            message = format_language_summary(languages, expert_name)
            dispatcher.utter_message(text=message)

            return [
                SlotSet("expert_id", expert_id), 
                SlotSet("expert_name", expert_name), 
                SlotSet("name", expert_name)
            ]

        except Exception as e:
            print(f"DEBUG: Exception in language summary: {e}")
            dispatcher.utter_message(text="Có lỗi khi tra cứu tóm tắt ngoại ngữ.")
            return [SlotSet("expert_id", None), SlotSet("expert_name", None), SlotSet("name", None)]


class ActionTraCuuChuyenGiaTheoNgoaiNgu(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_ngoai_ngu"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        language = extract_entity(tracker, "language") or extract_entity(tracker, "foreign_language")
        
        if not language:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia sử dụng ngoại ngữ nào?")
            return []
        
        print(f"DEBUG: Searching experts by language: {language}")
        
        try:
            # Lấy danh sách chuyên gia theo ngoại ngữ
            experts = get_experts_by_language(language)
            
            if not experts:
                normalized_lang = normalizer.normalize_language(language)
                display_lang = normalized_lang if normalized_lang != language else language
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào sử dụng {display_lang}.")
                return [SlotSet("language", language), SlotSet("foreign_language", language)]
            
            # Lọc duplicate experts
            unique_experts = filter_unique_language_experts(experts)
            
            # Format và gửi response
            message = format_experts_by_language(unique_experts, language)
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"DEBUG: Exception in language expert search: {e}")
            dispatcher.utter_message(text=f"Có lỗi khi tra cứu chuyên gia theo ngoại ngữ: {e}")
        
        return [SlotSet("language", language), SlotSet("foreign_language", language)]


class ActionTraCuuChuyenGiaTheoTrinhDoNgoaiNgu(Action):
    def name(self) -> Text:
        return "action_tra_cuu_chuyen_gia_theo_trinh_do_ngoai_ngu"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        language = extract_entity(tracker, "language") or extract_entity(tracker, "foreign_language")
        level = extract_entity(tracker, "language_level") or extract_entity(tracker, "level")
        
        if not language:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia sử dụng ngoại ngữ nào?")
            return []
            
        if not level:
            dispatcher.utter_message(text="Bạn muốn tra cứu chuyên gia có trình độ ngoại ngữ như thế nào?")
            return []
        
        print(f"DEBUG: Searching experts by language: {language}, level: {level}")
        
        try:
            # Normalize language và level
            normalized_lang = normalizer.normalize_language(language)
            normalized_level = normalizer.normalize_language_level(level)
            
            # Gọi API search theo language và level
            encoded_language = urllib.parse.quote(normalized_lang)
            encoded_level = urllib.parse.quote(normalized_level)
            url = f"{BASE_URL}/experts/by-language-level?language={encoded_language}&level={encoded_level}"
            data = safe_api_call(url)
            
            if not data:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào có trình độ {level} cho {language}.")
                return [
                    SlotSet("language", language), 
                    SlotSet("foreign_language", language),
                    SlotSet("language_level", level),
                    SlotSet("level", level)
                ]
            
            experts = data if isinstance(data, list) else data.get("experts", [])
            
            if not experts:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào có trình độ {level} cho {language}.")
                return [
                    SlotSet("language", language), 
                    SlotSet("foreign_language", language),
                    SlotSet("language_level", level),
                    SlotSet("level", level)
                ]
            
            # Format response
            message = f"✅ Danh sách chuyên gia có trình độ {normalized_level} cho {normalized_lang}:\n"
            max_show = 15
            
            for i, expert in enumerate(experts[:max_show], 1):
                name = expert.get("fullName", "Không rõ")
                organization = expert.get("organization", "")
                
                message += f"{i}. {name}"
                if organization:
                    message += f" - {organization}"
                message += "\n"
            
            if len(experts) > max_show:
                message += f"... (Còn {len(experts) - max_show} chuyên gia khác)"
            
            dispatcher.utter_message(text=message)
            
        except Exception as e:
            print(f"DEBUG: Exception in language level search: {e}")
            dispatcher.utter_message(text=f"Có lỗi khi tra cứu chuyên gia theo trình độ ngoại ngữ: {e}")
        
        return [
            SlotSet("language", language), 
            SlotSet("foreign_language", language),
            SlotSet("language_level", level),
            SlotSet("level", level)
        ]
