"""
Publication search actions for Rasa chatbot
"""
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests
import logging

from .utils import BASE_URL, extract_entity, safe_get
from .context.context_utils import extract_context_entity, detect_query_context
from .context.context_normalizer import normalizer

logger = logging.getLogger(__name__)

class ActionSearchByPublicationTitle(Action):
    def name(self) -> Text:
        return "action_search_by_publication_title"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Extract publication title
            title = extract_context_entity(tracker, "publication_title", "title")
            
            if not title:
                dispatcher.utter_message(
                    text="Xin lỗi, tôi không tìm thấy tên công trình bạn muốn tìm. "
                         "Bạn có thể cho tôi biết tên công trình cụ thể không?"
                )
                return []

            # API call
            response = requests.get(
                f"{BASE_URL}/experts/search/by-publication-title",
                params={"title": title},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                experts = data.get("data", [])
                
                if experts:
                    count = len(experts)
                    message = f"Tôi tìm thấy {count} chuyên gia có công trình với tên '{title}':\n\n"
                    
                    for expert in experts[:5]:  # Limit to 5 results
                        name = safe_get(expert, "fullName", "N/A")
                        org = safe_get(expert, "organization", "N/A")
                        pub_title = safe_get(expert, "publicationTitle", title)
                        pub_year = safe_get(expert, "publicationYear", "N/A")
                        pub_type = safe_get(expert, "publicationType", "N/A")
                        
                        message += f"👨‍🏫 **{name}**\n"
                        message += f"🏢 Cơ quan: {org}\n"
                        message += f"📖 Công trình: {pub_title} ({pub_year})\n"
                        message += f"📝 Loại: {pub_type}\n\n"
                    
                    if count > 5:
                        message += f"... và {count - 5} chuyên gia khác."
                else:
                    message = f"Không tìm thấy chuyên gia nào có công trình với tên '{title}'."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text="Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau."
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau."
            )
        except Exception as e:
            logger.error(f"Error in publication title search: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
            )
        
        return []

class ActionSearchByPublicationType(Action):
    def name(self) -> Text:
        return "action_search_by_publication_type"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Extract publication type
            pub_type = extract_context_entity(tracker, "publication_type", "type")
            
            if not pub_type:
                dispatcher.utter_message(
                    text="Xin lỗi, tôi không hiểu loại công trình bạn muốn tìm. "
                         "Bạn có thể nói rõ hơn như 'bài báo', 'sách', 'hội thảo' không?"
                )
                return []

            # API call
            response = requests.get(
                f"{BASE_URL}/experts/search/by-publication-type",
                params={"type": pub_type},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                experts = data.get("data", [])
                
                if experts:
                    count = len(experts)
                    message = f"Tôi tìm thấy {count} chuyên gia có công trình loại '{pub_type}':\n\n"
                    
                    for expert in experts[:5]:
                        name = safe_get(expert, "fullName", "N/A")
                        org = safe_get(expert, "organization", "N/A")
                        pub_title = safe_get(expert, "publicationTitle", "N/A")
                        pub_year = safe_get(expert, "publicationYear", "N/A")
                        
                        message += f"👨‍🏫 **{name}**\n"
                        message += f"🏢 Cơ quan: {org}\n"
                        message += f"📖 Công trình gần nhất: {pub_title} ({pub_year})\n\n"
                    
                    if count > 5:
                        message += f"... và {count - 5} chuyên gia khác."
                else:
                    message = f"Không tìm thấy chuyên gia nào có công trình loại '{pub_type}'."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text="Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau."
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau."
            )
        except Exception as e:
            logger.error(f"Error in publication type search: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
            )
        
        return []

class ActionSearchByPublicationYear(Action):
    def name(self) -> Text:
        return "action_search_by_publication_year"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Extract publication year
            year_str = extract_context_entity(tracker, "publication_year", "year")
            
            if not year_str:
                dispatcher.utter_message(
                    text="Xin lỗi, tôi không tìm thấy năm xuất bản bạn muốn tìm. "
                         "Bạn có thể cho tôi biết năm cụ thể không?"
                )
                return []

            try:
                year = int(year_str)
            except ValueError:
                dispatcher.utter_message(
                    text="Xin lỗi, năm bạn nhập không hợp lệ. Vui lòng nhập năm dưới dạng số."
                )
                return []

            # API call
            response = requests.get(
                f"{BASE_URL}/experts/search/by-publication-year",
                params={"year": year},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                experts = data.get("data", [])
                
                if experts:
                    count = len(experts)
                    message = f"Tôi tìm thấy {count} chuyên gia có công trình xuất bản năm {year}:\n\n"
                    
                    for expert in experts[:5]:
                        name = safe_get(expert, "fullName", "N/A")
                        org = safe_get(expert, "organization", "N/A")
                        pub_title = safe_get(expert, "publicationTitle", "N/A")
                        pub_type = safe_get(expert, "publicationType", "N/A")
                        
                        message += f"👨‍🏫 **{name}**\n"
                        message += f"🏢 Cơ quan: {org}\n"
                        message += f"📖 Công trình {year}: {pub_title}\n"
                        message += f"📝 Loại: {pub_type}\n\n"
                    
                    if count > 5:
                        message += f"... và {count - 5} chuyên gia khác."
                else:
                    message = f"Không tìm thấy chuyên gia nào có công trình xuất bản năm {year}."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text="Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau."
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau."
            )
        except Exception as e:
            logger.error(f"Error in publication year search: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
            )
        
        return []

class ActionSearchByPublicationAuthor(Action):
    def name(self) -> Text:
        return "action_search_by_publication_author"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Extract publication author
            author = extract_context_entity(tracker, "publication_author", "author")
            
            if not author:
                dispatcher.utter_message(
                    text="Xin lỗi, tôi không tìm thấy tên tác giả bạn muốn tìm. "
                         "Bạn có thể cho tôi biết tên tác giả cụ thể không?"
                )
                return []

            # API call
            response = requests.get(
                f"{BASE_URL}/experts/search/by-publication-author",
                params={"author": author},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                experts = data.get("data", [])
                
                if experts:
                    count = len(experts)
                    message = f"Tôi tìm thấy {count} chuyên gia có công trình của tác giả '{author}':\n\n"
                    
                    for expert in experts[:5]:
                        name = safe_get(expert, "fullName", "N/A")
                        org = safe_get(expert, "organization", "N/A")
                        pub_title = safe_get(expert, "publicationTitle", "N/A")
                        pub_year = safe_get(expert, "publicationYear", "N/A")
                        pub_author = safe_get(expert, "publicationAuthor", author)
                        
                        message += f"👨‍🏫 **{name}**\n"
                        message += f"🏢 Cơ quan: {org}\n"
                        message += f"📖 Công trình: {pub_title} ({pub_year})\n"
                        message += f"✍️ Tác giả: {pub_author}\n\n"
                    
                    if count > 5:
                        message += f"... và {count - 5} chuyên gia khác."
                else:
                    message = f"Không tìm thấy chuyên gia nào có công trình của tác giả '{author}'."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text="Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau."
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau."
            )
        except Exception as e:
            logger.error(f"Error in publication author search: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
            )
        
        return []

class ActionSearchByPublicationPlace(Action):
    def name(self) -> Text:
        return "action_search_by_publication_place"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Extract publication place
            place = extract_context_entity(tracker, "publication_place", "place")
            
            if not place:
                dispatcher.utter_message(
                    text="Xin lỗi, tôi không tìm thấy nơi xuất bản bạn muốn tìm. "
                         "Bạn có thể cho tôi biết nơi xuất bản cụ thể không?"
                )
                return []

            # API call
            response = requests.get(
                f"{BASE_URL}/experts/search/by-publication-place",
                params={"place": place},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                experts = data.get("data", [])
                
                if experts:
                    count = len(experts)
                    message = f"Tôi tìm thấy {count} chuyên gia có công trình xuất bản tại '{place}':\n\n"
                    
                    for expert in experts[:5]:
                        name = safe_get(expert, "fullName", "N/A")
                        org = safe_get(expert, "organization", "N/A")
                        pub_title = safe_get(expert, "publicationTitle", "N/A")
                        pub_year = safe_get(expert, "publicationYear", "N/A")
                        pub_place = safe_get(expert, "publicationPlace", place)
                        
                        message += f"👨‍🏫 **{name}**\n"
                        message += f"🏢 Cơ quan: {org}\n"
                        message += f"📖 Công trình: {pub_title} ({pub_year})\n"
                        message += f"🌍 Nơi xuất bản: {pub_place}\n\n"
                    
                    if count > 5:
                        message += f"... và {count - 5} chuyên gia khác."
                else:
                    message = f"Không tìm thấy chuyên gia nào có công trình xuất bản tại '{place}'."
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text="Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau."
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, không thể kết nối đến hệ thống. Vui lòng thử lại sau."
            )
        except Exception as e:
            logger.error(f"Error in publication place search: {e}")
            dispatcher.utter_message(
                text="Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau."
            )
        
        return []
