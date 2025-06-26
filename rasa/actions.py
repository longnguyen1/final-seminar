from typing import Any, Dict, List, Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import requests

class ActionCountDegree(Action):
    def name(self) -> Text:
        return "action_count_degree"
    
    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]: 
        # Extract the degree from the slot
        degree = next(tracker.get_latest_entity_values("degree"), None)

        if not degree:
            dispatcher.utter_message(text="Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể cung cấp thông tin về trình độ học vấn của chuyên gia không?")
            return [] 
        # Call the API to get the count of experts with the specified degree
        res = requests.get("http://localhost:3000/api/search-experts?action=count_degree", params={"degree": degree})
        if res.status_code == 200:
            data = res.json()   
            count = data.get("count", 0)
            if count > 0:
                dispatcher.utter_message(text=f"Có {count} chuyên gia có trình độ {degree}.")
            else:
                dispatcher.utter_message(text=f"Không có chuyên gia nào có trình độ {degree}.")
        else:
            dispatcher.utter_message(text="Đã xảy ra lỗi khi truy vấn dữ liệu. Vui lòng thử lại sau.")  
        return []
    
class ActionSearchExpert(Action):
    def name(self) -> Text:
        return "action_search_expert"
    
    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, 
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Extract the name from the slot
        name = next(tracker.get_latest_entity_values("name"), None)

        if not name:
            dispatcher.utter_message(text="Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể cung cấp tên của chuyên gia không?")
            return []
        
        # Call the API to search for the expert by name
        res = requests.get("http://localhost:3000/api/search-experts", params={"name": name})
        if res.status_code == 200:
            data = res.json()
            if data:
                expert_info = data[0]  
                message = f"Tên: {expert_info['name']}\n" \
                          f"Trình độ: {expert_info['degree']}\n"
                if expert_info.get("organization"):
                    message += f"Tổ chức: {expert_info['organization']}\n"
                if expert_info.get("field"):
                    message += f"Lĩnh vực: {expert_info['field']}\n"
                if expert_info.get("publications"):
                    message += f"Số lượng công trình: {expert_info['publications']}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy chuyên gia nào với tên đó.")
        else:
            dispatcher.utter_message(text="Đã xảy ra lỗi khi truy vấn dữ liệu. Vui lòng thử lại sau.")
        return []
    
class ActionMostPublications(Action):
    def name(self) -> Text:
        return "action_most_publications"   
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        publication = next(tracker.get_latest_entity_values("publications"), None)
        # Call the API to get the expert with the most publications
        res = requests.get("http://localhost:3000/api/search-experts?action=most_publications")
        if res.status_code == 200:
            data = res.json()
            if data:    
                expert_info = data[0]  # Assuming the API returns a list of experts
                message = f"Tên: {expert_info['name']}\n"
                message += f"Trình độ: {expert_info['degree']}\n"
                if expert_info.get("organization"):
                    message += f"Tổ chức: {expert_info['organization']}\n"
                if expert_info.get("field"):
                    message += f"Lĩnh vực: {expert_info['field']}\n"        
                message += f"Số lượng công trình: {expert_info['publications']}\n"
                dispatcher.utter_message(text=message)          
            else:
                dispatcher.utter_message(text="Không tìm thấy chuyên gia nào có công trình.")
        else:
            dispatcher.utter_message(text="Đã xảy ra lỗi khi truy vấn dữ liệu. Vui lòng thử lại sau.")  
        return []
    
class ActionTopOrganization(Action):
    def name(self) -> Text:
        return "action_top_organization"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Call the API to get the organization with the most experts
        res = requests.get("http://localhost:3000/api/search-experts?action=top_organization")
        if res.status_code == 200:
            data = res.json()
            if data:
                organization_info = data[0]  # Assuming the API returns a list of organizations
                message = f"Tổ chức: {organization_info['organization']}\n"
                message += f"Số lượng chuyên gia: {organization_info['count']}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy tổ chức nào có chuyên gia.")
        else:
            dispatcher.utter_message(text="Đã xảy ra lỗi khi truy vấn dữ liệu. Vui lòng thử lại sau.")
        return []
    
class ActionYoungestOldestExpert(Action):
    def name(self) -> Text:
        return "action_youngest_oldest_expert"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Call the API to get the youngest and oldest experts
        res = requests.get("http://localhost:3000/api/search-experts?action=youngest_oldest_expert")
        if res.status_code == 200:
            data = res.json()
            if data:
                youngest_expert = data.get("youngest")
                oldest_expert = data.get("oldest")
                if youngest_expert:
                    message = f"Chuyên gia trẻ nhất:\n"
                    message += f"Tên: {youngest_expert['name']}\n"
                    message += f"Trình độ: {youngest_expert['degree']}\n"
                    if youngest_expert.get("organization"):
                        message += f"Tổ chức: {youngest_expert['organization']}\n"
                    if youngest_expert.get("field"):
                        message += f"Lĩnh vực: {youngest_expert['field']}\n"
                    if youngest_expert.get("publications"):
                        message += f"Số lượng công trình: {youngest_expert['publications']}\n"
                    dispatcher.utter_message(text=message)
                if oldest_expert:
                    message = f"Chuyên gia lớn tuổi nhất:\n"
                    message += f"Tên: {oldest_expert['name']}\n"
                    message += f"Trình độ: {oldest_expert['degree']}\n"
                    if oldest_expert.get("organization"):
                        message += f"Tổ chức: {oldest_expert['organization']}\n"
                    if oldest_expert.get("field"):
                        message += f"Lĩnh vực: {oldest_expert['field']}\n"
                    if oldest_expert.get("publications"):
                        message += f"Số lượng công trình: {oldest_expert['publications']}\n"
                    dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy thông tin về chuyên gia.")
        else:
            dispatcher.utter_message(text="Đã xảy ra lỗi khi truy vấn dữ liệu. Vui lòng thử lại sau.")

class ActionExpertByField(Action):
    def name(self) -> Text:
        return "action_expert_by_field"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Extract the field from the slot
        field = next(tracker.get_latest_entity_values("field"), None)
        if not field:
            dispatcher.utter_message(text="Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể cung cấp lĩnh vực chuyên môn của chuyên gia không?")
            return []
        # Call the API to get experts by field
        res = requests.get("http://localhost:3000/api/search-experts", params={"field": field}) 
        if res.status_code == 200:
            data = res.json()
            if data:
                experts_info = []
                for expert in data:
                    message = f"Tên: {expert['name']}\n"
                    message += f"Trình độ: {expert['degree']}\n"
                    if expert.get("organization"):
                        message += f"Tổ chức: {expert['organization']}\n"
                    if expert.get("field"):
                        message += f"Lĩnh vực: {expert['field']}\n"
                    if expert.get("publications"):
                        message += f"Số lượng công trình: {expert['publications']}\n"
                    experts_info.append(message)
                if experts_info:
                    dispatcher.utter_message(text="\n\n".join(experts_info))
            else:
                dispatcher.utter_message(text=f"Không tìm thấy chuyên gia nào trong lĩnh vực {field}.")
        else:
            dispatcher.utter_message(text="Đã xảy ra lỗi khi truy vấn dữ liệu. Vui lòng thử lại sau.")
        return []
