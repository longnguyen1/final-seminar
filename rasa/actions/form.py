from rasa_sdk import FormValidationAction
from rasa_sdk.types import DomainDict
from rasa_sdk.events import SlotSet

class ValidateListExpertsByPositionAndOrPreviousWorkplaceForm(FormValidationAction):
    def name(self) -> str:
        return "validate_list_experts_by_position_and_or_previous_workplace_form"

    async def required_slots(
        self,
        slots_mapped_in_domain: list,
        dispatcher,
        tracker,
        domain: DomainDict,
    ) -> list:
        # Nếu đã có position hoặc previous_workplace thì không hỏi lại
        required = []
        if not tracker.get_slot("position"):
            required.append("position")
        if not tracker.get_slot("previous_workplace"):
            required.append("previous_workplace")
        return required