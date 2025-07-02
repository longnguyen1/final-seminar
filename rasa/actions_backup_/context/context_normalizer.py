"""
Context-aware normalization for institution names and entities
"""
from typing import Dict, List, Optional

class ContextNormalizer:
    """Context-aware entity normalization"""
    
    # Institution name mappings
    INSTITUTION_MAP = {
        # HCMUT variations
        "ĐHBK": "HCMUT",
        "Đại học Bách khoa TPHCM": "HCMUT", 
        "Đại học Bách khoa TP.HCM": "HCMUT",
        "Bách khoa TPHCM": "HCMUT",
        "ĐHBK TPHCM": "HCMUT",
        "HCMUT": "HCMUT",
        
        # ĐHSPKT variations  
        "Đại học Sư phạm kỹ thuật TPHCM": "ĐHSPKT",
        "Đại học Sư phạm kỹ thuật TP.HCM": "ĐHSPKT",
        "HCMUTE": "ĐHSPKT", 
        "ĐHSPKT": "ĐHSPKT",
        
        # UIT variations
        "Đại học Công nghệ thông tin": "UIT",
        "Đại học Công nghệ thông tin ĐHQG TPHCM": "UIT",
        "University of Information Technology": "UIT",
        "UIT": "UIT",
        
        # HCMUS variations
        "Đại học Khoa học Tự nhiên": "HCMUS",
        "Đại học Khoa học Tự nhiên ĐHQG TPHCM": "HCMUS",
        "University of Science": "HCMUS",
        "HCMUS": "HCMUS",
    }
    
    # Major mappings
    MAJOR_MAP = {
        "CNTT": "Công nghệ thông tin",
        "IT": "Công nghệ thông tin", 
        "Information Technology": "Công nghệ thông tin",
        "Computer Science": "Khoa học máy tính",
        "CS": "Khoa học máy tính",
        "Software Engineering": "Kỹ thuật phần mềm",
        "SE": "Kỹ thuật phần mềm",
        "Mechanical Engineering": "Cơ khí",
        "ME": "Cơ khí",
    }
    
    # Position mappings  
    POSITION_MAP = {
        "GV": "Giảng viên",
        "Lecturer": "Giảng viên", 
        "Professor": "Giáo sư",
        "GS": "Giáo sư",
        "Associate Professor": "Phó Giáo sư",
        "PGS": "Phó Giáo sư",
        "TS": "Tiến sĩ",
        "PhD": "Tiến sĩ",
        "Dr": "Tiến sĩ",
    }
    
    def normalize_current_workplace(self, name: str) -> str:
        """Normalize current workplace (Expert.organization)"""
        if not name:
            return ""
        return self.INSTITUTION_MAP.get(name.strip(), name.strip())
    
    def normalize_graduated_school(self, name: str) -> str:
        """Normalize graduated school (Education.school)"""
        if not name:
            return ""
        return self.INSTITUTION_MAP.get(name.strip(), name.strip())
    
    def normalize_previous_workplace(self, name: str) -> str:
        """Normalize previous workplace (WorkHistory.workplace)"""
        if not name:
            return ""
        # For previous workplace, keep as-is for company names
        # Only normalize if it's a university
        return self.INSTITUTION_MAP.get(name.strip(), name.strip())
    
    def normalize_major(self, major: str) -> str:
        """Normalize major names"""
        if not major:
            return ""
        return self.MAJOR_MAP.get(major.strip(), major.strip())
    
    def normalize_position(self, position: str) -> str:
        """Normalize position names"""
        if not position:
            return ""
        return self.POSITION_MAP.get(position.strip(), position.strip())
    
    def get_search_variations(self, name: str, context: str) -> List[str]:
        """Get search variations for different contexts"""
        if not name:
            return []
            
        variations = [name.strip()]
        
        # Add normalized version
        if context == "current_workplace":
            normalized = self.normalize_current_workplace(name)
        elif context == "graduated_school":
            normalized = self.normalize_graduated_school(name)
        elif context == "previous_workplace":
            normalized = self.normalize_previous_workplace(name)
        elif context == "major":
            normalized = self.normalize_major(name)
        elif context == "position":
            normalized = self.normalize_position(name)
        else:
            normalized = name.strip()
        
        if normalized != name.strip():
            variations.append(normalized)
        
        # Add reverse mappings
        for key, value in self.INSTITUTION_MAP.items():
            if value == normalized and key not in variations:
                variations.append(key)
        
        return list(set(variations))

# Global instance
normalizer = ContextNormalizer()