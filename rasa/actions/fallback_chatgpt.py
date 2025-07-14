from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import os
import requests
from dotenv import load_dotenv
load_dotenv()  # Tự động tìm file .env ở thư mục hiện tại hoặc cha
print("DEBUG: OPENAI_API_KEY =", os.getenv("OPENAI_API_KEY"))

class ActionFallbackChatGPT(Action):
    def name(self):
        return "action_fallback_chatgpt"

    def run(self, dispatcher, tracker, domain):
        user_message = tracker.get_slot("pending_chatgpt_question")
        if not user_message:
            user_message = tracker.latest_message.get('text')

        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            dispatcher.utter_message("Không thể kết nối ChatGPT (thiếu API key).")
            return [SlotSet("pending_chatgpt_question", None)]

        headers = {
            "Authorization": f"Bearer {openai_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": user_message}],
            "max_tokens": 150
        }
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=15
            )
            if response.status_code == 200:
                answer = response.json()["choices"][0]["message"]["content"]
                dispatcher.utter_message(answer)
            else:
                dispatcher.utter_message("Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này.")
        except Exception as e:
            dispatcher.utter_message("Lỗi khi kết nối ChatGPT.")
        return [SlotSet("pending_chatgpt_question", None)]