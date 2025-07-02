# Tạo file test đơn giản
# filepath: c:\Users\Admin\Downloads\Final-semina\expert-dashboard\rasa\test_import.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'actions'))

try:
    from actions.data_normalizer import normalizer
    print("✅ Import thành công!")
    print(f"Test normalize: {normalizer.normalize_name('nguyễn văn an')}")
except ImportError as e:
    print(f"❌ Lỗi import: {e}")