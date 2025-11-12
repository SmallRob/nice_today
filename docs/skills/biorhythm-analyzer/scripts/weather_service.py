#!/usr/bin/env python3
"""
天气服务模块

集成天气API获取实时天气数据，为生物节律分析提供天气相关的穿衣建议和生活指导。
支持多种天气API和模拟数据模式。
"""

import requests
import json
from datetime import datetime
from typing import Dict, Optional


class WeatherService:
    """天气服务类"""
    
    def __init__(self, api_key: str = None, service: str = "openweather"):
        """
        初始化天气服务
        
        Args:
            api_key: 天气API密钥
            service: 天气服务提供商 ("openweather", "qweather", "mock")
        """
        self.api_key = api_key
        self.service = service
        
        # API端点配置
        self.endpoints = {
            "openweather": {
                "current": "https://api.openweathermap.org/data/2.5/weather",
                "forecast": "https://api.openweathermap.org/data/2.5/forecast"
            },
            "qweather": {
                "current": "https://devapi.qweather.com/v7/weather/now",
                "forecast": "https://devapi.qweather.com/v7/weather/3d"
            }
        }
    
    def get_current_weather(self, city: str, country: str = "CN") -> Dict:
        """
        获取当前天气数据
        
        Args:
            city: 城市名称
            country: 国家代码（默认中国）
            
        Returns:
            天气数据字典
        """
        if self.service == "mock":
            return self._get_mock_weather_data(city)
        
        try:
            if self.service == "openweather":
                return self._get_openweather_data(city, country)
            elif self.service == "qweather":
                return self._get_qweather_data(city)
            else:
                raise ValueError(f"不支持的天气服务: {self.service}")
        except Exception as e:
            print(f"获取天气数据失败: {e}")
            # 返回模拟数据作为降级方案
            return self._get_mock_weather_data(city)
    
    def _get_openweather_data(self, city: str, country: str) -> Dict:
        """从OpenWeatherMap获取天气数据"""
        if not self.api_key:
            raise ValueError("OpenWeatherMap API密钥未配置")
        
        params = {
            'q': f"{city},{country}",
            'appid': self.api_key,
            'units': 'metric',
            'lang': 'zh_cn'
        }
        
        response = requests.get(self.endpoints["openweather"]["current"], params=params)
        response.raise_for_status()
        
        data = response.json()
        
        return self._parse_openweather_response(data)
    
    def _get_qweather_data(self, city: str) -> Dict:
        """从和风天气获取天气数据"""
        if not self.api_key:
            raise ValueError("和风天气API密钥未配置")
        
        # 首先获取城市ID
        location_url = "https://geoapi.qweather.com/v2/city/lookup"
        location_params = {
            'location': city,
            'key': self.api_key,
            'range': 'cn'
        }
        
        location_response = requests.get(location_url, params=location_params)
        location_response.raise_for_status()
        
        location_data = location_response.json()
        if not location_data.get('location'):
            raise ValueError(f"未找到城市: {city}")
        
        city_id = location_data['location'][0]['id']
        
        # 获取天气数据
        weather_params = {
            'location': city_id,
            'key': self.api_key,
            'lang': 'zh'
        }
        
        weather_response = requests.get(self.endpoints["qweather"]["current"], params=weather_params)
        weather_response.raise_for_status()
        
        data = weather_response.json()
        
        return self._parse_qweather_response(data, city)
    
    def _parse_openweather_response(self, data: Dict) -> Dict:
        """解析OpenWeatherMap响应"""
        main = data.get('main', {})
        weather = data.get('weather', [{}])[0]
        wind = data.get('wind', {})
        
        return {
            'city': data.get('name', '未知'),
            'temperature': round(main.get('temp', 20)),
            'feels_like': round(main.get('feels_like', 20)),
            'humidity': main.get('humidity', 50),
            'pressure': main.get('pressure', 1013),
            'condition': self._map_weather_condition(weather.get('main', 'Clear')),
            'description': weather.get('description', '晴朗'),
            'wind_speed': wind.get('speed', 0),
            'wind_direction': self._get_wind_direction(wind.get('deg', 0)),
            'visibility': data.get('visibility', 10000),
            'timestamp': datetime.now().isoformat()
        }
    
    def _parse_qweather_response(self, data: Dict, city: str) -> Dict:
        """解析和风天气响应"""
        now = data.get('now', {})
        
        return {
            'city': city,
            'temperature': int(now.get('temp', 20)),
            'feels_like': int(now.get('feelsLike', 20)),
            'humidity': int(now.get('humidity', 50)),
            'pressure': int(now.get('pressure', 1013)),
            'condition': self._map_weather_condition(now.get('text', 'Clear')),
            'description': now.get('text', '晴朗'),
            'wind_speed': float(now.get('windSpeed', 0)),
            'wind_direction': now.get('windDir', '无风'),
            'visibility': int(now.get('vis', 10)) * 1000,  # 公里转米
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_mock_weather_data(self, city: str) -> Dict:
        """生成模拟天气数据（用于测试和降级）"""
        # 基于月份生成合理的模拟数据
        current_month = datetime.now().month
        
        if current_month in [12, 1, 2]:  # 冬季
            temp = -5 + current_month * 2
            condition = 'snow' if temp < 0 else 'cloudy'
        elif current_month in [3, 4, 5]:  # 春季
            temp = 10 + (current_month - 3) * 5
            condition = 'rain' if current_month == 4 else 'partly_cloudy'
        elif current_month in [6, 7, 8]:  # 夏季
            temp = 25 + (current_month - 6) * 3
            condition = 'sunny'
        else:  # 秋季
            temp = 20 - (current_month - 9) * 3
            condition = 'clear'
        
        return {
            'city': city,
            'temperature': temp,
            'feels_like': temp + 2 if temp > 25 else temp - 2,
            'humidity': 60 if condition in ['rain', 'snow'] else 40,
            'pressure': 1013,
            'condition': condition,
            'description': self._get_condition_description(condition),
            'wind_speed': 3.5,
            'wind_direction': '东南风',
            'visibility': 10000,
            'timestamp': datetime.now().isoformat(),
            'is_mock': True  # 标记为模拟数据
        }
    
    def _map_weather_condition(self, condition: str) -> str:
        """映射天气条件到标准格式"""
        condition_map = {
            'Clear': 'clear',
            'Clouds': 'cloudy',
            'Rain': 'rain',
            'Snow': 'snow',
            'Thunderstorm': 'thunderstorm',
            'Drizzle': 'drizzle',
            'Mist': 'fog',
            'Fog': 'fog',
            'Haze': 'haze',
            '晴': 'clear',
            '多云': 'cloudy',
            '阴': 'overcast',
            '雨': 'rain',
            '雪': 'snow',
            '雷阵雨': 'thunderstorm'
        }
        
        return condition_map.get(condition, 'clear')
    
    def _get_wind_direction(self, degrees: float) -> str:
        """根据度数获取风向"""
        directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
        index = round(degrees / 45) % 8
        return directions[index] + '风'
    
    def _get_condition_description(self, condition: str) -> str:
        """获取天气条件描述"""
        descriptions = {
            'clear': '晴朗',
            'cloudy': '多云',
            'partly_cloudy': '局部多云',
            'overcast': '阴天',
            'rain': '下雨',
            'snow': '下雪',
            'thunderstorm': '雷阵雨',
            'drizzle': '毛毛雨',
            'fog': '雾',
            'haze': '霾'
        }
        return descriptions.get(condition, '未知')
    
    def get_clothing_advice(self, weather_data: Dict) -> Dict:
        """
        根据天气数据生成穿衣建议
        
        Args:
            weather_data: 天气数据
            
        Returns:
            穿衣建议字典
        """
        temp = weather_data['temperature']
        condition = weather_data['condition']
        wind_speed = weather_data['wind_speed']
        
        advice = {
            'upper_body': self._get_upper_body_advice(temp, condition, wind_speed),
            'lower_body': self._get_lower_body_advice(temp, condition),
            'accessories': self._get_accessories_advice(temp, condition),
            'footwear': self._get_footwear_advice(condition),
            'umbrella': self._get_umbrella_advice(condition),
            'comfort_level': self._get_comfort_level(temp, condition, wind_speed)
        }
        
        return advice
    
    def _get_upper_body_advice(self, temp: float, condition: str, wind_speed: float) -> str:
        """生成上身穿着建议"""
        if temp < 0:
            return "厚羽绒服或棉大衣"
        elif temp < 10:
            if wind_speed > 5:
                return "防风外套 + 毛衣"
            else:
                return "厚外套或薄羽绒服"
        elif temp < 20:
            if condition in ['rain', 'snow']:
                return "防水外套 + 长袖"
            else:
                return "长袖T恤 + 薄外套"
        elif temp < 25:
            return "短袖T恤或薄长袖"
        else:
            return "短袖T恤或背心"
    
    def _get_lower_body_advice(self, temp: float, condition: str) -> str:
        """生成下身穿着建议"""
        if temp < 10:
            return "厚长裤或保暖裤"
        elif temp < 20:
            if condition in ['rain', 'snow']:
                return "防水长裤"
            else:
                return "普通长裤"
        else:
            return "短裤或薄长裤"
    
    def _get_accessories_advice(self, temp: float, condition: str) -> str:
        """生成配饰建议"""
        accessories = []
        
        if temp < 10:
            accessories.extend(["围巾", "手套", "帽子"])
        elif temp < 15:
            accessories.append("薄围巾")
        
        if condition in ['sunny', 'clear'] and temp > 20:
            accessories.append("太阳镜")
        
        return "、".join(accessories) if accessories else "无需特殊配饰"
    
    def _get_footwear_advice(self, condition: str) -> str:
        """生成鞋履建议"""
        if condition in ['rain', 'snow']:
            return "防水鞋或雨靴"
        elif condition in ['sunny', 'clear']:
            return "运动鞋或凉鞋"
        else:
            return "普通鞋履"
    
    def _get_umbrella_advice(self, condition: str) -> str:
        """生成雨伞建议"""
        if condition in ['rain', 'thunderstorm', 'drizzle']:
            return "需要带伞"
        elif condition in ['sunny', 'clear']:
            return "可带防晒伞"
        else:
            return "不需要带伞"
    
    def _get_comfort_level(self, temp: float, condition: str, wind_speed: float) -> str:
        """获取舒适度等级"""
        # 考虑温度、湿度和风速的综合舒适度
        comfort_score = 0
        
        # 温度舒适度（最佳温度18-24度）
        if 18 <= temp <= 24:
            comfort_score += 3
        elif 15 <= temp <= 27:
            comfort_score += 2
        elif 10 <= temp <= 30:
            comfort_score += 1
        
        # 天气条件舒适度
        if condition in ['clear', 'partly_cloudy']:
            comfort_score += 2
        elif condition in ['cloudy', 'overcast']:
            comfort_score += 1
        elif condition in ['rain', 'snow', 'thunderstorm']:
            comfort_score -= 1
        
        # 风速舒适度（最佳风速1-3m/s）
        if 1 <= wind_speed <= 3:
            comfort_score += 1
        elif wind_speed > 8:
            comfort_score -= 1
        
        if comfort_score >= 4:
            return "非常舒适"
        elif comfort_score >= 2:
            return "舒适"
        elif comfort_score >= 0:
            return "一般"
        else:
            return "不舒适"


def main():
    """示例使用"""
    # 使用模拟数据测试
    weather_service = WeatherService(service="mock")
    
    weather_data = weather_service.get_current_weather("北京")
    print("天气数据:")
    print(f"城市: {weather_data['city']}")
    print(f"温度: {weather_data['temperature']}°C")
    print(f"体感温度: {weather_data['feels_like']}°C")
    print(f"天气: {weather_data['description']}")
    print(f"湿度: {weather_data['humidity']}%")
    print(f"风速: {weather_data['wind_speed']} m/s")
    print()
    
    clothing_advice = weather_service.get_clothing_advice(weather_data)
    print("穿衣建议:")
    print(f"上身: {clothing_advice['upper_body']}")
    print(f"下身: {clothing_advice['lower_body']}")
    print(f"鞋履: {clothing_advice['footwear']}")
    print(f"配饰: {clothing_advice['accessories']}")
    print(f"雨伞: {clothing_advice['umbrella']}")
    print(f"舒适度: {clothing_advice['comfort_level']}")


if __name__ == "__main__":
    main()