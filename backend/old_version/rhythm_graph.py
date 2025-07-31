import requests
import datetime
import json
from biorhythm_utils import get_current_date

# API 配置
API_BASE_URL = "http://localhost:5000/api"  # 后端 API 的基础 URL，根据实际情况修改

def get_rhythm_data(birth_date, days_before=10, days_after=20):
    """
    调用后端 API 获取生物节律数据
    
    参数:
    birth_date: 出生日期，datetime 对象
    days_before: 当前日期之前的天数
    days_after: 当前日期之后的天数
    
    返回:
    API 返回的节律数据
    """
    try:
        # 将日期转换为字符串格式
        birth_date_str = birth_date.strftime("%Y-%m-%d")
        current_date = get_current_date()
        
        # 构建 API 请求参数
        params = {
            "birth_date": birth_date_str,
            "days_before": days_before,
            "days_after": days_after
        }
        
        # 发送 API 请求
        response = requests.get(f"{API_BASE_URL}/biorhythm", params=params)
        
        # 检查响应状态
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API 请求失败，状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            return None
    except Exception as e:
        print(f"获取节律数据时发生错误: {e}")
        return None

def get_today_rhythm(birth_date):
    """
    获取今天的生物节律值
    
    参数:
    birth_date: 出生日期，datetime 对象
    
    返回:
    今天的体力、情绪和智力节律值
    """
    try:
        # 将日期转换为字符串格式
        birth_date_str = birth_date.strftime("%Y-%m-%d")
        
        # 构建 API 请求参数
        params = {
            "birth_date": birth_date_str,
            "date": get_current_date().strftime("%Y-%m-%d")
        }
        
        # 发送 API 请求
        response = requests.get(f"{API_BASE_URL}/biorhythm/today", params=params)
        
        # 检查响应状态
        if response.status_code == 200:
            data = response.json()
            print("今天的体力节律:", data["physical"])
            print("今天的情绪节律:", data["emotional"])
            print("今天的智力节律:", data["intellectual"])
            return data
        else:
            print(f"API 请求失败，状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            return None
    except Exception as e:
        print(f"获取今天节律数据时发生错误: {e}")
        return None

def get_future_rhythm(birth_date, days=10):
    """
    获取未来某天的生物节律值
    
    参数:
    birth_date: 出生日期，datetime 对象
    days: 未来的天数
    
    返回:
    未来某天的体力、情绪和智力节律值
    """
    try:
        # 将日期转换为字符串格式
        birth_date_str = birth_date.strftime("%Y-%m-%d")
        future_date = (get_current_date() + datetime.timedelta(days=days)).strftime("%Y-%m-%d")
        
        # 构建 API 请求参数
        params = {
            "birth_date": birth_date_str,
            "date": future_date
        }
        
        # 发送 API 请求
        response = requests.get(f"{API_BASE_URL}/biorhythm/date", params=params)
        
        # 检查响应状态
        if response.status_code == 200:
            data = response.json()
            print(f"{days}天后的体力节律:", data["physical"])
            print(f"{days}天后的情绪节律:", data["emotional"])
            print(f"{days}天后的智力节律:", data["intellectual"])
            return data
        else:
            print(f"API 请求失败，状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            return None
    except Exception as e:
        print(f"获取未来节律数据时发生错误: {e}")
        return None

# 主程序逻辑
if __name__ == '__main__':
    try:
        # 使用固定的出生日期进行测试
        birth_str = '1991-04-21'
        birth_date = datetime.datetime.strptime(birth_str, "%Y-%m-%d")
        
        # 获取今天的节律数据
        today_data = get_today_rhythm(birth_date)
        
        # 获取10天后的节律数据
        future_data = get_future_rhythm(birth_date, 10)
        
        # 获取一段时间内的节律数据（用于图表展示，但不再自己绘图）
        rhythm_data = get_rhythm_data(birth_date)
        if rhythm_data:
            print(f"成功获取了 {len(rhythm_data['dates'])} 天的节律数据")
            
    except Exception as e:
        print("发生错误:", e)
