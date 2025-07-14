# expert-dashboard/rasa/actions/components/entity_normalizer_component.py
from rasa.engine.recipes.default_recipe import DefaultV1Recipe
from rasa.engine.storage.resource import Resource
from rasa.engine.storage.storage import ModelStorage
from rasa.engine.graph import GraphComponent, ExecutionContext
from rasa.shared.nlu.training_data.message import Message
from typing import Any, Dict, List
from actions.context.context_normalizer import normalizer

@DefaultV1Recipe.register(
    DefaultV1Recipe.ComponentType.ENTITY_EXTRACTOR, is_trainable=False
)
class EntityNormalizerComponent(GraphComponent):
    @classmethod
    def required_components(cls) -> List[str]:
        return []

    def __init__(self, config: Dict[str, Any]) -> None:
        self.config = config

    def process(self, messages: List[Message]) -> List[Message]:
        for message in messages:
            entities = message.get("entities", [])
            for entity in entities:
                ent_type = entity.get("entity")
                value = entity.get("value")
                # Chuẩn hóa các entity chính
                if ent_type == "expert_name":
                    entity["value"] = normalizer.normalize_expert_name(value)
                elif ent_type == "major":
                    entity["value"] = normalizer.normalize_major(value)
                elif ent_type == "degree":
                    entity["value"] = normalizer.normalize_degree(value)
                elif ent_type == "graduated_school":
                    entity["value"] = normalizer.normalize_graduated_school(value)
                elif ent_type == "current_workplace":
                    entity["value"] = normalizer.normalize_current_workplace(value)
                elif ent_type == "previous_workplace":
                    entity["value"] = normalizer.normalize_previous_workplace(value)
                elif ent_type == "position":
                    entity["value"] = normalizer.normalize_position(value)
                elif ent_type == "academic_title":
                    entity["value"] = normalizer.normalize_academic_title(value)
            message.set("entities", entities)
        return messages