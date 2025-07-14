from typing import Any, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

class ActionResetChuyenGia(Action):
    def name(self) -> str:
        return "action_reset_chuyen_gia"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[str, Any]) -> List[Dict[str, Any]]:
        dispatcher.utter_message(response="utter_reset_chuyen_gia")
        return [SlotSet("expert_name", None), SlotSet("expert_id", None)]
