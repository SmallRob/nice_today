import datetime
import json
import os
import pandas as pd
import random
import sys
from typing import Dict, Any, List

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.date_utils import parse_date, get_date_range

# 加载配置
config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'app_config.json')
with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

# 获取配置
FIVE_ELEMENTS = config['five_elements']
COLOR_SYSTEMS = config['color_systems']
DAILY_FOOD = config['daily_food']
WEEKDAY_ELEMENTS = config['weekday_elements']
STAR_COLORS = config['star_colors']
WEEKDAY_NAMES = config['weekday_names']

def get_daily_five_element(date=None):
    """根据日期计算当日五行属性"""
    date = parse_date(date)
    
    # 使用日期的多个因素来确定五行属性，使每天都有所不同
    # 1. 使用星期几作为基础
    weekday = date.weekday()
    base_element = WEEKDAY_ELEMENTS[weekday]
    
    # 2. 使用日期的日、月、年的组合来调整
    day = date.day
    month = date.month
    year = date.year
    
    # 使用日期的各个部分计算一个哈希值，用于确定五行
    date_hash = (day * 100 + month * 10 + year % 10) % 5
    
    # 五行列表
    elements = list(FIVE_ELEMENTS.keys())  # ['金', '木', '水', '火', '土']
    
    # 根据日期哈希值调整基础五行
    # 如果哈希值为0，保持原有五行
    # 否则，根据哈希值选择不同的五行
    if date_hash != 0:
        # 确保选择的五行与基础五行不同
        available_elements = [e for e in elements if e != base_element]
        # 使用哈希值选择一个五行
        selected_index = (date_hash - 1) % len(available_elements)
        return available_elements[selected_index]
    
    return base_element

def get_daily_star_influence(date=None):
    """计算当日星宿运行对穿衣颜色的影响"""
    date = parse_date(date)
    
    # 使用日期的多个因素来确定星宿影响
    day_of_year = date.timetuple().tm_yday  # 一年中的第几天
    day = date.day
    month = date.month
    
    # 使用日期的不同组合来计算星宿索引
    # 这样可以确保不同日期有不同的星宿影响
    star_index = (day_of_year + day * month) % len(STAR_COLORS)
    
    return STAR_COLORS[star_index]

def get_recommended_colors(date=None):
    """获取当日推荐穿衣颜色"""
    daily_element = get_daily_five_element(date)
    star_color = get_daily_star_influence(date)
    
    # 获取与当日五行相生或相同的颜色系统
    recommended_colors = []
    for color_system, info in COLOR_SYSTEMS.items():
        element = info["五行"]
        if (element == daily_element or 
            FIVE_ELEMENTS[daily_element]["生"] == element or 
            FIVE_ELEMENTS[element]["生"] == daily_element):
            recommended_colors.append(color_system)
    
    # 如果星宿颜色不在推荐列表中，也添加进去
    if star_color not in recommended_colors:
        recommended_colors.append(star_color)
    
    return recommended_colors

def get_daily_food_suggestions(date=None):
    """获取当日饮食建议"""
    date = parse_date(date)
    
    # 基础食物建议基于星期几
    weekday = date.weekday()
    base_suggestions = DAILY_FOOD[str(weekday)]
    
    # 使用日期的日、月来调整食物建议，使每天都有所不同
    day = date.day
    month = date.month
    
    # 所有可能的宜食食物和忌食食物
    all_good_foods = []
    all_bad_foods = []
    
    for day_foods in DAILY_FOOD.values():
        all_good_foods.extend(day_foods["宜"])
        all_bad_foods.extend(day_foods["忌"])
    
    # 去重
    all_good_foods = list(set(all_good_foods))
    all_bad_foods = list(set(all_bad_foods))
    
    # 使用日期生成随机种子，确保同一天生成的结果一致
    random.seed(day + month * 100 + date.year * 10000)
    
    # 从基础建议中保留一部分，并添加一些随机选择的食物
    good_foods = base_suggestions["宜"][:2]  # 保留前两个
    bad_foods = base_suggestions["忌"][:2]   # 保留前两个
    
    # 添加一个随机选择的宜食食物
    remaining_good = [f for f in all_good_foods if f not in good_foods]
    if remaining_good:
        good_foods.append(random.choice(remaining_good))
    
    # 添加一个随机选择的忌食食物
    remaining_bad = [f for f in all_bad_foods if f not in bad_foods]
    if remaining_bad:
        bad_foods.append(random.choice(remaining_bad))
    
    return {
        "宜": good_foods,
        "忌": bad_foods
    }

def get_dress_info_for_date(date=None):
    """获取指定日期的穿衣与饮食建议"""
    date = parse_date(date)
    daily_element = get_daily_five_element(date)
    
    # 获取颜色建议
    color_suggestions = []
    for color_system, info in COLOR_SYSTEMS.items():
        element = info["五行"]
        relation = "相同" if element == daily_element else (
            "相生" if FIVE_ELEMENTS[daily_element]["生"] == element or FIVE_ELEMENTS[element]["生"] == daily_element else (
            "相克" if FIVE_ELEMENTS[daily_element]["克"] == element else "被克"
            )
        )
        
        # 根据日期调整吉凶判断，使每天的建议更加多样化
        day = date.day
        month = date.month
        
        # 使用日期生成随机种子，确保同一天生成的结果一致
        random.seed(day + month * 100 + date.year * 10000 + hash(color_system))
        
        # 基于五行关系的基础吉凶判断
        base_luck = "吉" if relation in ["相同", "相生"] else ("不吉" if relation == "被克" else "中性")
        
        # 有10%的概率反转吉凶判断，增加变化性
        luck = base_luck
        if random.random() < 0.1:
            if base_luck == "吉":
                luck = "中性"
            elif base_luck == "不吉":
                luck = "中性"
            elif base_luck == "中性":
                luck = "吉" if random.random() < 0.5 else "不吉"
        
        # 根据日期调整描述，使每天的建议更加多样化
        descriptions = [
            f"于当日五行{relation}，{luck}相宜。今日若身着此类衣物配饰，有助于提升个人气场。",
            f"今日五行{relation}，整体环境{luck}。此颜色系能够帮助你更好地适应今天的能量场。",
            f"当日五行与此颜色{relation}，{luck}。穿着此类颜色有助于调和今日的能量。",
            f"此颜色与今日五行{relation}，{luck}。适合需要{random.choice(['专注', '放松', '社交', '思考'])}的场合。",
            f"今日此颜色{luck}，与当日五行{relation}。可以{random.choice(['提升运势', '增强气场', '改善心情', '促进交流'])}。"
        ]
        
        # 随机选择一个描述
        selected_description = random.choice(descriptions)
        
        suggestion = {
            "颜色系统": color_system,
            "具体颜色": info["颜色"],
            "五行关系": f"与当日五行{relation}",
            "吉凶": luck,
            "描述": selected_description
        }
        color_suggestions.append(suggestion)
    
    # 获取饮食建议
    food_suggestions = get_daily_food_suggestions(date)
    
    return {
        "date": date.strftime("%Y-%m-%d"),
        "weekday": WEEKDAY_NAMES[date.weekday()],
        "daily_element": daily_element,
        "color_suggestions": color_suggestions,
        "food_suggestions": food_suggestions
    }

def get_today_dress_info():
    """获取今日穿衣颜色和饮食建议"""
    return get_dress_info_for_date()

def get_date_dress_info(date: str):
    """获取指定日期的穿衣颜色和饮食建议"""
    return get_dress_info_for_date(date)

def get_dress_info_range(days_before: int, days_after: int):
    """获取一段时间内的穿衣颜色和饮食建议"""
    current_date = datetime.datetime.now().date()
    
    # 计算日期范围
    start_date, end_date = get_date_range(current_date, days_before, days_after)
    
    # 创建日期范围
    date_range = pd.date_range(start=start_date, end=end_date)
    
    # 初始化结果数组
    dress_info_list = []
    
    # 计算每一天的穿衣信息
    for date in date_range:
        date_obj = date.date()  # 转换为date对象，避免时区问题
        dress_info = get_dress_info_for_date(date_obj)
        dress_info_list.append(dress_info)
    
    return {
        "date_range": {
            "start": start_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d")
        },
        "dress_info_list": dress_info_list
    }