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

// 24小时人体器官节律数据现在存储在 public/data/organRhythmData.csv 文件中
// 通过 dataService.js 中的 fetchOrganRhythmData 函数加载

// 生物节律科学依据信息
export const biorhythmScienceInfo = {
  title: '生物节律科学依据',
  description: [
    '生物节律理论基于人体内在的周期性变化规律，包括体力（23天）、情绪（28天）和智力（33天）三个维度。这些周期从出生开始计算，通过正弦曲线模型预测人体状态变化。',
    '研究表明，了解自己的生物节律可以帮助更好地安排生活和工作，在最佳状态时发挥最大潜能，在低谷期适当调整活动强度。'
  ],
  disclaimer: '注意：本工具仅供参考，不应作为医疗或重要决策的唯一依据。'
};