"""
Context detection and entity extraction utilities
# Chức năng: Phát hiện context từ user message và extract entities
"""
from typing import Dict, List, Optional, Any
from rasa_sdk import Tracker

# Context detection keywords
CONTEXT_KEYWORDS = {
    "current_workplace": [
        "hiện tại", "đang làm", "hiện đang", "làm việc tại", 
        "currently", "working at", "employed at", "đang công tác"
    ],
    "graduated_school": [
        "tốt nghiệp", "học", "cựu sinh viên", "alumni", "ra trường",
        "graduated", "studied", "education", "degree from", "học tại"
    ],
    "previous_workplace": [
        "đã làm", "từng làm", "trước đây", "cựu nhân viên", "ex-",
        "former", "previously", "used to work", "worked at", "đã từng"
    ]
}

def extract_context_entity(tracker: Tracker, primary_entity: str, fallback_entity: str = None) -> Optional[str]:
    """Extract entity with context priority - COMPATIBLE với actions"""
    entities = tracker.latest_message.get('entities', [])
    
    # Priority 1: Primary context-specific entity
    for entity in entities:
        if entity.get('entity') == primary_entity:
            value = entity.get('value')
            if value and value.strip():  # ✅ Ensure non-empty
                return value.strip()
    
    # Priority 2: Fallback to legacy entity
    if fallback_entity:
        for entity in entities:
            if entity.get('entity') == fallback_entity:
                value = entity.get('value')
                if value and value.strip():
                    return value.strip()
    
    return None

def detect_query_context(user_message: str) -> str:
    """Detect intended context from user message"""
    if not user_message:
        return "current_workplace"
        
    message_lower = user_message.lower()
    
    # Check for explicit context keywords
    for context, keywords in CONTEXT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in message_lower:
                return context
    
    # Default context based on common patterns
    if any(word in message_lower for word in ["tốt nghiệp", "học", "cựu sinh viên", "alumni"]):
        return "graduated_school"
    elif any(word in message_lower for word in ["đã làm", "từng làm", "cựu nhân viên", "former"]):
        return "previous_workplace"
    else:
        return "current_workplace"  # Default assumption

def extract_multiple_entities(tracker: Tracker, entity_name: str) -> List[str]:
    """Extract multiple entities of the same type"""
    entities = tracker.latest_message.get('entities', [])
    values = []
    
    for entity in entities:
        if entity.get('entity') == entity_name:
            value = entity.get('value')
            if value and value.strip() and value.strip() not in values:
                values.append(value.strip())
    
    return values

def get_entity_confidence(tracker: Tracker, entity_name: str) -> float:
    """Get confidence score for entity extraction"""
    entities = tracker.latest_message.get('entities', [])
    
    for entity in entities:
        if entity.get('entity') == entity_name:
            return entity.get('confidence', 0.0)
    
    return 0.0

def disambiguate_context(entities: List[Dict], user_message: str) -> Dict:
    """Disambiguate context when multiple entities detected"""
    detected_context = detect_query_context(user_message)
    
    # Find matching entity for detected context
    for entity in entities:
        entity_type = entity.get('entity', '')
        if detected_context in entity_type:
            return {
                'entity': entity,
                'context': detected_context,
                'confidence': entity.get('confidence', 0.8)
            }
    
    # Fallback to first entity with default context
    if entities:
        return {
            'entity': entities[0],
            'context': 'current_workplace',
            'confidence': 0.6
        }
    
    return {}