# Tạo file test đơn giản
# filepath: c:\Users\Admin\Downloads\Final-semina\expert-dashboard\rasa\test_import.py
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'actions'))

try:
    from actions.context.context_normalizer import normalizer
    print("✅ Import thành công!")
    print(f"Test normalize: {normalizer.normalize_expert_name('HCMUS')}")
except ImportError as e:
    print(f"❌ Lỗi import: {e}")