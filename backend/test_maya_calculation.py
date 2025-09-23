#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
测试后端玛雅历法计算是否正确
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from services.maya_service import generate_maya_info, calculate_maya_date_info

def test_maya_calculation():
    """测试玛雅历法计算"""
    print("=== 后端玛雅历法计算测试 ===")
    
    # 测试关键日期
    test_dates = [
        '2025-09-21',
        '2025-09-22', 
        '2025-09-23',  # 应该是KIN 3 磁性的蓝夜
        '2025-09-24',
        '2025-09-25',
        '2025-09-26',
        '2025-09-27'
    ]
    
    print("\n=== 测试结果 ===")
    for date_str in test_dates:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            maya_info = calculate_maya_date_info(date_obj)
            
            is_target = date_str == '2025-09-23'
            marker = '🎯' if is_target else '  '
            status = '✅' if is_target and maya_info['full_name'] == '磁性的蓝夜' else ''
            
            print(f"{marker} {date_str}: {maya_info['full_name']} (KIN {maya_info['kin']}) {status}")
            
        except Exception as e:
            print(f"❌ {date_str}: 计算错误 - {e}")
    
    # 验证2025年9月23日
    print("\n=== 关键验证 ===")
    try:
        target_date = datetime.strptime('2025-09-23', "%Y-%m-%d")
        target_result = calculate_maya_date_info(target_date)
        
        print(f"2025年9月23日计算结果: {target_result['full_name']}")
        print(f"期望结果: 磁性的蓝夜")
        print(f"KIN: {target_result['kin']}")
        print(f"调性: {target_result['tone_name']} (索引: {target_result['tone_index']})")
        print(f"图腾: {target_result['seal_name']} (索引: {target_result['seal_index']})")
        print(f"验证状态: {'✅ 通过' if target_result['full_name'] == '磁性的蓝夜' else '❌ 失败'}")
        
        # 测试完整的maya_info生成
        print("\n=== 完整信息生成测试 ===")
        full_info = generate_maya_info(target_date)
        print(f"完整描述: {full_info['maya_seal_desc']}")
        print(f"调性: {full_info['maya_tone']}")
        print(f"图腾: {full_info['maya_seal']}")
        print(f"KIN: {full_info['maya_kin']}")
        
    except Exception as e:
        print(f"❌ 验证过程出错: {e}")

if __name__ == "__main__":
    test_maya_calculation()