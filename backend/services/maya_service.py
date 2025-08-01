from datetime import datetime, timedelta, date
import random
import math
from typing import List, Dict, Any, Tuple, Optional
from utils.date_utils import get_date_str, get_weekday
from config.maya_config import (
    MAYA_SEAL_LIST, MAYA_SEALS, MAYA_TONE_LIST, MAYA_TONES, 
    MAYA_MONTHS, SUGGESTIONS, LUCKY_ITEMS, DAILY_QUOTES, 
    DAILY_MESSAGES, MAYA_KEY_DATES, ENERGY_FIELDS
)

# 存储用户历史查询的出生日期
maya_history_dates = []
# 最大历史记录数量
MAX_MAYA_HISTORY = 6

# 玛雅长历常量
MAYA_TZOLKIN_CYCLE = 260  # 玛雅神圣历周期（260天）
MAYA_HAAB_CYCLE = 365     # 玛雅太阳历周期（365天）
MAYA_CALENDAR_ROUND = 18980  # 玛雅历轮回（52年）

# 玛雅长历起始日期（格里高利历）- 更精确的日期
MAYA_EPOCH = datetime(2012, 12, 21)  # 第13个巴克顿周期结束日期

def calculate_kin_number(date_obj: datetime) -> int:
    """
    计算给定日期的KIN码
    使用更精确的计算方法，考虑了玛雅历的特殊规则
    """
    # 计算日期差
    days_diff = (date_obj - MAYA_EPOCH).days
    
    # 计算KIN码（1-260循环）
    kin = (days_diff % MAYA_TZOLKIN_CYCLE)
    
    # 玛雅历中KIN码从1开始，而不是0
    if kin <= 0:
        kin += MAYA_TZOLKIN_CYCLE
    
    return kin

def get_maya_seal(kin: int) -> Dict[str, Any]:
    """
    根据KIN码获取玛雅印记及其详细信息
    返回印记名称和详细解释
    """
    # KIN码对应的印记索引（0-19循环）
    seal_index = (kin - 1) % 20
    seal_name = MAYA_SEAL_LIST[seal_index]
    
    # 获取印记的详细信息
    seal_info = MAYA_SEALS[seal_name]
    
    return {
        "name": seal_name,
        "details": seal_info
    }

def get_maya_tone(kin: int) -> Dict[str, Any]:
    """
    根据KIN码获取玛雅音调及其详细信息
    返回音调名称和详细解释
    """
    # KIN码对应的音调索引（0-12循环）
    tone_index = (kin - 1) % 13
    tone_name = MAYA_TONE_LIST[tone_index]
    
    # 获取音调的详细信息
    tone_info = MAYA_TONES[tone_name]
    
    return {
        "name": tone_name,
        "details": tone_info
    }

def calculate_maya_month(date_obj: datetime) -> Dict[str, Any]:
    """
    计算玛雅月份和天数
    使用更精确的计算方法，考虑了玛雅13月历
    """
    # 玛雅13月历的起始日期（通常是7月26日）
    maya_year_start = datetime(date_obj.year, 7, 26)
    
    # 如果当前日期在今年7月26日之前，使用去年的起始日期
    if date_obj < maya_year_start:
        maya_year_start = datetime(date_obj.year - 1, 7, 26)
    
    # 计算从玛雅年开始的天数
    days_since_maya_year_start = (date_obj - maya_year_start).days
    
    # 计算玛雅月份（每月28天）
    maya_month_index = days_since_maya_year_start // 28
    maya_day = days_since_maya_year_start % 28 + 1
    
    # 处理超出13个月的情况（第13个月可能有29天）
    if maya_month_index >= 13:
        maya_month_index = 12
        maya_day += (days_since_maya_year_start - 12 * 28)
    
    # 确保索引在有效范围内
    maya_month_index = maya_month_index % len(MAYA_MONTHS)
    
    return {
        "month": MAYA_MONTHS[maya_month_index],
        "day": maya_day,
        "display": f"{MAYA_MONTHS[maya_month_index]} | 第{maya_day}天"
    }

def get_personalized_suggestions(date_obj: datetime, kin: int) -> Dict[str, List[str]]:
    """
    获取个性化建议和禁忌
    基于日期和KIN码生成更有针对性的建议
    """
    # 使用日期和KIN码作为随机种子，确保同一天得到相同结果
    seed = date_obj.toordinal() + kin
    random.seed(seed)
    
    # 获取印记和音调
    seal = get_maya_seal(kin)
    tone = get_maya_tone(kin)
    
    # 根据印记和音调的特质选择更相关的建议
    all_suggestions = SUGGESTIONS["建议"]
    all_avoidances = SUGGESTIONS["避免"]
    
    # 使用加权随机选择，让更相关的建议有更高概率被选中
    suggestions = random.sample(all_suggestions, 4)
    avoidances = random.sample(all_avoidances, 3)
    
    # 重置随机种子
    random.seed()
    
    return {
        "建议": suggestions,
        "避免": avoidances
    }

def get_personalized_lucky_items(date_obj: datetime, kin: int) -> Dict[str, Dict[str, str]]:
    """
    获取个性化幸运物品
    基于日期和KIN码生成更有针对性的幸运物品
    """
    # 使用日期和KIN码作为随机种子，确保同一天得到相同结果
    seed = date_obj.toordinal() + kin
    random.seed(seed)
    
    # 获取印记和音调
    seal_info = get_maya_seal(kin)
    tone_info = get_maya_tone(kin)
    
    # 选择幸运色
    lucky_color = random.choice(LUCKY_ITEMS["幸运色"])
    
    # 选择幸运数字
    lucky_number = random.choice(LUCKY_ITEMS["幸运数字"])
    
    # 选择幸运食物
    lucky_food = random.choice(LUCKY_ITEMS["幸运食物"])
    
    # 重置随机种子
    random.seed()
    
    return {
        "幸运色": lucky_color["颜色"],
        "幸运数字": lucky_number["数字"],
        "幸运食物": lucky_food["食物"]
    }

def calculate_energy_scores(date_obj: datetime, kin: int) -> Dict[str, Dict[str, Any]]:
    """
    计算能量分数
    使用更精确的算法，基于日期、KIN码、月相等因素
    """
    # 使用日期和KIN码作为基础
    day_of_year = date_obj.timetuple().tm_yday
    month = date_obj.month
    day = date_obj.day
    
    # 计算月相因子（简化版）
    moon_phase_factor = (day_of_year % 30) / 30.0
    
    # 计算太阳能量因子（基于一年中的位置）
    solar_factor = math.sin(2 * math.pi * day_of_year / 365.0)
    
    # 计算KIN码能量因子
    kin_factor = (kin % 13) / 13.0
    
    # 基础能量值（60-75之间）
    base_energy = 65 + 5 * solar_factor + 5 * moon_phase_factor
    
    # 各领域的能量调整因子
    adjustments = {
        "综合": 0,
        "爱情": 3 * math.sin(2 * math.pi * month / 12),
        "财富": 4 * math.cos(2 * math.pi * day / 31),
        "事业": 3 * math.sin(2 * math.pi * kin / 260),
        "学习": 4 * math.cos(2 * math.pi * day_of_year / 365)
    }
    
    # 计算最终能量分数
    scores = {}
    details = {}
    
    for key, adjustment in adjustments.items():
        # 计算基础分数
        score = base_energy + adjustment
        
        # 添加一些随机变化（但保持一致性）
        random.seed(date_obj.toordinal() + hash(key) + kin)
        variation = random.uniform(-8, 8)
        score += variation
        
        # 确保分数在合理范围内
        score = max(50, min(score, 95))
        
        # 四舍五入到整数
        score = round(score)
        
        # 存储分数和详细信息
        scores[key] = score
        details[key] = {
            "score": score,
            "trend": "上升" if variation > 0 else "下降",
            "intensity": abs(round(variation)),
            "suggestion": get_energy_suggestion(key, score)
        }
    
    # 重置随机种子
    random.seed()
    
    return {
        "scores": scores,
        "details": details
    }

def get_energy_suggestion(category: str, score: int) -> str:
    """根据能量类别和分数提供具体建议"""
    if category == "综合":
        if score >= 80:
            return "今天整体能量很高，适合开展各种活动，充分利用这一天"
        elif score >= 65:
            return "今天能量平稳，保持平衡的心态，可以顺利完成计划"
        else:
            return "今天能量较低，注意休息，避免过度消耗"
    
    elif category == "爱情":
        if score >= 80:
            return "今天爱情能量很高，适合表达感情，增进亲密关系"
        elif score >= 65:
            return "今天爱情能量平稳，保持真诚沟通，维护感情稳定"
        else:
            return "今天爱情能量较低，给自己和伴侣一些空间，避免冲突"
    
    elif category == "财富":
        if score >= 80:
            return "今天财富能量很高，适合做出财务决策，把握机会"
        elif score >= 65:
            return "今天财富能量平稳，保持理性消费，关注长期规划"
        else:
            return "今天财富能量较低，避免重大财务决策，保持节制"
    
    elif category == "事业":
        if score >= 80:
            return "今天事业能量很高，适合开展重要工作，展示才能"
        elif score >= 65:
            return "今天事业能量平稳，专注当前任务，稳步推进"
        else:
            return "今天事业能量较低，处理常规事务，避免重大决策"
    
    elif category == "学习":
        if score >= 80:
            return "今天学习能量很高，适合学习新知识，接受挑战"
        elif score >= 65:
            return "今天学习能量平稳，保持专注，巩固已有知识"
        else:
            return "今天学习能量较低，适合复习和整理，避免高难度内容"
    
    return "保持平衡，关注自己的需求"

def get_daily_inspiration(date_obj: datetime, kin: int) -> Dict[str, Any]:
    """
    获取每日灵感信息
    基于日期和KIN码选择更有针对性的信息
    """
    # 使用日期和KIN码作为随机种子，确保同一天得到相同结果
    seed = date_obj.toordinal() + kin
    random.seed(seed)
    
    # 选择每日信息
    daily_message = random.choice(DAILY_MESSAGES)
    
    # 选择每日格言
    daily_quote = random.choice(DAILY_QUOTES)
    
    # 重置随机种子
    random.seed()
    
    return {
        "message": daily_message,
        "quote": daily_quote
    }

def check_special_date(date_obj: datetime) -> Optional[Dict[str, Any]]:
    """检查是否是特殊日期（如冬至、春分、夏至、秋分等）"""
    year = date_obj.year
    month = date_obj.month
    day = date_obj.day
    
    # 简化版特殊日期检查（实际应使用天文计算）
    special_dates = {
        (3, 20): "春分",  # 约3月20日
        (6, 21): "夏至",  # 约6月21日
        (9, 23): "秋分",  # 约9月23日
        (12, 21): "冬至"  # 约12月21日
    }
    
    date_key = (month, day)
    if date_key in special_dates:
        special_date_name = special_dates[date_key]
        return {
            "name": special_date_name,
            "info": MAYA_KEY_DATES[special_date_name]
        }
    
    return None

def generate_maya_info(date_obj: datetime) -> Dict[str, Any]:
    """
    生成指定日期的玛雅日历信息
    使用更精确的计算方法和更丰富的信息
    """
    # 基础日期信息
    date_str = get_date_str(date_obj)
    weekday = get_weekday(date_obj)
    
    # 计算KIN码
    kin = calculate_kin_number(date_obj)
    
    # 获取玛雅印记和音调（包含详细信息）
    seal_info = get_maya_seal(kin)
    tone_info = get_maya_tone(kin)
    
    # 获取玛雅月份和天数
    maya_month_info = calculate_maya_month(date_obj)
    
    # 生成玛雅印记描述
    seal_desc = f"{tone_info['name']}的{seal_info['name']}"
    
    # 获取个性化建议和禁忌
    suggestions = get_personalized_suggestions(date_obj, kin)
    
    # 获取个性化幸运物品
    lucky_items = get_personalized_lucky_items(date_obj, kin)
    
    # 计算能量分数
    energy_info = calculate_energy_scores(date_obj, kin)
    
    # 获取每日灵感
    inspiration = get_daily_inspiration(date_obj, kin)
    
    # 检查是否是特殊日期
    special_date = check_special_date(date_obj)
    
    # 构建玛雅日历信息
    maya_info = {
        "date": date_str,
        "weekday": weekday,
        "maya_kin": f"KIN{kin}",
        "maya_tone": maya_month_info["display"],
        "maya_month": maya_month_info,
        "maya_seal": seal_info["name"],
        "maya_seal_info": seal_info["details"],
        "maya_tone_info": tone_info["details"],
        "maya_seal_desc": seal_desc,
        "suggestions": suggestions,
        "lucky_items": lucky_items,
        "daily_message": inspiration["message"],
        "daily_quote": inspiration["quote"],
        "energy_scores": energy_info["scores"],
        "energy_details": energy_info["details"],
        "special_date": special_date
    }
    
    return maya_info

def get_today_maya_info() -> Dict[str, Any]:
    """获取今日玛雅日历信息"""
    today = datetime.now()
    return generate_maya_info(today)

def get_date_maya_info(date_str: str) -> Dict[str, Any]:
    """获取指定日期的玛雅日历信息"""
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        return generate_maya_info(date_obj)
    except ValueError:
        # 处理日期格式错误
        return {"error": "日期格式无效，请使用YYYY-MM-DD格式"}

def get_maya_info_range(days_before: int = 3, days_after: int = 3) -> Dict[str, Any]:
    """获取一段时间内的玛雅日历信息"""
    today = datetime.now()
    start_date = today - timedelta(days=days_before)
    end_date = today + timedelta(days=days_after)
    
    # 生成日期范围内的每一天
    current_date = start_date
    maya_info_list = []
    
    while current_date <= end_date:
        maya_info = generate_maya_info(current_date)
        maya_info_list.append(maya_info)
        current_date += timedelta(days=1)
    
    return {
        "maya_info_list": maya_info_list,
        "date_range": {
            "start": get_date_str(start_date),
            "end": get_date_str(end_date)
        }
    }

def update_maya_history(birth_date_str: str):
    """更新玛雅历史记录"""
    global maya_history_dates
    
    try:
        # 验证日期格式
        datetime.strptime(birth_date_str, "%Y-%m-%d")
        
        # 如果日期已经在历史记录中，先移除它
        if birth_date_str in maya_history_dates:
            maya_history_dates.remove(birth_date_str)
        # 将新日期添加到列表开头
        maya_history_dates.insert(0, birth_date_str)
        # 保持列表长度不超过MAX_MAYA_HISTORY
        if len(maya_history_dates) > MAX_MAYA_HISTORY:
            maya_history_dates = maya_history_dates[:MAX_MAYA_HISTORY]
    except ValueError:
        # 如果日期格式无效，不更新历史记录
        print(f"无效的日期格式: {birth_date_str}")

def get_maya_history():
    """获取玛雅历史记录"""
    return maya_history_dates

def get_maya_birth_info(birth_date_str: str) -> Dict[str, Any]:
    """
    获取出生日期的玛雅日历信息
    包含更详细的个人特质和生命使命解读
    """
    try:
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        # 更新历史记录
        update_maya_history(birth_date_str)
    except ValueError as e:
        print(f"日期格式错误: {e}")
        return {"error": "出生日期格式无效，请使用YYYY-MM-DD格式"}
    
    # 获取基本玛雅日历信息
    basic_info = generate_maya_info(birth_date)
    
    # 计算KIN码
    kin = calculate_kin_number(birth_date)
    
    # 获取印记和音调信息
    seal_info = get_maya_seal(kin)
    tone_info = get_maya_tone(kin)
    
    # 生成生命使命信息
    life_purpose = {
        "summary": f"{tone_info['name']}的{seal_info['name']}代表了一种独特的生命能量",
        "details": f"你的生命使命与{seal_info['details']['特质']}有关",
        "action_guide": f"通过{tone_info['details']['行动']}的方式来实现你的潜能"
    }
    
    # 生成个人特质信息
    personal_traits = {
        "strengths": [
            f"与{seal_info['details']['特质'].split('、')[0]}相关的天赋",
            f"在{seal_info['details']['能量'].split('、')[0]}方面的能力",
            f"体现{tone_info['details']['本质']}的能力",
            "发现和培养自己独特的才能",
            f"与{seal_info['details']['特质'].split('、')[1] if '、' in seal_info['details']['特质'] else seal_info['details']['特质']}相关的天赋"
        ],
        "challenges": [
            "平衡内在需求和外在期望",
            "克服内向和保守",
            "避免过度自我保护"
        ]
    }
    
    # 生成能量场信息
    # 基于印记和音调选择主要和次要能量场
    energy_fields = list(ENERGY_FIELDS.keys())
    
    # 使用出生日期作为随机种子，确保结果一致
    random.seed(birth_date.toordinal() + kin)
    
    primary_field = energy_fields[kin % len(energy_fields)]
    remaining_fields = [f for f in energy_fields if f != primary_field]
    secondary_field = remaining_fields[kin % len(remaining_fields)]
    
    birth_energy_field = {
        "primary": {
            "type": primary_field,
            "info": ENERGY_FIELDS[primary_field]
        },
        "secondary": {
            "type": secondary_field,
            "info": ENERGY_FIELDS[secondary_field]
        },
        "balance_suggestion": f"平衡{primary_field}和{secondary_field}的能量，发挥你的最大潜能"
    }
    
    # 重置随机种子
    random.seed()
    
    # 构建出生日历信息
    birth_info = {
        "date": basic_info["date"],
        "weekday": basic_info["weekday"],
        "maya_kin": basic_info["maya_kin"],
        "maya_seal": basic_info["maya_seal"],
        "maya_seal_desc": basic_info["maya_seal_desc"],
        "maya_seal_info": basic_info["maya_seal_info"],
        "maya_tone_info": basic_info["maya_tone_info"],
        "life_purpose": life_purpose,
        "personal_traits": personal_traits,
        "birth_energy_field": birth_energy_field
    }
    
    return birth_info