import re
from typing import List

class DataNormalizer:
    def __init__(self):
        # UPDATED: ORGANIZATION_MAPPING với dữ liệu thực từ database
        self.ORGANIZATION_MAPPING = {
            # Existing mappings
            "đại học bách khoa": "Đại học Bách khoa - ĐHQG TPHCM",
            "bách khoa": "Đại học Bách khoa - ĐHQG TPHCM", 
            "hcmut": "Đại học Bách khoa - ĐHQG TPHCM",
            
            # NEW: Thêm mappings từ database thực
            "đại học sư phạm kỹ thuật tphcm": "Đại học Sư phạm kỹ thuật TPHCM",
            "đh spkt tphcm": "Đại học Sư phạm kỹ thuật TPHCM",
            "spkt": "Đại học Sư phạm kỹ thuật TPHCM",
            "hcmute": "Đại học Sư phạm kỹ thuật TPHCM",
            
            "đại học khoa học tự nhiên tphcm": "Đại học Khoa học Tự nhiên - ĐH Quốc gia TPHCM",
            "đh khoa học tự nhiên": "Đại học Khoa học Tự nhiên - ĐH Quốc gia TPHCM",
            "hcmus": "Đại học Khoa học Tự nhiên - ĐH Quốc gia TPHCM",
            
            "đại học công nghệ thông tin tphcm": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
            "đh cntt": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
            "uit": "Đại học Công nghệ thông tin - ĐHQG TPHCM",
            
            "đại học công nghiệp tphcm": "Đại học Công nghiệp TPHCM",
            "đh công nghiệp": "Đại học Công nghiệp TPHCM",
            "iuh": "Đại học Công nghiệp TPHCM",
            
            "đại học giao thông vận tải tphcm": "Đại học Giao thông vận tải TPHCM",
            "đh gtvt": "Đại học Giao thông vận tải TPHCM",
            "uth": "Đại học Giao thông vận tải TPHCM",
            
            "đại học nông lâm tphcm": "Đại học Nông lâm TPHCM",
            "nông lâm": "Đại học Nông lâm TPHCM",
            "hcmuaf": "Đại học Nông lâm TPHCM",
            
            "đại học tôn đức thắng": "Đại học Tôn Đức Thắng",
            "tdtu": "Đại học Tôn Đức Thắng",
            "tdt": "Đại học Tôn Đức Thắng",
            
            "đại học sư phạm tphcm": "Đại học Sư phạm TPHCM",
            "hcmup": "Đại học Sư phạm TPHCM",
            
            "viện công nghệ nano": "Viện Công nghệ Nano (INT) - ĐHQG TPHCM",
            "int": "Viện Công nghệ Nano (INT) - ĐHQG TPHCM",
            
            "viện dầu khí việt nam": "Viện Dầu khí Việt Nam (Trung tâm nghiên cứu phát triển chế biến dầu khí)",
            "vpi": "Viện Dầu khí Việt Nam (Trung tâm nghiên cứu phát triển chế biến dầu khí)",
            
            "viện khoa học vật liệu ứng dụng": "Viện Khoa học Vật liệu ứng dụng",
            "viện nhiệt đới môi trường": "Viện Nhiệt đới Môi trường",
            
            "phân viện cơ điện nông nghiệp": "Phân Viện Cơ điện Nông nghiệp & Công nghệ Sau Thu hoạch",
        }
        
        # Mapping học vị
        self.DEGREE_MAPPING = {
            "tiến sĩ": "Tiến sĩ",
            "ts": "Tiến sĩ",
            "tiến sỹ": "Tiến sĩ",
            "thạc sĩ": "Thạc sĩ", 
            "ths": "Thạc sĩ",
            "thạc sỹ": "Thạc sĩ",
            "kĩ sư": "Kĩ sư",
            "kỹ sư": "Kĩ sư",
            "ks": "Kĩ sư",
            "cử nhân": "Cử nhân",
            "cn": "Cử nhân"
        }
        
        # Mapping học hàm
        self.ACADEMIC_TITLE_MAPPING = {
            "giáo sư": "Giáo sư",
            "gs": "Giáo sư", 
            "phó giáo sư": "Phó giáo sư",
            "pgs": "Phó giáo sư",
        }
        
        # Mapping trường học (cho education)
        self.SCHOOL_MAPPING = {
            # Việt Nam - từ education table
            "đại học khoa học tự nhiên": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
            "đh khxh&nv": "ĐH KHXH&NV - ĐHQG TPHCM",
            "đh cntt": "ĐH Công nghệ thông tin - ĐHQG TPHCM",
            "đh spkt": "ĐH SPKT TPHCM", 
            "bách khoa tphcm": "ĐH Bách khoa TPHCM",
            "bách khoa hà nội": "Đại học Bách khoa Hà Nội",
            "giao thông vận tải": "Đại học Giao thông vận tải TPHCM",
            "kinh tế tphcm": "Đại học Kinh tế TPHCM",
            "nông lâm": "Đại học Nông lâm TPHCM",
            "tôn đức thắng": "Đại học Tôn Đức Thắng",
            "hàng hải": "Đại học Hàng hải Việt Nam",
            
            # Quốc tế - từ education table
            "kyungpook": "Đại học quốc gia Kyungpook, Hàn quốc",
            "ulsan": "University of Ulsan, Korea, South",
            "sungkyunkwan": "Sungkyunkwan University, South Korea", 
            "centrale lyon": "Ecole Centrale de Lyon, France",
            "inpg": "Institut National Polytechnique (INP) de Grenoble, France",
            "liège": "Đại học Liège, Belgium",
            "ait": "Học viện Công nghệ Châu Á (AIT), Thailand",
            "nanyang": "Nanyang Technological University, Singapore",
            "sydney": "Đại học Tổng hợp Sydney (University of Sydney), TP . Sydney, New South Wales, Australia",
            
            # Viết tắt phổ biến
            "hcmut": "ĐH Bách khoa TPHCM",
            "hcmus": "Đại học Khoa học Tự nhiên - ĐHQG TPHCM",
            "hcmute": "ĐH SPKT TPHCM",
            "uit": "ĐH Công nghệ thông tin - ĐHQG TPHCM",
            "uth": "Đại học Giao thông vận tải TPHCM",
            "hust": "Đại học Bách khoa Hà Nội",
        }
        
        # Mapping nơi làm việc (workplace)
        self.WORKPLACE_MAPPING = {
            # Từ database thực - Expert.organization
            "đại học bách khoa": "Đại học Bách khoa - ĐHQG TPHCM",
            "spkt": "Đại học Sư phạm kỹ thuật TPHCM",
            "hcmute": "Đại học Sư phạm kỹ thuật TPHCM",
            "khtn": "Đại học Khoa học Tự nhiên - ĐH Quốc gia TPHCM",
            "hcmus": "Đại học Khoa học Tự nhiên - ĐH Quốc gia TPHCM",
            "cntt": "Đại học Công nghệ thông tin – ĐHQG TPHCM",
            "uit": "Đại học Công nghệ thông tin – ĐHQG TPHCM",
            "công nghiệp": "Đại học Công nghiệp TPHCM",
            "iuh": "Đại học Công nghiệp TPHCM",
            "gtvt": "Đại học Giao thông vận tải TPHCM",
            "uth": "Đại học Giao thông vận tải TPHCM",
            "nông lâm": "Đại học Nông lâm TPHCM",
            "hcmuaf": "Đại học Nông lâm TPHCM",
            "tôn đức thắng": "Đại học Tôn Đức Thắng",
            "tdtu": "Đại học Tôn Đức Thắng",
            
            # Viện nghiên cứu
            "int": "Viện Công nghệ Nano (INT) - ĐHQG TPHCM",
            "nano": "Viện Công nghệ Nano (INT) - ĐHQG TPHCM",
            "vpi": "Viện Dầu khí Việt Nam (Trung tâm nghiên cứu phát triển chế biến dầu khí)",
            "dầu khí": "Viện Dầu khí Việt Nam (Trung tâm nghiên cứu phát triển chế biến dầu khí)",
            
            # Companies từ database (nếu có WorkHistory data)
            "microsoft": "Microsoft",
            "google": "Google", 
            "fpt": "FPT Software",
            "viettel": "Viettel",
            "samsung": "Samsung",
            "ibm": "IBM",
        }
        
        # Mapping vị trí công việc
        self.POSITION_MAPPING = {
            "giảng viên": "Giảng viên",
            "gv": "Giảng viên",
            "phó hiệu trưởng": "Phó Hiệu trưởng",
            "hiệu trưởng": "Hiệu trưởng",
            "trưởng khoa": "Trưởng khoa",
            "phó trưởng khoa": "Phó trưởng khoa",
            "nghiên cứu viên": "Nghiên cứu viên",
            "ncv": "Nghiên cứu viên",
        }
        
        # Mapping trạng thái dự án
        self.PROJECT_STATUS_MAPPING = {
            "nghiệm thu": "Nghiệm thu",
            "đã nghiệm thu": "Nghiệm thu",
            "đang thực hiện": "Đang thực hiện",
            "đang tiến hành": "Đang thực hiện",
            "đang làm": "Đang thực hiện",
            "hoàn thành": "Hoàn thành",
            "đã hoàn thành": "Hoàn thành",
            "xong": "Hoàn thành",
            "tạm dừng": "Tạm dừng",
            "dừng": "Tạm dừng",
            "hủy bỏ": "Hủy bỏ",
            "hủy": "Hủy bỏ",
            "chưa bắt đầu": "Chưa bắt đầu",
            "sắp bắt đầu": "Chưa bắt đầu",
        }
        
        # Mapping vai trò trong dự án
        self.PROJECT_ROLE_MAPPING = {
            "chủ nhiệm": "Chủ nhiệm",
            "chu nhiem": "Chủ nhiệm",
            "leader": "Chủ nhiệm",
            "trưởng nhóm": "Chủ nhiệm",
            "thành viên": "Thành viên",
            "thanh vien": "Thành viên",
            "member": "Thành viên",
            "cộng tác viên": "Cộng tác viên",
            "cong tac vien": "Cộng tác viên",
            "collaborator": "Cộng tác viên",
            "tư vấn": "Tư vấn",
            "tu van": "Tư vấn",
            "advisor": "Tư vấn",
            "nghiên cứu viên": "Nghiên cứu viên",
            "researcher": "Nghiên cứu viên",
        }

        # Mapping ngoại ngữ
        self.LANGUAGE_MAPPING = {
            "tiếng anh": "Tiếng Anh",
            "english": "Tiếng Anh",
            "anh": "Tiếng Anh",
            "tiếng pháp": "Tiếng Pháp",
            "french": "Tiếng Pháp",
            "pháp": "Tiếng Pháp",
            "tiếng đức": "Tiếng Đức",
            "german": "Tiếng Đức",
            "đức": "Tiếng Đức",
            "tiếng nhật": "Tiếng Nhật",
            "japanese": "Tiếng Nhật",
            "nhật": "Tiếng Nhật",
            "tiếng trung": "Tiếng Trung",
            "chinese": "Tiếng Trung",
            "trung": "Tiếng Trung",
            "tiếng hàn": "Tiếng Hàn",
            "korean": "Tiếng Hàn",
            "hàn": "Tiếng Hàn",
            "tiếng nga": "Tiếng Nga",
            "russian": "Tiếng Nga",
            "nga": "Tiếng Nga",
        }
        
        # Mapping trình độ ngoại ngữ
        self.LANGUAGE_LEVEL_MAPPING = {
            "tốt": "Tốt",
            ""
            "sơ cấp": "Sơ cấp",
            "so cap": "Sơ cấp",
            "basic": "Sơ cấp",
            "beginner": "Sơ cấp",
            "trung cấp": "Trung cấp",
            "trung cap": "Trung cấp",
            "intermediate": "Trung cấp",
            "cao cấp": "Cao cấp",
            "cao cap": "Cao cấp",
            "advanced": "Cao cấp",
            "thành thạo": "Thành thạo",
            "thanh thao": "Thành thạo",
            "fluent": "Thành thạo",
            "bản ngữ": "Bản ngữ",
            "ban ngu": "Bản ngữ",
            "native": "Bản ngữ",
            "a1": "A1",
            "a2": "A2",
            "b1": "B1",
            "b2": "B2",
            "c1": "C1",
            "c2": "C2",
        }

        # NEW: MAJOR_MAPPING từ education.major field
        self.MAJOR_MAPPING = {
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
        
    def normalize_name(self, name: str) -> str:
        """Chuẩn hóa tên người"""
        if not name:
            return name
        name = re.sub(r'\s+', ' ', name.strip())
        return " ".join(word.capitalize() for word in name.split())

    def normalize_organization(self, org: str) -> str:
        """Chuẩn hóa tên tổ chức"""
        if not org:
            return org
        org_lower = org.lower().strip()
        return self.ORGANIZATION_MAPPING.get(org_lower, org)

    def normalize_degree(self, degree: str) -> str:
        """Chuẩn hóa học vị"""
        if not degree:
            return degree
        degree_lower = degree.lower().strip()
        return self.DEGREE_MAPPING.get(degree_lower, degree)

    def normalize_academic_title(self, title: str) -> str:
        """Chuẩn hóa học hàm"""
        if not title:
            return title
        title_lower = title.lower().strip()
        return self.ACADEMIC_TITLE_MAPPING.get(title_lower, title)
    
    def normalize_school(self, school: str) -> str:
        """Chuẩn hóa tên trường học"""
        if not school:
            return school
        school_lower = school.lower().strip()
        return self.SCHOOL_MAPPING.get(school_lower, school)

    def normalize_workplace(self, workplace: str) -> str:
        """Chuẩn hóa nơi làm việc"""
        if not workplace:
            return workplace
        workplace_lower = workplace.lower().strip()
        return self.WORKPLACE_MAPPING.get(workplace_lower, workplace)
    
    def normalize_position(self, position: str) -> str:
        """Chuẩn hóa vị trí công việc"""
        if not position:
            return position
        position_lower = position.lower().strip()
        return self.POSITION_MAPPING.get(position_lower, position)

    def normalize_project_status(self, status: str) -> str:
        """Chuẩn hóa trạng thái dự án"""
        if not status:
            return status
        status_lower = status.lower().strip()
        return self.PROJECT_STATUS_MAPPING.get(status_lower, status)
    
    def normalize_project_role(self, role: str) -> str:
        """Chuẩn hóa vai trò trong dự án"""
        if not role:
            return role
        role_lower = role.lower().strip()
        return self.PROJECT_ROLE_MAPPING.get(role_lower, role)

    def normalize_language(self, language: str) -> str:
        """Chuẩn hóa tên ngoại ngữ"""
        if not language:
            return language
        language_lower = language.lower().strip()
        return self.LANGUAGE_MAPPING.get(language_lower, language)
    
    def normalize_language_level(self, level: str) -> str:
        """Chuẩn hóa trình độ ngoại ngữ"""
        if not level:
            return level
        level_lower = level.lower().strip()
        return self.LANGUAGE_LEVEL_MAPPING.get(level_lower, level)

    # NEW: Context-specific normalization methods
    def normalize_current_workplace(self, workplace: str) -> str:
        """Chuẩn hóa current workplace (Expert.organization)"""
        if not workplace:
            return workplace
        workplace_lower = workplace.lower().strip()
        return self.ORGANIZATION_MAPPING.get(workplace_lower, workplace)

    def normalize_graduated_school(self, school: str) -> str:
        """Chuẩn hóa graduated school (Education.school)"""
        if not school:
            return school
        school_lower = school.lower().strip()
        return self.SCHOOL_MAPPING.get(school_lower, school)

    def normalize_previous_workplace(self, workplace: str) -> str:
        """Chuẩn hóa previous workplace (WorkHistory.workplace)"""
        if not workplace:
            return workplace
        workplace_lower = workplace.lower().strip()
        return self.WORKPLACE_MAPPING.get(workplace_lower, workplace)

    def normalize_major(self, major: str) -> str:
        """Chuẩn hóa chuyên ngành (Education.major)"""
        if not major:
            return major
        major_lower = major.lower().strip()
        return self.MAJOR_MAPPING.get(major_lower, major)

    def get_search_variations(self, text: str, entity_type: str) -> List[str]:
        """Lấy các biến thể để search"""
        if not text:
            return []
            
        variations = [text, text.lower(), text.upper(), text.title()]
        
        # UPDATED: Context-specific mappings
        if entity_type == "current_workplace":
            text_lower = text.lower()
            for key, value in self.ORGANIZATION_MAPPING.items():
                if key in text_lower or text_lower in key:
                    variations.extend([key, value])
                
        elif entity_type == "graduated_school":
            text_lower = text.lower()
            for key, value in self.SCHOOL_MAPPING.items():
                if key in text_lower or text_lower in key:
                    variations.extend([key, value])
                
        elif entity_type == "previous_workplace":
            text_lower = text.lower()
            for key, value in self.WORKPLACE_MAPPING.items():
                if key in text_lower or text_lower in key:
                    variations.extend([key, value])
                
        elif entity_type == "major":
            text_lower = text.lower()
            for key, value in self.MAJOR_MAPPING.items():
                if key in text_lower or text_lower in key:
                    variations.extend([key, value])
    
        # ... existing mappings for other types
    
        return list(set([v for v in variations if v and v.strip()]))

# Global instance
normalizer = DataNormalizer()