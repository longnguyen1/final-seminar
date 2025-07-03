# expert-dashboard/rasa/actions/context/context_normalizer.py
"""
Database-aligned normalization for institution names and entities
# Chức năng: Chuẩn hóa tên entities để match EXACT với database values
"""
import re
from typing import Dict, List, Optional

class ContextNormalizer:
    """
    Chuẩn hóa entity về đúng giá trị trong DB (không phân biệt hoa/thường, gom tất cả vào INSTITUTION_MAP)
    """

    INSTITUTION_MAP = {
        # ĐHSPKT
        "đhspkt": "Đại học Sư phạm kỹ thuật TPHCM",
        "đh spkt tphcm": "Đại học Sư phạm kỹ thuật TPHCM",
        "đại học sư phạm kỹ thuật tphcm": "Đại học Sư phạm kỹ thuật TPHCM",
        "ute": "Đại học Sư phạm kỹ thuật TPHCM",
        "hcmc university of technology and education": "Đại học Sư phạm kỹ thuật TPHCM",
        "đại học sư phạm kỹ thuật thành phố hồ chí minh": "Đại học Sư phạm kỹ thuật TPHCM",
        "university of technical education ho chi minh city": "Đại học Sư phạm kỹ thuật TPHCM",
        "dại học sư phạm kỹ thuật tphcm": "Đại học Sư phạm kỹ thuật TPHCM",

        # ĐHBK
        "đhbk": "Đại học Bách khoa - ĐHQG TPHCM",
        "đhbk tphcm": "Đại học Bách khoa - ĐHQG TPHCM",
        "đại học bách khoa - đhqg tphcm": "Đại học Bách khoa - ĐHQG TPHCM",
        "hcmut": "Đại học Bách khoa - ĐHQG TPHCM",
        "bach khoa university": "Đại học Bách khoa - ĐHQG TPHCM",
        "hcmc university of technology": "Đại học Bách khoa - ĐHQG TPHCM",
        "university of science and technology - vnuhcm": "Đại học Bách khoa - ĐHQG TPHCM",
        "đại học bách khoa tphcm": "Đại học Bách khoa - ĐHQG TPHCM",
        "đại học bách khoa tphcm": "Đại học Bách khoa - ĐHQG TPHCM",

        # HCMUS
        "hcmus": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "đh khoa học tự nhiên - đhqg tphcm": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "đại học khoa học tự nhiên - đhqg tphcm": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "university of science - vnuhcm": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "hcmc university of science": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "đại học khoa học tự nhiên tphcm": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "đại học khoa học tự nhiên": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "dại học khoa học tự nhiên": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "đại học khtn tphcm": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "đhkhtn tphcm": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        "đại học khoa học tự nhiên - đh quốc gia tphcm": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
        
        # HCMUT (Công nghệ)
        "hcmut cn" : "Đại học Công nghệ - ĐHQG TPHCM",
        "đh công nghệ - đhqg tphcm": "Đại học Công nghệ - ĐHQG TPHCM",
        "đại học công nghệ - đhqg tphcm": "Đại học Công nghệ - ĐHQG TPHCM",
        "university of technology - vnuhcm": "Đại học Công nghệ - ĐHQG TPHCM",
        "hcmc university of technology": "Đại học Công nghệ - ĐHQG TPHCM",
        "đhcn tphcm": "Đại học Công nghệ - ĐHQG TPHCM",
        "đại học công nghệ tphcm": "Đại học Công nghệ - ĐHQG TPHCM",

        # UIT
        "uit": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
        "đh công nghệ thông tin - đhqg tphcm": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
        "đại học công nghệ thông tin - đhqg tphcm": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
        "university of information technology": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
        "đhcntt tphcm": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
        "đại học công nghệ thông tin tphcm": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
    }

    # Các mapping khác giữ nguyên như cũ (major, position, degree...)
    MAJOR_MAP = {
        # IT & Computer Science
        "cntt": "Công nghệ thông tin",
        "it": "Công nghệ thông tin", 
        "khmt": "Khoa học Máy tính",
        "cs": "Khoa học Máy tính",
        "computer science": "Khoa học Máy tính",
         "máy tính": "Khoa học Máy tính",
            
        # Electronics & Telecommunications  
        "điện tử": "Điện tử",
        "đt": "Điện tử",
        "viễn thông": "Viễn thông",
        "vt": "Viễn thông",
        "điện tử viễn thông": "Điện tử - Viễn thông",
        "đt-vt": "Điện tử - Viễn thông",
            
        # Mechanical Engineering
        "cơ khí": "Kỹ thuật Cơ khí",
        "ck": "Kỹ thuật Cơ khí",
        "mechanical": "Kỹ thuật Cơ khí",
        "ô tô": "Cơ khí ô tô",
        "automotive": "Cơ khí ô tô",
            
        # Chemistry
        "hóa học": "Hóa học",
        "hh": "Hóa học",
        "chemistry": "Hóa học",
        "hóa phân tích": "Hóa phân tích",
        "hóa hữu cơ": "Hóa Hữu cơ",
        "hóa vô cơ": "Hóa vô cơ",
            
        # Engineering fields
        "kỹ thuật điện": "Kỹ thuật điện",
        "electrical": "Kỹ thuật điện",
        "kỹ thuật môi trường": "Kỹ thuật môi trường",
        "environmental": "Kỹ thuật môi trường",
        "xây dựng": "Kỹ thuật xây dựng",
        "civil": "Kỹ thuật xây dựng",
            
        # Food Technology
        "công nghệ thực phẩm": "Công nghệ thực phẩm",
        "food tech": "Công nghệ thực phẩm",
        "thực phẩm": "Công nghệ thực phẩm",
        
        # Materials Science  
        "vật liệu": "Khoa học vật liệu",
        "materials": "Khoa học vật liệu",
        "polymer": "Vật liệu polymer",
        "nano": "Nano composites",
        
        # Others
        "tự động hóa": "Tự động hóa",
        "automation": "Tự động hóa",
        "ai": "Trí tuệ nhân tạo",
        "artificial intelligence": "Trí tuệ nhân tạo",
    }

    POSITION_MAP = {
        "trợ giảng": "Trợ giảng",
        "tg": "Trợ giảng",
        "giảng viên": "Giảng viên",
        "gv": "Giảng viên",
        "lecturer": "Giảng viên",
        "researcher": "Nghiên cứu viên",
        "nghiên cứu viên": "Nghiên cứu viên",
        "kỹ sư": "Kỹ sư",
        "engineer": "Kỹ sư",
        "phó trưởng khoa": "Phó Trưởng khoa",
        "ptk": "Phó Trưởng khoa",
        "trưởng khoa": "Trưởng khoa",
        "tk": "Trưởng khoa",
    }

    DEGREE_MAP = {
        "ths": "Thạc sĩ",
        "master": "Thạc sĩ",
        "msc": "Thạc sĩ",
        "cn": "Cử nhân",
        "bachelor": "Cử nhân",
        "bsc": "Cử nhân",
        "ts": "Tiến sĩ",
        "phd": "Tiến sĩ",
        "dr": "Tiến sĩ",
        "kĩ sư": "Kỹ sư",
        "engineer": "Kỹ sư",
    }

    ACADEMICTITLE_MAP = {
        "professor": "Giáo sư",
        "gs": "Giáo sư",
        "associate professor": "Phó Giáo sư",
        "pgs": "Phó Giáo sư",
    }

    LANGUAGE_MAPPING = {
        "tiếng anh": "Tiếng Anh",
        "english": "Tiếng Anh",
        "tiếng pháp": "Tiếng Pháp",
        "french": "Tiếng Pháp",
        "tiếng đức": "Tiếng Đức",
        "german": "Tiếng Đức",
        "tiếng nhật": "Tiếng Nhật",
        "japanese": "Tiếng Nhật",
        "tiếng hàn": "Tiếng Hàn",
        "korean": "Tiếng Hàn",
        "tiếng trung": "Tiếng Trung",
        "chinese": "Tiếng Trung",
        "tiếng nga": "Tiếng Nga",
        "russian": "Tiếng Nga",
        "tiếng ý": "Tiếng Ý",
        "italian": "Tiếng Ý",
        "tiếng tây ban nha": "Tiếng Tây Ban Nha",
        "spanish": "Tiếng Tây Ban Nha",
    }

    def normalize_institution(self, value: str) -> str:
        """Chuẩn hóa tên tổ chức/trường học/nơi làm việc (case-insensitive, dùng INSTITUTION_MAP)"""
        if not value:
            return ""
        value_clean = value.strip().lower()
        return self.INSTITUTION_MAP.get(value_clean, value.strip())

    # 6 hàm wrapper cho rõ nghĩa, dùng chung normalize_institution
    def normalize_graduated_school(self, value: str) -> str:
        return self.normalize_institution(value)

    def normalize_current_workplace(self, value: str) -> str:
        result = self.normalize_institution(value)
        print(f"[DEBUG] normalize_current_workplace: input='{value}' -> '{result}'")
        return result

    def normalize_previous_workplace(self, value: str) -> str:
        return self.normalize_institution(value)

    # Các hàm chuẩn hóa khác giữ nguyên
    def normalize_expert_name(self, name: str) -> str:
        if not name:
            return ""
        name = re.sub(r'\s+', ' ', name.strip())
        return " ".join(word.capitalize() for word in name.split())

    def normalize_major(self, major: str) -> str:
        if not major:
            return ""
        major_clean = major.strip().lower()
        return self.MAJOR_MAP.get(major_clean, major.strip())

    def normalize_position(self, position: str) -> str:
        if not position:
            return ""
        position_clean = position.strip().lower()
        return self.POSITION_MAP.get(position_clean, position.strip())

    def normalize_degree(self, degree: str) -> str:
        if not degree:
            return ""
        degree_clean = degree.strip().lower()
        return self.DEGREE_MAP.get(degree_clean, degree.strip())

    def normalize_academic_title(self, title: str) -> str:
        if not title:
            return ""
        title_clean = title.strip().lower()
        return self.POSITION_MAP.get(title_clean, title.strip())
    
    def normalize_language(self, language: str) -> str:
        """Chuẩn hóa tên ngoại ngữ"""
        if not language:
            return language
        language_clean = language.strip().lower()
        return self.LANGUAGE_MAPPING.get(language_clean, language.strip)

    def get_search_variations(self, value: str, context: str = None) -> List[str]:
        """Sinh các biến thể tìm kiếm (case-insensitive, ưu tiên mapping)"""
        if not value:
            return []
        value_clean = value.strip()
        value_lower = value_clean.lower()
        variations = [value_clean]

        # Thêm dạng chuẩn hóa nếu khác
        if context in [
            "current_workplace", "graduated_school", "previous_workplace",
            "organization", "school", "workplace"
        ]:
            normalized = self.normalize_institution(value_clean)
            if normalized != value_clean:
                variations.append(normalized)
            # Thêm các key mapping trùng value chuẩn hóa
            for key, val in self.INSTITUTION_MAP.items():
                if val == normalized and key != value_lower:
                    variations.append(key)
                    if len(variations) >= 4:
                        break
        elif context == "major":
            normalized = self.normalize_major(value_clean)
            if normalized != value_clean:
                variations.append(normalized)
            for key, val in self.MAJOR_MAP.items():
                if val == normalized and key != value_lower:
                    variations.append(key)
                    if len(variations) >= 4:
                        break
        elif context == "position":
            normalized = self.normalize_position(value_clean)
            if normalized != value_clean:
                variations.append(normalized)
            for key, val in self.POSITION_MAP.items():
                if val == normalized and key != value_lower:
                    variations.append(key)
                    if len(variations) >= 4:
                        break
        elif context == "degree":
            normalized = self.normalize_degree(value_clean)
            if normalized != value_clean:
                variations.append(normalized)
            for key, val in self.DEGREE_MAP.items():
                if val == normalized and key != value_lower:
                    variations.append(key)
                    if len(variations) >= 4:
                        break

        # Loại bỏ trùng lặp, giữ thứ tự
        unique_variations = []
        for v in variations:
            if v and v not in unique_variations:
                unique_variations.append(v)
        return unique_variations[:4]

# Global instance
normalizer = ContextNormalizer()