"""
Optimized entity mapping for fast API performance
# Chức năng: Map variations của entities với performance optimization
"""
from typing import Dict, List, Optional, Set
import re

class EntityMapper:
    """Performance-optimized entity variation mapping"""
    
    # ✅ SIMPLIFIED Entity variations (performance focused - max 3 per entity)
    ENTITY_VARIATIONS = {
        # Institution variations (limited for performance)
        "đại học sư phạm kỹ thuật thành phố hồ chí minh": [
            "ĐHSPKT", "UTE", "ĐH SPKT TPHCM"
        ],
        
        "đại học bách khoa tphcm": [
            "ĐHBK", "HCMUT", "ĐHBK TPHCM"
        ],
        
        "đại học công nghệ thông tin": [
            "UIT", "ĐH Công nghệ thông tin - ĐHQG TPHCM"
        ],
        
        # Major variations (essential only)
        "công nghệ thông tin": [
            "CNTT", "IT", "Information Technology"
        ],
        
        "khoa học máy tính": [
            "Computer Science", "CS", "Tin học"
        ],
        
        "kỹ thuật phần mềm": [
            "Software Engineering", "SE"
        ],
        
        # Position variations (common only)
        "giảng viên": ["GV", "Lecturer"],
        "giáo sư": ["GS", "Professor"],
        "phó giáo sư": ["PGS", "Associate Professor"],
        
        # Degree variations (essential only)
        "tiến sĩ": ["TS", "PhD", "Dr"],
        "thạc sĩ": ["ThS", "Master"],
        "cử nhân": ["CN", "Bachelor"]
    }
    
    def __init__(self):
        self._create_reverse_mappings()
    
    def _create_reverse_mappings(self):
        """Create reverse mappings for efficient lookup"""
        self.reverse_mappings = {}
        
        for canonical, variations in self.ENTITY_VARIATIONS.items():
            self.reverse_mappings[canonical.lower()] = canonical
            for variation in variations:
                self.reverse_mappings[variation.lower()] = canonical
    
    def get_canonical_form(self, entity_value: str) -> str:
        """Get canonical form of entity value"""
        if not entity_value:
            return ""
        
        cleaned = entity_value.strip().lower()
        return self.reverse_mappings.get(cleaned, entity_value.strip())
    
    def get_search_variations(self, entity_value: str, max_variations: int = 3) -> List[str]:
        """Get OPTIMIZED search variations (max 3 for performance)"""
        if not entity_value:
            return []
        
        entity_clean = entity_value.strip()
        canonical = self.get_canonical_form(entity_clean)
        variations = {entity_clean}
        
        # Add canonical form if different
        if canonical != entity_clean:
            variations.add(canonical)
        
        # Add mapped variations (limited)
        if canonical.lower() in self.ENTITY_VARIATIONS:
            mapped = self.ENTITY_VARIATIONS[canonical.lower()]
            # Add only first variation for performance
            if mapped and len(variations) < max_variations:
                variations.add(mapped[0])
        
        return list(variations)[:max_variations]
    
    def similarity_score(self, value1: str, value2: str) -> float:
        """Simple similarity scoring (performance optimized)"""
        if not value1 or not value2:
            return 0.0
        
        v1 = value1.lower().strip()
        v2 = value2.lower().strip()
        
        # Exact match
        if v1 == v2:
            return 1.0
        
        # Canonical match
        canonical1 = self.get_canonical_form(value1)
        canonical2 = self.get_canonical_form(value2)
        
        if canonical1.lower() == canonical2.lower():
            return 0.9
        
        # Substring match
        if v1 in v2 or v2 in v1:
            return 0.7
        
        return 0.0
    
    def find_best_match(self, target: str, candidates: List[str], threshold: float = 0.7) -> Optional[str]:
        """Find best matching candidate (performance optimized)"""
        if not target or not candidates:
            return None
        
        best_match = None
        best_score = 0.0
        
        # Limit candidates for performance
        limited_candidates = candidates[:10]  # Max 10 candidates
        
        for candidate in limited_candidates:
            score = self.similarity_score(target, candidate)
            if score > best_score and score >= threshold:
                best_score = score
                best_match = candidate
        
        return best_match
    
    def map_legacy_entity(self, entity_name: str) -> str:
        """Map legacy entity names to new format"""
        legacy_mappings = {
            "organization": "current_workplace",
            "school": "graduated_school", 
            "workplace": "previous_workplace",
            "field": "major",
            "title": "position"
        }
        
        return legacy_mappings.get(entity_name, entity_name)

# Global instance
entity_mapper = EntityMapper()