import datetime

def get_date_str(date_obj=None):
    """获取日期字符串，格式为YYYY-MM-DD"""
    if date_obj is None:
        date_obj = datetime.datetime.now()
    elif isinstance(date_obj, str):
        return date_obj
    return date_obj.strftime("%Y-%m-%d")

def get_weekday(date_input=None):
    """获取星期几，返回中文星期几"""
    if date_input is None:
        date_input = datetime.datetime.now()
    elif isinstance(date_input, str):
        date_input = datetime.datetime.strptime(date_input, "%Y-%m-%d")
    
    weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
    return weekdays[date_input.weekday()]

def normalize_date_string(date_str: str) -> str:
    """标准化日期字符串，确保格式为YYYY-MM-DD"""
    try:
        # 解析日期字符串
        date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        # 重新格式化为YYYY-MM-DD
        return date_obj.strftime("%Y-%m-%d")
    except ValueError:
        # 如果解析失败，返回原始字符串
        return date_str

def parse_date(date_input):
    """将输入转换为date对象"""
    if date_input is None:
        return datetime.datetime.now().date()
    elif isinstance(date_input, str):
        return datetime.datetime.strptime(date_input, "%Y-%m-%d").date()
    elif isinstance(date_input, datetime.datetime):
        return date_input.date()
    elif isinstance(date_input, datetime.date):
        return date_input
    else:
        raise ValueError(f"无法解析日期: {date_input}")

def get_date_range(current_date, days_before, days_after):
    """获取日期范围"""
    start_date = current_date - datetime.timedelta(days=days_before)
    end_date = current_date + datetime.timedelta(days=days_after)
    return start_date, end_date