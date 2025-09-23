#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
测试KIN 183的计算逻辑
"""

from datetime import datetime

def calculate_maya_date_kin183(gregorian_date):
    """
    基于KIN 183的玛雅历法计算
    2025年9月23日 = KIN 183 磁性的蓝夜
    """
    # 13种调性（银河音调）
    TONES = [
        '磁性', '月亮', '电力', '自我存在', '超频', '韵律', '共振',
        '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
    ]
    
    # 20种图腾（太阳印记）
    SEALS = [
        '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', '黄星星',
        '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', '蓝鹰', '黄战士',
        '红地球', '白镜', '蓝风暴', '黄太阳'
    ]
    
    # 使用已知正确的参考点：2025年9月23日 = KIN 183 磁性的蓝夜
    REFERENCE_DATE = datetime(2025, 9, 23)
    REFERENCE_KIN = 183
    
    # 计算目标日期
    if isinstance(gregorian_date, str):
        target_date = datetime.strptime(gregorian_date, "%Y-%m-%d")
    else:
        target_date = gregorian_date
    
    # 计算从参考日期到目标日期的天数
    days_diff = (target_date - REFERENCE_DATE).days
    
    # 计算KIN数（1-260的循环）
    kin = REFERENCE_KIN + days_diff
    kin = ((kin - 1) % 260) + 1
    
    # 从KIN数计算调性和图腾
    tone_index = (kin - 1) % 13
    seal_index = (kin - 1) % 20
    
    tone = TONES[tone_index]
    seal = SEALS[seal_index]
    
    return {
        "kin": kin,
        "tone": tone,
        "seal": seal,
        "full_name": f"{tone}的{seal}",
        "days_diff": days_diff,
        "tone_index": tone_index,
        "seal_index": seal_index
    }

def test_kin183_calculation():
    """测试KIN 183的计算"""
    print("=== KIN 183 玛雅历法计算测试 ===")
    
    # 测试关键日期
    test_dates = [
        '2025-09-21',
        '2025-09-22', 
        '2025-09-23',  # 应该是KIN 183 磁性的蓝夜
        '2025-09-24',
        '2025-09-25',
        '2025-09-26',
        '2025-09-27'
    ]
    
    print("\n=== 测试结果 ===")
    for date_str in test_dates:
        result = calculate_maya_date_kin183(date_str)
        
        is_target = date_str == '2025-09-23'
        marker = '🎯' if is_target else '  '
        status = '✅' if is_target and result['kin'] == 183 and result['full_name'] == '磁性的蓝夜' else ''
        
        print(f"{marker} {date_str}: {result['full_name']} (KIN {result['kin']}) {status}")
    
    # 验证2025年9月23日
    print("\n=== 关键验证 ===")
    target_result = calculate_maya_date_kin183('2025-09-23')
    
    print(f"2025年9月23日计算结果: {target_result['full_name']}")
    print(f"期望结果: 磁性的蓝夜")
    print(f"KIN: {target_result['kin']} (期望: 183)")
    print(f"调性: {target_result['tone']} (索引: {target_result['tone_index']})")
    print(f"图腾: {target_result['seal']} (索引: {target_result['seal_index']})")
    
    # 验证KIN 183的调性和图腾是否正确
    kin183_tone_index = (183 - 1) % 13  # 应该是 182 % 13 = 0 (磁性)
    kin183_seal_index = (183 - 1) % 20  # 应该是 182 % 20 = 2 (蓝夜)
    
    print(f"\n=== KIN 183 验证 ===")
    print(f"KIN 183 调性索引: {kin183_tone_index} ({TONES[kin183_tone_index]})")
    print(f"KIN 183 图腾索引: {kin183_seal_index} ({SEALS[kin183_seal_index]})")
    
    is_correct = (target_result['kin'] == 183 and 
                  target_result['full_name'] == '磁性的蓝夜')
    
    print(f"验证状态: {'✅ 通过' if is_correct else '❌ 失败'}")

if __name__ == "__main__":
    test_kin183_calculation()