#!/usr/bin/env python3
"""
综合生物节律生活指南服务
基于用户出生日期，生成生物节律信息和穿衣建议等综合生活指南
遵循生物节律报告生成器的封装格式
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import numpy as np

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.date_utils import parse_date, get_date_range

# 加载配置
config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'app_config.json')
with open(config_path, 'r', encoding='utf-8') as f:
    config = json.load(f)

# 获取生物节律周期配置
CYCLES = config['biorhythm']['cycles']

class BiorhythmLifeGuideService:
    """综合生物节律生活指南服务"""
    
    def __init__(self):
        self.report_templates = {
            "excellent": {
                "title": "🌟 卓越表现日",
                "description": "今天您的生物节律状态极佳，是展现卓越表现的绝佳时机！",
                "color": "green"
            },
            "good": {
                "title": "✨ 高能日",
                "description": "今天状态良好，适合处理重要事务和创造性工作。",
                "color": "blue"
            },
            "average": {
                "title": "😊 平稳日",
                "description": "今天状态平稳，适合正常工作和生活。",
                "color": "yellow"
            },
            "poor": {
                "title": "⚠️ 休息日",
                "description": "今天建议适当休息，避免高强度活动。",
                "color": "orange"
            },
            "critical": {
                "title": "⚠️ 低谷期",
                "description": "今天是节律低谷期，建议以休息为主。",
                "color": "red"
            }
        }
    
    def calculate_rhythm_value(self, cycle: int, days_since_birth: int) -> int:
        """计算特定周期的节律值"""
        return int(100 * np.sin(2 * np.pi * days_since_birth / cycle))
    
    def calculate_biorhythm(self, birth_date: str, target_date: str) -> Dict[str, int]:
        """计算特定日期的生物节律值"""
        birth_date_obj = parse_date(birth_date)
        target_date_obj = parse_date(target_date)
        
        # 计算天数差
        days_since_birth = (target_date_obj - birth_date_obj).days

        physical_value = self.calculate_rhythm_value(CYCLES['physical'], days_since_birth)
        emotional_value = self.calculate_rhythm_value(CYCLES['emotional'], days_since_birth)
        intellectual_value = self.calculate_rhythm_value(CYCLES['intellectual'], days_since_birth)

        return {
            "physical": physical_value,
            "emotional": emotional_value,
            "intellectual": intellectual_value
        }
    
    def generate_comprehensive_guide(self, birth_date: str, location: Optional[str] = None) -> Dict[str, Any]:
        """
        生成综合生物节律生活指南
        
        Args:
            birth_date (str): 出生日期，格式：YYYY-MM-DD
            location (str, optional): 地理位置
            
        Returns:
            dict: 包含完整生活指南数据的字典
        """
        try:
            # 计算今日生物节律
            today_data = self.calculate_biorhythm(birth_date, datetime.now().strftime("%Y-%m-%d"))
            
            # 计算未来7天生物节律趋势
            weekly_trend = self.calculate_weekly_trend(birth_date)
            
            # 获取默认天气数据
            weather_data = self._get_default_weather_data()
            
            # 生成个性化建议
            personal_recommendations = self._generate_personal_recommendations(
                today_data, weather_data
            )
            
            # 生成报告摘要
            report_summary = self._generate_report_summary(today_data)
            
            # 生成图表数据
            chart_data = self._generate_chart_data(birth_date)
            
            # 生成穿衣建议
            dress_recommendations = self._generate_dress_recommendations(today_data)
            
            return {
                "success": True,
                "report_date": datetime.now().strftime("%Y-%m-%d"),
                "birth_date": birth_date,
                "location": location,
                "summary": report_summary,
                "today_data": today_data,
                "weekly_trend": weekly_trend,
                "weather_data": weather_data,
                "recommendations": personal_recommendations,
                "chart_data": chart_data,
                "dress_recommendations": dress_recommendations
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"生成生活指南失败: {str(e)}"
            }
    
    def calculate_weekly_trend(self, birth_date: str) -> List[Dict[str, Any]]:
        """计算未来7天生物节律趋势"""
        weekly_trend = []
        today = datetime.now()
        
        for i in range(7):
            date = today + timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            
            rhythm_data = self.calculate_biorhythm(birth_date, date_str)
            
            weekly_trend.append({
                "date": date_str,
                "physical": rhythm_data["physical"],
                "emotional": rhythm_data["emotional"],
                "intellectual": rhythm_data["intellectual"],
                "day_of_week": date.strftime("%A"),
                "day_type": "weekday" if date.weekday() < 5 else "weekend"
            })
        
        return weekly_trend
    
    def _generate_report_summary(self, today_data: Dict[str, int]) -> Dict[str, Any]:
        """生成报告摘要"""
        # 计算综合评分
        total_score = today_data["physical"] + today_data["emotional"] + today_data["intellectual"]
        
        # 确定报告类型
        if total_score >= 200:
            report_type = "excellent"
        elif total_score >= 100:
            report_type = "good"
        elif total_score >= 0:
            report_type = "average"
        elif total_score >= -100:
            report_type = "poor"
        else:
            report_type = "critical"
        
        template = self.report_templates[report_type]
        
        return {
            "type": report_type,
            "title": template["title"],
            "description": template["description"],
            "total_score": total_score,
            "color": template["color"],
            "physical_status": self._get_rhythm_status(today_data["physical"]),
            "emotional_status": self._get_rhythm_status(today_data["emotional"]),
            "intellectual_status": self._get_rhythm_status(today_data["intellectual"])
        }
    
    def _generate_personal_recommendations(self, today_data: Dict[str, int], weather_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """生成个性化建议"""
        recommendations = {
            "dressing": [],
            "diet": [],
            "activities": [],
            "health": [],
            "weather_related": []
        }
        
        # 穿衣建议
        recommendations["dressing"] = self._generate_dressing_recommendations(
            today_data, weather_data
        )
        
        # 饮食建议
        recommendations["diet"] = self._generate_diet_recommendations(today_data)
        
        # 活动建议
        recommendations["activities"] = self._generate_activity_recommendations(today_data)
        
        # 健康建议
        recommendations["health"] = self._generate_health_recommendations(today_data)
        
        # 天气相关建议
        recommendations["weather_related"] = self._generate_weather_recommendations(
            weather_data
        )
        
        return recommendations
    
    def _generate_dress_recommendations(self, today_data: Dict[str, int]) -> Dict[str, Any]:
        """生成穿衣建议"""
        dress_recommendations = {
            "color_suggestions": [],
            "style_suggestions": [],
            "accessory_suggestions": []
        }
        
        # 根据节律状态选择颜色
        if today_data["physical"] > 50:
            dress_recommendations["color_suggestions"].append("👕 今天体力充沛，适合穿着运动休闲风格的衣服")
            dress_recommendations["style_suggestions"].append("🏃 适合运动风格，便于活动")
        elif today_data["physical"] < -50:
            dress_recommendations["color_suggestions"].append("👕 今天体力较差，建议选择舒适宽松的衣服")
            dress_recommendations["style_suggestions"].append("💤 适合宽松舒适的家居风格")
        
        if today_data["emotional"] > 50:
            dress_recommendations["color_suggestions"].append("🎨 情绪积极，可以尝试明亮的颜色来提升心情")
            dress_recommendations["accessory_suggestions"].append("✨ 可以佩戴一些亮色饰品")
        elif today_data["emotional"] < -50:
            dress_recommendations["color_suggestions"].append("🎨 情绪可能低落，建议选择温和的中性色调")
            dress_recommendations["accessory_suggestions"].append("🌿 选择简约低调的配饰")
        
        if today_data["intellectual"] > 50:
            dress_recommendations["color_suggestions"].append("🧠 思维活跃，适合穿着专业得体的服装")
            dress_recommendations["style_suggestions"].append("📚 适合商务或学术场合的着装")
        elif today_data["intellectual"] < -50:
            dress_recommendations["color_suggestions"].append("🧠 思维效率一般，建议穿着舒适但不过于随意的服装")
            dress_recommendations["style_suggestions"].append("🛋️ 适合居家办公或轻松场合")
        
        return dress_recommendations
    
    def _generate_dressing_recommendations(self, today_data: Dict[str, int], weather_data: Dict[str, Any]) -> List[str]:
        """生成穿衣建议"""
        recommendations = []
        
        # 根据节律状态选择颜色
        if today_data["physical"] > 50:
            recommendations.append("👕 今天体力充沛，适合穿着运动休闲风格的衣服")
        elif today_data["physical"] < -50:
            recommendations.append("👕 今天体力较差，建议选择舒适宽松的衣服")
        
        if today_data["emotional"] > 50:
            recommendations.append("🎨 情绪积极，可以尝试明亮的颜色来提升心情")
        elif today_data["emotional"] < -50:
            recommendations.append("🎨 情绪可能低落，建议选择温和的中性色调")
        
        # 根据天气调整穿衣建议
        if weather_data and "current" in weather_data:
            temp = weather_data["current"].get("temperature", 20)
            condition = weather_data["current"].get("condition", "")
            
            if temp < 10:
                recommendations.append("🧥 天气寒冷，请穿保暖衣物")
            elif temp > 25:
                recommendations.append("👕 天气炎热，建议穿着轻薄透气的衣物")
            
            if "rain" in condition.lower():
                recommendations.append("☔ 有雨，请携带雨具")
            elif "sun" in condition.lower():
                recommendations.append("☀️ 阳光充足，建议佩戴太阳镜和帽子")
        
        return recommendations
    
    def _generate_diet_recommendations(self, today_data: Dict[str, int]) -> List[str]:
        """生成饮食建议"""
        recommendations = []
        
        if today_data["physical"] > 50:
            recommendations.append("🍎 体力充沛，可以适当增加蛋白质摄入")
        elif today_data["physical"] < -50:
            recommendations.append("🍎 体力较差，建议选择易消化的食物")
        
        if today_data["emotional"] > 50:
            recommendations.append("🍌 情绪积极，可以享受喜欢的食物")
        elif today_data["emotional"] < -50:
            recommendations.append("🍫 情绪可能低落，可以适当吃些甜食提升心情")
        
        if today_data["intellectual"] > 50:
            recommendations.append("🥜 思维活跃，建议补充富含Omega-3的食物")
        elif today_data["intellectual"] < -50:
            recommendations.append("🍵 思维效率一般，建议多喝水保持清醒")
        
        return recommendations
    
    def _generate_activity_recommendations(self, today_data: Dict[str, int]) -> List[str]:
        """生成活动建议"""
        recommendations = []
        
        if today_data["physical"] > 50:
            recommendations.append("🏃 体力充沛，适合进行体育锻炼")
        elif today_data["physical"] < -50:
            recommendations.append("💤 体力较差，建议进行轻度活动或休息")
        
        if today_data["emotional"] > 50:
            recommendations.append("🎭 情绪积极，适合社交活动")
        elif today_data["emotional"] < -50:
            recommendations.append("📖 情绪可能低落，建议独处或进行安静活动")
        
        if today_data["intellectual"] > 50:
            recommendations.append("📚 思维敏捷，适合学习和创造性工作")
        elif today_data["intellectual"] < -50:
            recommendations.append("🧘 思维效率一般，建议处理常规任务")
        
        return recommendations
    
    def _generate_health_recommendations(self, today_data: Dict[str, int]) -> List[str]:
        """生成健康建议"""
        recommendations = []
        
        # 综合健康建议
        total_score = today_data["physical"] + today_data["emotional"] + today_data["intellectual"]
        
        if total_score >= 200:
            recommendations.append("💪 今天状态极佳，充分利用这一天！")
        elif total_score >= 100:
            recommendations.append("👍 今天状态良好，保持积极心态")
        elif total_score >= 0:
            recommendations.append("😊 今天状态平稳，注意劳逸结合")
        elif total_score >= -100:
            recommendations.append("⚠️ 今天状态一般，注意休息和放松")
        else:
            recommendations.append("🛌 今天状态较差，建议多休息")
        
        # 睡眠建议
        if today_data["physical"] < -30:
            recommendations.append("💤 体力节律较低，建议今晚早点休息")
        
        # 压力管理
        if today_data["emotional"] < -30:
            recommendations.append("🧘 情绪可能波动，建议进行冥想或深呼吸")
        
        return recommendations
    
    def _generate_weather_recommendations(self, weather_data: Dict[str, Any]) -> List[str]:
        """生成天气相关建议"""
        recommendations = []
        
        if "current" in weather_data:
            temp = weather_data["current"].get("temperature", 20)
            condition = weather_data["current"].get("condition", "")
            humidity = weather_data["current"].get("humidity", 50)
            
            if temp < 5:
                recommendations.append("❄️ 天气寒冷，注意保暖防寒")
            elif temp > 30:
                recommendations.append("🔥 天气炎热，注意防暑降温")
            
            if "rain" in condition.lower():
                recommendations.append("🌧️ 雨天路滑，出行注意安全")
            elif "snow" in condition.lower():
                recommendations.append("⛄ 下雪天，注意路面结冰")
            
            if humidity > 80:
                recommendations.append("💧 湿度较高，注意防潮")
            elif humidity < 30:
                recommendations.append("🌵 空气干燥，注意补水保湿")
        
        return recommendations
    
    def _generate_chart_data(self, birth_date: str) -> Dict[str, Any]:
        """生成图表数据"""
        # 生成30天的节律数据用于图表显示
        dates = []
        physical_data = []
        emotional_data = []
        intellectual_data = []
        
        today = datetime.now()
        for i in range(-15, 15):
            date = today + timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            
            rhythm_data = self.calculate_biorhythm(birth_date, date_str)
            
            dates.append(date_str)
            physical_data.append(rhythm_data["physical"])
            emotional_data.append(rhythm_data["emotional"])
            intellectual_data.append(rhythm_data["intellectual"])
        
        return {
            "dates": dates,
            "physical": physical_data,
            "emotional": emotional_data,
            "intellectual": intellectual_data
        }
    
    def _get_rhythm_status(self, value: int) -> str:
        """获取节律状态描述"""
        abs_value = abs(value)
        
        if abs_value >= 90:
            return "极佳" if value > 0 else "极差"
        elif abs_value >= 70:
            return "很好" if value > 0 else "很差"
        elif abs_value >= 50:
            return "良好" if value > 0 else "较差"
        elif abs_value >= 30:
            return "一般" if value > 0 else "一般偏低"
        else:
            return "平稳期"
    
    def _get_default_weather_data(self) -> Dict[str, Any]:
        """获取默认天气数据"""
        return {
            "current": {
                "temperature": 20,
                "condition": "晴",
                "humidity": 50,
                "wind_speed": 10
            },
            "forecast": [
                {"date": datetime.now().strftime("%Y-%m-%d"), "temperature": 20, "condition": "晴"},
                {"date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"), "temperature": 22, "condition": "多云"},
                {"date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"), "temperature": 18, "condition": "小雨"}
            ]
        }

# 创建全局服务实例
life_guide_service = BiorhythmLifeGuideService()

def get_biorhythm_life_guide(birth_date: str, location: Optional[str] = None) -> Dict[str, Any]:
    """
    获取生物节律生活指南的公共接口
    
    Args:
        birth_date (str): 出生日期
        location (str, optional): 地理位置
        
    Returns:
        dict: 生活指南数据
    """
    return life_guide_service.generate_comprehensive_guide(birth_date, location)

def get_today_biorhythm_guide(birth_date: str) -> Dict[str, Any]:
    """获取今日生物节律生活指南"""
    return life_guide_service.generate_comprehensive_guide(birth_date)

if __name__ == "__main__":
    # 测试服务
    service = BiorhythmLifeGuideService()
    
    # 测试报告生成
    birth_date = "1991-04-21"
    location = "北京,中国"
    
    report = service.generate_comprehensive_guide(birth_date, location)
    
    if report["success"]:
        print("=== 生物节律生活指南测试报告 ===")
        print(f"报告日期: {report['report_date']}")
        print(f"出生日期: {report['birth_date']}")
        print(f"地理位置: {report.get('location', '未指定')}")
        print(f"\n报告摘要: {report['summary']['title']}")
        print(f"描述: {report['summary']['description']}")
        print(f"综合评分: {report['summary']['total_score']}")
        
        print("\n=== 今日节律状态 ===")
        print(f"体力: {report['today_data']['physical']} ({report['summary']['physical_status']})")
        print(f"情绪: {report['today_data']['emotional']} ({report['summary']['emotional_status']})")
        print(f"智力: {report['today_data']['intellectual']} ({report['summary']['intellectual_status']})")
        
        print("\n=== 个性化建议 ===")
        for category, recs in report['recommendations'].items():
            if recs:
                print(f"\n{category.upper()}:")
                for rec in recs:
                    print(f"  • {rec}")
    else:
        print(f"生成报告失败: {report['error']}")