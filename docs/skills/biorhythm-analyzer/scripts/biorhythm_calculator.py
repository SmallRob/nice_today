#!/usr/bin/env python3
"""
生物节律计算器

根据用户出生日期计算人体生物节律周期（体力、情绪、智力），
并提供未来7天的节律预测和状态分析。
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple


class BiorhythmCalculator:
    """生物节律计算器类"""
    
    def __init__(self):
        # 生物节律周期长度（天）
        self.PHYSICAL_CYCLE = 23  # 体力周期
        self.EMOTIONAL_CYCLE = 28  # 情绪周期
        self.INTELLECTUAL_CYCLE = 33  # 智力周期
    
    def calculate_biorhythm(self, birth_date: str, target_date: str = None) -> Dict:
        """
        计算生物节律
        
        Args:
            birth_date: 出生日期 (YYYY-MM-DD)
            target_date: 目标日期 (YYYY-MM-DD)，默认为当天
            
        Returns:
            包含节律数据的字典
        """
        if target_date is None:
            target_date = datetime.now().strftime('%Y-%m-%d')
        
        # 计算天数差
        days_diff = self._calculate_days_difference(birth_date, target_date)
        
        # 计算各项节律值
        physical = self._calculate_single_rhythm(days_diff, self.PHYSICAL_CYCLE)
        emotional = self._calculate_single_rhythm(days_diff, self.EMOTIONAL_CYCLE)
        intellectual = self._calculate_single_rhythm(days_diff, self.INTELLECTUAL_CYCLE)
        
        # 生成节律状态描述
        return {
            'birth_date': birth_date,
            'target_date': target_date,
            'days_diff': days_diff,
            'physical': {
                'value': physical,
                'cycle_day': days_diff % self.PHYSICAL_CYCLE,
                'state': self._get_rhythm_state(physical, 'physical'),
                'description': self._get_rhythm_description(physical, 'physical')
            },
            'emotional': {
                'value': emotional,
                'cycle_day': days_diff % self.EMOTIONAL_CYCLE,
                'state': self._get_rhythm_state(emotional, 'emotional'),
                'description': self._get_rhythm_description(emotional, 'emotional')
            },
            'intellectual': {
                'value': intellectual,
                'cycle_day': days_diff % self.INTELLECTUAL_CYCLE,
                'state': self._get_rhythm_state(intellectual, 'intellectual'),
                'description': self._get_rhythm_description(intellectual, 'intellectual')
            }
        }
    
    def predict_next_week(self, birth_date: str, start_date: str = None) -> List[Dict]:
        """
        预测未来7天的生物节律
        
        Args:
            birth_date: 出生日期 (YYYY-MM-DD)
            start_date: 开始日期 (YYYY-MM-DD)，默认为当天
            
        Returns:
            未来7天的节律数据列表
        """
        if start_date is None:
            start_date = datetime.now().strftime('%Y-%m-%d')
        
        predictions = []
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        
        for i in range(7):
            current_date = start_dt + timedelta(days=i)
            current_date_str = current_date.strftime('%Y-%m-%d')
            
            biorhythm_data = self.calculate_biorhythm(birth_date, current_date_str)
            predictions.append({
                'date': current_date_str,
                'weekday': current_date.strftime('%A'),
                'physical': biorhythm_data['physical']['value'],
                'emotional': biorhythm_data['emotional']['value'],
                'intellectual': biorhythm_data['intellectual']['value'],
                'overall_score': self._calculate_overall_score(biorhythm_data)
            })
        
        return predictions
    
    def _calculate_days_difference(self, birth_date: str, target_date: str) -> int:
        """计算两个日期之间的天数差"""
        birth_dt = datetime.strptime(birth_date, '%Y-%m-%d')
        target_dt = datetime.strptime(target_date, '%Y-%m-%d')
        return (target_dt - birth_dt).days
    
    def _calculate_single_rhythm(self, days_diff: int, cycle_length: int) -> float:
        """计算单个节律的值"""
        return math.sin(2 * math.pi * days_diff / cycle_length)
    
    def _get_rhythm_state(self, value: float, rhythm_type: str) -> str:
        """根据节律值获取状态描述"""
        if value > 0.7:
            return 'excellent'
        elif value > 0.3:
            return 'good'
        elif value > -0.3:
            return 'normal'
        elif value > -0.7:
            return 'poor'
        else:
            return 'critical'
    
    def _get_rhythm_description(self, value: float, rhythm_type: str) -> str:
        """根据节律值和类型生成描述"""
        state = self._get_rhythm_state(value, rhythm_type)
        
        descriptions = {
            'physical': {
                'excellent': '体力充沛，适合进行高强度运动',
                'good': '体力良好，可以安排适度运动',
                'normal': '体力正常，注意劳逸结合',
                'poor': '体力较差，建议多休息',
                'critical': '体力极差，需要充分休息'
            },
            'emotional': {
                'excellent': '情绪高涨，适合社交活动',
                'good': '情绪稳定，心态积极',
                'normal': '情绪平稳，保持平常心',
                'poor': '情绪低落，建议自我调节',
                'critical': '情绪波动大，需要寻求支持'
            },
            'intellectual': {
                'excellent': '思维敏捷，适合学习思考',
                'good': '智力活跃，工作效率高',
                'normal': '智力正常，可以完成常规工作',
                'poor': '思维迟钝，建议简单任务',
                'critical': '注意力难集中，避免复杂决策'
            }
        }
        
        return descriptions[rhythm_type][state]
    
    def _calculate_overall_score(self, biorhythm_data: Dict) -> float:
        """计算综合得分（0-100分）"""
        # 将节律值从[-1,1]映射到[0,100]
        physical_score = (biorhythm_data['physical']['value'] + 1) * 50
        emotional_score = (biorhythm_data['emotional']['value'] + 1) * 50
        intellectual_score = (biorhythm_data['intellectual']['value'] + 1) * 50
        
        # 加权平均（体力40%，情绪30%，智力30%）
        return (physical_score * 0.4 + emotional_score * 0.3 + intellectual_score * 0.3)
    
    def get_life_advice(self, biorhythm_data: Dict, weather_data: Dict = None) -> Dict:
        """
        生成生活建议
        
        Args:
            biorhythm_data: 生物节律数据
            weather_data: 天气数据（可选）
            
        Returns:
            生活建议字典
        """
        advice = {
            'exercise': self._get_exercise_advice(biorhythm_data, weather_data),
            'diet': self._get_diet_advice(biorhythm_data),
            'work': self._get_work_advice(biorhythm_data),
            'rest': self._get_rest_advice(biorhythm_data),
            'social': self._get_social_advice(biorhythm_data),
            'weather': self._get_weather_advice(weather_data) if weather_data else None
        }
        
        return advice
    
    def _get_exercise_advice(self, biorhythm_data: Dict, weather_data: Dict) -> str:
        """生成运动建议"""
        physical_state = biorhythm_data['physical']['state']
        
        if physical_state == 'excellent':
            return '可以进行高强度运动，如跑步、游泳、力量训练'
        elif physical_state == 'good':
            return '适合中等强度运动，如快走、瑜伽、健身操'
        elif physical_state == 'normal':
            return '建议进行轻度运动，如散步、拉伸'
        else:
            return '建议休息为主，避免剧烈运动'
    
    def _get_diet_advice(self, biorhythm_data: Dict) -> str:
        """生成饮食建议"""
        physical_state = biorhythm_data['physical']['state']
        emotional_state = biorhythm_data['emotional']['state']
        
        advice = ""
        
        if physical_state in ['poor', 'critical']:
            advice += '建议食用易消化、高营养食物，如粥、汤、水果。'
        else:
            advice += '保持均衡饮食，适量摄入蛋白质和维生素。'
        
        if emotional_state in ['poor', 'critical']:
            advice += '可适当食用香蕉、坚果等有助于情绪稳定的食物。'
        
        return advice
    
    def _get_work_advice(self, biorhythm_data: Dict) -> str:
        """生成工作建议"""
        intellectual_state = biorhythm_data['intellectual']['state']
        
        if intellectual_state == 'excellent':
            return '适合处理复杂问题和创造性工作'
        elif intellectual_state == 'good':
            return '可以安排重要会议和决策工作'
        elif intellectual_state == 'normal':
            return '适合完成常规工作任务'
        else:
            return '建议安排简单重复性工作，避免重要决策'
    
    def _get_rest_advice(self, biorhythm_data: Dict) -> str:
        """生成休息建议"""
        physical_state = biorhythm_data['physical']['state']
        emotional_state = biorhythm_data['emotional']['state']
        
        if physical_state in ['poor', 'critical'] or emotional_state in ['poor', 'critical']:
            return '建议保证充足睡眠，可安排午休，避免熬夜'
        else:
            return '保持正常作息，注意劳逸结合'
    
    def _get_social_advice(self, biorhythm_data: Dict) -> str:
        """生成社交建议"""
        emotional_state = biorhythm_data['emotional']['state']
        
        if emotional_state == 'excellent':
            return '适合参加社交活动，建立人际关系'
        elif emotional_state == 'good':
            return '可以安排小型聚会或朋友见面'
        elif emotional_state == 'normal':
            return '保持正常社交，避免过度应酬'
        else:
            return '建议独处或与亲密朋友交流，避免大型社交场合'
    
    def _get_weather_advice(self, weather_data: Dict) -> str:
        """生成天气相关建议"""
        if not weather_data:
            return ""
        
        temp = weather_data.get('temperature', 20)
        condition = weather_data.get('condition', 'clear')
        
        advice = ""
        
        if temp < 10:
            advice += '天气寒冷，注意保暖，多穿衣物。'
        elif temp > 30:
            advice += '天气炎热，注意防暑，多补充水分。'
        
        if condition in ['rain', 'snow']:
            advice += '有降水，出门请带伞，注意交通安全。'
        elif condition == 'windy':
            advice += '风力较大，注意防风。'
        
        return advice


def main():
    """示例使用"""
    calculator = BiorhythmCalculator()
    
    # 示例数据
    birth_date = "1990-01-01"
    target_date = "2024-01-15"
    
    # 计算生物节律
    result = calculator.calculate_biorhythm(birth_date, target_date)
    print("生物节律分析结果:")
    print(f"出生日期: {result['birth_date']}")
    print(f"分析日期: {result['target_date']}")
    print(f"天数差: {result['days_diff']}天")
    print()
    
    print("体力节律:")
    print(f"  值: {result['physical']['value']:.2f}")
    print(f"  状态: {result['physical']['state']}")
    print(f"  建议: {result['physical']['description']}")
    print()
    
    print("情绪节律:")
    print(f"  值: {result['emotional']['value']:.2f}")
    print(f"  状态: {result['emotional']['state']}")
    print(f"  建议: {result['emotional']['description']}")
    print()
    
    print("智力节律:")
    print(f"  值: {result['intellectual']['value']:.2f}")
    print(f"  状态: {result['intellectual']['state']}")
    print(f"  建议: {result['intellectual']['description']}")
    print()
    
    # 预测未来一周
    predictions = calculator.predict_next_week(birth_date, target_date)
    print("未来一周预测:")
    for pred in predictions:
        print(f"{pred['date']} ({pred['weekday']}): 体力{pred['physical']:.2f}, 情绪{pred['emotional']:.2f}, 智力{pred['intellectual']:.2f}, 综合{pred['overall_score']:.1f}分")


if __name__ == "__main__":
    main()