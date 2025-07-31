import numpy as np
import pandas as pd
import datetime
import json
import os
from typing import List, Dict, Any
import sys

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.date_utils import parse_date, get_date_range

# 加载配置
config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'app_config.json')
with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

# 获取生物节律周期配置
CYCLES = config['biorhythm']['cycles']
MAX_HISTORY = config['biorhythm']['max_history']

# 存储用户历史查询的出生日期
history_dates = []

def calculate_rhythm_value(cycle: int, days_since_birth: int) -> int:
    """计算特定周期的节律值"""
    return int(100 * np.sin(2 * np.pi * days_since_birth / cycle))

def calculate_biorhythm(birth_date, target_date):
    """计算特定日期的生物节律值"""
    birth_date = parse_date(birth_date)
    target_date = parse_date(target_date)
    
    # 计算天数差
    days_since_birth = (target_date - birth_date).days

    physical_value = calculate_rhythm_value(CYCLES['physical'], days_since_birth)
    emotional_value = calculate_rhythm_value(CYCLES['emotional'], days_since_birth)
    intellectual_value = calculate_rhythm_value(CYCLES['intellectual'], days_since_birth)

    return physical_value, emotional_value, intellectual_value

def update_history(birth_date: str):
    """更新历史记录"""
    global history_dates
    
    # 如果日期已经在历史记录中，先移除它
    if birth_date in history_dates:
        history_dates.remove(birth_date)
    # 将新日期添加到列表开头
    history_dates.insert(0, birth_date)
    # 保持列表长度不超过MAX_HISTORY
    if len(history_dates) > MAX_HISTORY:
        history_dates = history_dates[:MAX_HISTORY]

def get_history():
    """获取历史记录"""
    return history_dates

def get_today_biorhythm(birth_date: str):
    """获取今天的生物节律"""
    # 更新历史记录
    update_history(birth_date)
    
    current_date = datetime.datetime.now().date()
    physical, emotional, intellectual = calculate_biorhythm(birth_date, current_date)
    
    return {
        "date": current_date.strftime("%Y-%m-%d"),
        "physical": physical,
        "emotional": emotional,
        "intellectual": intellectual
    }

def get_date_biorhythm(birth_date: str, date: str):
    """获取指定日期的生物节律"""
    # 更新历史记录
    update_history(birth_date)
    
    physical, emotional, intellectual = calculate_biorhythm(birth_date, date)
    
    return {
        "date": date,
        "physical": physical,
        "emotional": emotional,
        "intellectual": intellectual
    }

def get_biorhythm_range(birth_date: str, days_before: int, days_after: int):
    """获取一段时间内的生物节律"""
    # 更新历史记录
    update_history(birth_date)
    
    birth_date_obj = parse_date(birth_date)
    current_date = datetime.datetime.now().date()
    
    # 计算日期范围
    start_date, end_date = get_date_range(current_date, days_before, days_after)
    
    # 创建日期范围
    date_range = pd.date_range(start=start_date, end=end_date)
    
    # 初始化结果数组
    dates = []
    physical_values = []
    emotional_values = []
    intellectual_values = []
    
    # 计算每一天的节律值
    for date in date_range:
        date_obj = date.date()  # 转换为date对象，避免时区问题
        physical, emotional, intellectual = calculate_biorhythm(birth_date_obj, date_obj)
        
        dates.append(date_obj.strftime("%Y-%m-%d"))
        physical_values.append(physical)
        emotional_values.append(emotional)
        intellectual_values.append(intellectual)
    
    return {
        "dates": dates,
        "physical": physical_values,
        "emotional": emotional_values,
        "intellectual": intellectual_values
    }