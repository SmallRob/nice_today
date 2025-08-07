// 生物节律配置文件

// 节律状态评估配置
export const rhythmStatusConfig = {
  extremePositive: { threshold: 90, status: '极佳', colorClass: 'text-green-600 bg-green-50 border-green-200' },
  highPositive: { threshold: 70, status: '很好', colorClass: 'text-green-500 bg-green-50 border-green-200' },
  mediumPositive: { threshold: 50, status: '良好', colorClass: 'text-blue-600 bg-blue-50 border-blue-200' },
  lowPositive: { threshold: 30, status: '一般', colorClass: 'text-gray-600 bg-gray-50 border-gray-200' },
  neutral: { threshold: 0, status: '平稳期', colorClass: 'text-gray-600 bg-gray-50 border-gray-200' },
  lowNegative: { threshold: -30, status: '一般偏低', colorClass: 'text-gray-600 bg-gray-50 border-gray-200' },
  mediumNegative: { threshold: -50, status: '较差', colorClass: 'text-orange-600 bg-orange-50 border-orange-200' },
  highNegative: { threshold: -70, status: '很差', colorClass: 'text-red-500 bg-red-50 border-red-200' },
  extremeNegative: { threshold: -90, status: '极差', colorClass: 'text-red-600 bg-red-50 border-red-200' }
};

// 节律类型配置
export const rhythmTypeConfig = {
  physical: {
    name: '体力',
    colorClass: 'bg-gradient-to-r from-red-400 to-red-600',
    iconBgColor: 'bg-red-500',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z'
  },
  emotional: {
    name: '情绪',
    colorClass: 'bg-gradient-to-r from-blue-400 to-blue-600',
    iconBgColor: 'bg-blue-500',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z'
  },
  intellectual: {
    name: '智力',
    colorClass: 'bg-gradient-to-r from-purple-400 to-purple-600',
    iconBgColor: 'bg-purple-500',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  combined: {
    name: '综合',
    colorClass: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    iconBgColor: 'bg-yellow-500',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
  }
};

// 预测提示信息配置
export const predictionTipConfig = {
  physical: {
    highPeak: { threshold: 50, tip: '体力将处于高峰期，适合安排体育活动和高强度工作' },
    positive: { threshold: 0, tip: '体力状态将趋于良好，可以适度增加运动量' },
    negative: { threshold: -50, tip: '体力可能略有下降，注意合理安排活动强度' },
    lowPeak: { threshold: -100, tip: '体力将处于低谷期，建议提前减少高强度活动安排' }
  },
  emotional: {
    highPeak: { threshold: 50, tip: '情绪将处于高峰期，适合社交活动和团队合作' },
    positive: { threshold: 0, tip: '情绪状态将趋于稳定，人际交往将较为顺利' },
    negative: { threshold: -50, tip: '情绪可能有所波动，注意自我调节' },
    lowPeak: { threshold: -100, tip: '情绪将处于低谷期，建议避免重要社交场合和冲突' }
  },
  intellectual: {
    highPeak: { threshold: 50, tip: '思维将特别敏捷，适合安排创造性工作和学习' },
    positive: { threshold: 0, tip: '智力状态将趋于良好，适合处理需要思考的任务' },
    negative: { threshold: -50, tip: '思维效率可能略有下降，适合处理常规任务' },
    lowPeak: { threshold: -100, tip: '思维将处于低效期，建议避免复杂决策和高难度思考任务' }
  },
  combined: {
    highPeak: { threshold: 50, tip: '综合状态将处于高峰期，适合安排重要活动和关键决策' },
    positive: { threshold: 0, tip: '综合状态将趋于良好，可以正常安排各类活动' },
    negative: { threshold: -50, tip: '综合状态可能略有下降，建议适当调整活动强度' },
    lowPeak: { threshold: -100, tip: '综合状态将处于低谷期，建议避免重要决策和高强度活动' }
  }
};

// 24小时人体器官节律数据
export const organRhythmData = [
  { 
    timeRange: '5:00 - 7:00', 
    organ: '大肠', 
    description: '排毒排便时间，肠道蠕动活跃，适合起床后喝温水，促进排便，清理肠道',
    activities: '起床后饮用温水，轻度伸展运动，排便',
    tips: '避免熬夜导致作息紊乱，影响晨间排便规律'
  },
  { 
    timeRange: '7:00 - 9:00', 
    organ: '胃', 
    description: '胃消化功能最佳时段，适合吃营养丰富的早餐，为一天提供能量',
    activities: '吃健康早餐，散步，规划一天工作',
    tips: '不宜空腹，早餐应温热易消化，避免过于油腻食物'
  },
  { 
    timeRange: '9:00 - 11:00', 
    organ: '脾脏', 
    description: '脾胃消化吸收功能旺盛，大脑思维清晰，适合处理需要专注的工作',
    activities: '处理重要工作，学习新知识，创造性活动',
    tips: '可适量补充水果或坚果，维持能量水平'
  },
  { 
    timeRange: '11:00 - 13:00', 
    organ: '心脏', 
    description: '心脏功能活跃，血液循环加速，能量水平高，适合适度运动和进食午餐',
    activities: '午餐，短暂休息，轻度运动',
    tips: '午餐宜适量，避免过饱影响下午工作状态'
  },
  { 
    timeRange: '13:00 - 15:00', 
    organ: '小肠', 
    description: '小肠消化吸收功能增强，但人体能量略有下降，适合短暂休息或处理简单工作',
    activities: '消化休息，处理日常事务，短暂午休',
    tips: '可进行15-30分钟午休，提高下午工作效率'
  },
  { 
    timeRange: '15:00 - 17:00', 
    organ: '膀胱', 
    description: '膀胱经气血充盈，排泄功能增强，身体能量逐渐恢复，适合学习和工作',
    activities: '补充水分，集中处理工作，学习',
    tips: '注意多喝水，促进新陈代谢和毒素排出'
  },
  { 
    timeRange: '17:00 - 19:00', 
    organ: '肾脏', 
    description: '肾经气血旺盛，负责储存营养和生成骨髓，适合晚餐和放松活动',
    activities: '晚餐，家庭活动，轻度运动',
    tips: '晚餐宜清淡，避免过度劳累消耗肾精'
  },
  { 
    timeRange: '19:00 - 21:00', 
    organ: '心包', 
    description: '心包经活跃，保护心脏功能，适合轻松阅读、自我关爱和亲密关系活动',
    activities: '阅读，放松活动，与家人共处',
    tips: '避免剧烈运动和情绪波动，保持心情愉悦'
  },
  { 
    timeRange: '21:00 - 23:00', 
    organ: '三焦', 
    description: '三焦经调节内分泌和代谢平衡，身体开始准备休息，适合放松和准备睡眠',
    activities: '热水沐浴，冥想，准备睡眠',
    tips: '避免使用电子设备，减少蓝光刺激，促进褪黑素分泌'
  },
  { 
    timeRange: '23:00 - 1:00', 
    organ: '胆囊', 
    description: '胆经活跃，胆汁分泌增加，身体进入深度修复阶段，细胞再生和血液生成',
    activities: '深度睡眠，身体修复',
    tips: '这段时间应保持深度睡眠，是美容养颜的黄金时段'
  },
  { 
    timeRange: '1:00 - 3:00', 
    organ: '肝脏', 
    description: '肝经最活跃，进行排毒和血液净化，是身体自我修复的关键时段',
    activities: '深度睡眠，肝脏排毒',
    tips: '避免熬夜，这段时间保持睡眠对肝脏健康至关重要'
  },
  { 
    timeRange: '3:00 - 5:00', 
    organ: '肺', 
    description: '肺经气血旺盛，进行气体交换和排毒，是做梦和记忆整合的重要时段',
    activities: '深度睡眠，肺部排毒，记忆整合',
    tips: '保持室内空气流通，有助于提高睡眠质量和肺部健康'
  }
];

// 生物节律科学依据信息
export const biorhythmScienceInfo = {
  title: '生物节律科学依据',
  description: [
    '生物节律理论基于人体内在的周期性变化规律，包括体力（23天）、情绪（28天）和智力（33天）三个维度。这些周期从出生开始计算，通过正弦曲线模型预测人体状态变化。',
    '研究表明，了解自己的生物节律可以帮助更好地安排生活和工作，在最佳状态时发挥最大潜能，在低谷期适当调整活动强度。'
  ],
  disclaimer: '注意：本工具仅供参考，不应作为医疗或重要决策的唯一依据。'
};