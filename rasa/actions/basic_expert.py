from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from typing import Any, Dict, List, Text
from .context.entity_mapper import EntityMapper
from .context.context_utils import extract_context_entity
from .utils import search_experts

entity_mapper = EntityMapper()

class ActionAskExpertCurrentWorkplace(Action):
    def name(self) -> Text:
        return "action_ask_expert_current_workplace"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        org = experts[0].get("organization", "Không rõ")
        dispatcher.utter_message(f"Chuyên gia {expert_name} hiện làm ở {org}.")
        return []

class ActionAskExpertDegree(Action):
    def name(self) -> Text:
        return "action_ask_expert_degree"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        degree = entity_mapper.get_canonical_form(experts[0].get("degree", "Không rõ"))
        dispatcher.utter_message(f"Chuyên gia {expert_name} có học vị {degree}.")
        return []

class ActionAskExpertContact(Action):
    def name(self) -> Text:
        return "action_ask_expert_contact"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        email = experts[0].get("email", "Không rõ")
        phone = experts[0].get("phone", "Không rõ")
        dispatcher.utter_message(f"Thông tin liên hệ của {expert_name}: Email: {email}, SĐT: {phone}.")
        return []

class ActionAskExpertGraduatedSchool(Action):
    def name(self) -> Text:
        return "action_ask_expert_graduated_school"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        educations = experts[0].get("educations", [])
        schools = set(entity_mapper.get_canonical_form(e.get("school", "")) for e in educations if e.get("school"))
        if schools:
            dispatcher.utter_message(f"{expert_name} từng học tại: {', '.join(schools)}.")
        else:
            dispatcher.utter_message(f"Không có thông tin trường đã học của {expert_name}.")
        return []

class ActionAskExpertMajor(Action):
    def name(self) -> Text:
        return "action_ask_expert_major"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        educations = experts[0].get("educations", [])
        majors = set(entity_mapper.get_canonical_form(e.get("major", "")) for e in educations if e.get("major"))
        if majors:
            dispatcher.utter_message(f"{expert_name} từng học chuyên ngành: {', '.join(majors)}.")
        else:
            dispatcher.utter_message(f"Không có thông tin chuyên ngành của {expert_name}.")
        return []

class ActionAskExpertPreviousWorkplace(Action):
    def name(self) -> Text:
        return "action_ask_expert_previous_workplace"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        works = experts[0].get("workHistories", [])
        workplaces = set(entity_mapper.get_canonical_form(w.get("workplace", "")) for w in works if w.get("workplace"))
        if workplaces:
            dispatcher.utter_message(f"{expert_name} từng làm việc tại: {', '.join(workplaces)}.")
        else:
            dispatcher.utter_message(f"Không có thông tin nơi làm việc trước đây của {expert_name}.")
        return []

class ActionAskExpertPosition(Action):
    def name(self) -> Text:
        return "action_ask_expert_position"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response= "utter_ask_name")
            return []
        works = experts[0].get("workHistories", [])
        positions = set(entity_mapper.get_canonical_form(w.get("position", "")) for w in works if w.get("position"))
        if positions:
            dispatcher.utter_message(f"{expert_name} từng giữ vị trí: {', '.join(positions)}.")
        else:
            dispatcher.utter_message(f"Không có thông tin vị trí công tác của {expert_name}.")
        return []

class ActionExpertYesNoQuestion(Action):
    def name(self) -> Text:
        return "action_expert_yes_no_question"

    async def run(self, dispatcher, tracker, domain):
        expert_name = extract_context_entity(tracker, "expert_name")
        expert_name = entity_mapper.get_canonical_form(expert_name)
        # Lấy các entity khác và chuẩn hóa
        current_workplace = entity_mapper.get_canonical_form(extract_context_entity(tracker, "current_workplace"))
        degree = entity_mapper.get_canonical_form(extract_context_entity(tracker, "degree"))
        academic_title = entity_mapper.get_canonical_form(extract_context_entity(tracker, "academic_title"))
        graduated_school = entity_mapper.get_canonical_form(extract_context_entity(tracker, "graduated_school"))
        major = entity_mapper.get_canonical_form(extract_context_entity(tracker, "major"))
        previous_workplace = entity_mapper.get_canonical_form(extract_context_entity(tracker, "previous_workplace"))
        position = entity_mapper.get_canonical_form(extract_context_entity(tracker, "position"))
        email = extract_context_entity(tracker, "email")
        phone = extract_context_entity(tracker, "phone")

        experts, _ = search_experts(expert_name=expert_name)
        if not experts:
            dispatcher.utter_message(response="utter_ask_name")
            return []
        expert = experts[0]
        answer = "Không"

        # So khớp từng trường
        if current_workplace and entity_mapper.similarity_score(current_workplace, expert.get("organization", "")) >= 0.7:
            answer = "Đúng"
        elif degree and entity_mapper.similarity_score(degree, expert.get("degree", "")) >= 0.7:
            answer = "Đúng"
        elif academic_title and entity_mapper.similarity_score(academic_title, expert.get("academicTitle", "")) >= 0.7:
            answer = "Đúng"
        elif email and email in expert.get("email", ""):
            answer = "Đúng"
        elif phone and phone in expert.get("phone", ""):
            answer = "Đúng"
        elif graduated_school:
            schools = [entity_mapper.get_canonical_form(e.get("school", "")) for e in expert.get("educations", [])]
            if entity_mapper.find_best_match(graduated_school, schools):
                answer = "Đúng"
        elif major:
            majors = [entity_mapper.get_canonical_form(e.get("major", "")) for e in expert.get("educations", [])]
            if entity_mapper.find_best_match(major, majors):
                answer = "Đúng"
        elif previous_workplace:
            workplaces = [entity_mapper.get_canonical_form(w.get("workplace", "")) for w in expert.get("workHistories", [])]
            if entity_mapper.find_best_match(previous_workplace, workplaces):
                answer = "Đúng"
        elif position:
            positions = [entity_mapper.get_canonical_form(w.get("position", "")) for w in expert.get("workHistories", [])]
            if entity_mapper.find_best_match(position, positions):
                answer = "Đúng"

        dispatcher.utter_message(f"{answer}, {expert_name} {('có, chính xác' if answer=='Đúng' else 'không, không phải')} thỏa mãn điều kiện bạn hỏi.")
        return []