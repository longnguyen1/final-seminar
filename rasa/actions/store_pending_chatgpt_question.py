from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet

class ActionStorePendingChatGPTQuestion(Action):
    def name(self):
        return "action_store_pending_chatgpt_question"

    def run(self, dispatcher, tracker, domain):
        # Lấy câu hỏi gốc từ latest_message
        question = tracker.latest_message.get('text')
        return [SlotSet("pending_chatgpt_question", question)]