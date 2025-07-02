"""
Database-aligned normalization for institution names and entities
# Chức năng: Chuẩn hóa tên entities để match EXACT với database values
"""
from typing import Dict, List, Optional

class ContextNormalizer:
    """Database-aligned entity normalization"""
    
    # ✅ CORRECTED Institution mappings - MATCH EXACT DATABASE VALUES
    INSTITUTION_MAP = {
        # ĐHSPKT variations → Database: "Đại học Sư phạm kỹ thuật Thành phố Hồ Chí Minh"
        "ĐHSPKT": "Đại học Sư phạm kỹ thuật Thành phố Hồ Chí Minh",
        "ĐH SPKT TPHCM": "Đại học Sư phạm kỹ thuật Thành phố Hồ Chí Minh",
        "Đại học Sư phạm kỹ thuật TPHCM": "Đại học Sư phạm kỹ thuật Thành phố Hồ Chí Minh",
        "UTE": "Đại học Sư phạm kỹ thuật Thành phố Hồ Chí Minh",
        "HCMC University of Technology and Education": "Đại học Sư phạm kỹ thuật Thành phố Hồ Chí Minh",
        
        # ĐHBK variations → Database: "Đại học Bách khoa TPHCM" 
        "ĐHBK": "Đại học Bách khoa TPHCM",
        "ĐHBK TPHCM": "Đại học Bách khoa TPHCM",
        "Đại học Bách khoa - ĐHQG TPHCM": "Đại học Bách khoa TPHCM",
        "HCMUT": "Đại học Bách khoa TPHCM",
        "Bach Khoa University": "Đại học Bách khoa TPHCM",
        "HCMC University of Technology": "Đại học Bách khoa TPHCM",
        
        # UIT variations → Database: "Đại học Công nghệ thông tin"
        "UIT": "Đại học Công nghệ thông tin",
        "ĐH Công nghệ thông tin - ĐHQG TPHCM": "Đại học Công nghệ thông tin",
        "Đại học Công nghệ thông tin - ĐHQG TPHCM": "Đại học Công nghệ thông tin",
        "University of Information Technology": "Đại học Công nghệ thông tin",
    }
    
    # ✅ SIMPLIFIED Major mappings (performance optimized)
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
    
    # ✅ SIMPLIFIED Position mappings
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
    
    # ✅ SIMPLIFIED Degree mappings
    DEGREE_MAP = {
        "ThS": "Thạc sĩ",
        "Master": "Thạc sĩ",
        "MSc": "Thạc sĩ",
        "CN": "Cử nhân",
        "Bachelor": "Cử nhân",
        "BSc": "Cử nhân",
        "TS": "Tiến sĩ",
        "PhD": "Tiến sĩ",
        "Dr": "Tiến sĩ",
    }
    
    def normalize_current_workplace(self, name: str) -> str:
        """Normalize current workplace (Expert.organization) - EXACT database match"""
        if not name:
            return ""
        name_clean = name.strip()
        return self.INSTITUTION_MAP.get(name_clean, name_clean)
    
    def normalize_graduated_school(self, name: str) -> str:
        """Normalize graduated school (Education.school) - EXACT database match"""
        if not name:
            return ""
        name_clean = name.strip()
        return self.INSTITUTION_MAP.get(name_clean, name_clean)
    
    def normalize_previous_workplace(self, name: str) -> str:
        """Normalize previous workplace (WorkHistory.workplace)"""
        if not name:
            return ""
        name_clean = name.strip()
        # For companies/organizations, try institution mapping first
        return self.INSTITUTION_MAP.get(name_clean, name_clean)
    
    def normalize_major(self, major: str) -> str:
        """Normalize major names"""
        if not major:
            return ""
        major_clean = major.strip()
        return self.MAJOR_MAP.get(major_clean, major_clean)
    
    def normalize_position(self, position: str) -> str:
        """Normalize position names"""
        if not position:
            return ""
        position_clean = position.strip()
        return self.POSITION_MAP.get(position_clean, position_clean)
    
    def normalize_degree(self, degree: str) -> str:
        """Normalize degree names"""
        if not degree:
            return ""
        degree_clean = degree.strip()
        return self.DEGREE_MAP.get(degree_clean, degree_clean)
    
    def get_search_variations(self, name: str, context: str = None) -> List[str]:
        """Get simplified search variations (performance optimized)"""
        if not name:
            return []
            
        name_clean = name.strip()
        variations = [name_clean]
        
        # Add normalized version based on context
        if context in ["current_workplace", "graduated_school", "previous_workplace"]:
            normalized = self.INSTITUTION_MAP.get(name_clean, name_clean)
        elif context == "major":
            normalized = self.MAJOR_MAP.get(name_clean, name_clean)
        elif context == "position":
            normalized = self.POSITION_MAP.get(name_clean, name_clean)
        elif context == "degree":
            normalized = self.DEGREE_MAP.get(name_clean, name_clean)
        else:
            normalized = name_clean
        
        # Add normalized if different
        if normalized != name_clean:
            variations.append(normalized)
        
        # Add reverse mappings (limited for performance)
        if context in ["current_workplace", "graduated_school", "previous_workplace"]:
            for key, value in self.INSTITUTION_MAP.items():
                if value == normalized and key not in variations:
                    variations.append(key)
                    if len(variations) >= 4:  # Limit for performance
                        break
        
        # Remove duplicates while preserving order
        unique_variations = []
        for var in variations:
            if var and var not in unique_variations:
                unique_variations.append(var)
        
        return unique_variations[:4]  # Max 4 variations for performance

# Global instance
normalizer = ContextNormalizer()