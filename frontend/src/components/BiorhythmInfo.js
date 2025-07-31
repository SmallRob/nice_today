import React from 'react';

// 节律状态评估函数
const getRhythmStatus = (value) => {
  const absValue = Math.abs(value);
  
  if (absValue >= 90) {
    return {
      status: value > 0 ? '极佳' : '极差',
      level: value > 0 ? 5 : 1,
      description: value > 0 ? '状态极佳，是发挥潜能的最佳时期' : '状态极差，需要特别注意休息调养'
    };
  } else if (absValue >= 70) {
    return {
      status: value > 0 ? '很好' : '很差',
      level: value > 0 ? 4 : 2,
      description: value > 0 ? '状态很好，适合挑战和突破' : '状态较差，建议减少负荷'
    };
  } else if (absValue >= 50) {
    return {
      status: value > 0 ? '良好' : '较差',
      level: value > 0 ? 4 : 2,
      description: value > 0 ? '状态良好，可以正常活动' : '状态偏低，注意调节'
    };
  } else if (absValue >= 30) {
    return {
      status: value > 0 ? '一般' : '一般偏低',
      level: 3,
      description: value > 0 ? '状态一般，保持平常心' : '状态略低，适度调整'
    };
  } else {
    return {
      status: '平稳期',
      level: 3,
      description: '处于平稳过渡期，是调整和准备的好时机'
    };
  }
};

// 节律颜色类
const getRhythmColorClass = (type, isPositive) => {
  const baseColors = {
    physical: isPositive ? 'from-red-400 to-red-600' : 'from-red-200 to-red-400',
    emotional: isPositive ? 'from-blue-400 to-blue-600' : 'from-blue-200 to-blue-400',
    intellectual: isPositive ? 'from-green-400 to-green-600' : 'from-green-200 to-green-400'
  };
  return `bg-gradient-to-r ${baseColors[type] || 'from-gray-400 to-gray-600'}`;
};

// 获取节律建议
const getRhythmAdvice = (type, value, status) => {
  const advice = {
    physical: {
      high: {
        activities: ['进行高强度运动', '挑战体能极限', '参与竞技活动', '进行体力劳动'],
        tips: ['把握机会进行体能训练', '适合进行户外运动', '可以尝试新的运动项目', '注意适度，避免过度疲劳']
      },
      medium: {
        activities: ['适度运动', '日常锻炼', '散步慢跑', '瑜伽伸展'],
        tips: ['保持规律的运动习惯', '注意劳逸结合', '选择适合的运动强度', '关注身体信号']
      },
      low: {
        activities: ['轻度活动', '休息调养', '温和伸展', '充足睡眠'],
        tips: ['优先保证充足睡眠', '避免高强度活动', '注重营养补充', '可以进行按摩放松']
      }
    },
    emotional: {
      high: {
        activities: ['社交聚会', '创意表达', '情感交流', '艺术创作'],
        tips: ['是处理人际关系的好时机', '适合表达情感和想法', '可以尝试新的社交活动', '保持积极乐观的心态']
      },
      medium: {
        activities: ['日常交流', '情绪调节', '轻松娱乐', '平和相处'],
        tips: ['保持情绪稳定', '适度参与社交活动', '注意情绪管理', '寻找内心平衡']
      },
      low: {
        activities: ['独处思考', '情绪疏导', '寻求支持', '冥想放松'],
        tips: ['避免重大情感决定', '寻求朋友或专业支持', '进行情绪疏导', '给自己更多耐心']
      }
    },
    intellectual: {
      high: {
        activities: ['学习新知识', '解决复杂问题', '创新思考', '重要决策'],
        tips: ['是学习和思考的黄金时期', '适合处理复杂事务', '可以进行创新性工作', '把握机会提升自己']
      },
      medium: {
        activities: ['日常工作', '常规学习', '逻辑思考', '计划制定'],
        tips: ['保持正常的工作学习节奏', '注意思维的清晰度', '适度挑战智力', '保持学习兴趣']
      },
      low: {
        activities: ['简单任务', '复习巩固', '休息大脑', '轻松阅读'],
        tips: ['避免复杂的思维任务', '多进行复习和巩固', '给大脑充分休息', '可以进行轻松的阅读']
      }
    }
  };

  const level = status.level >= 4 ? 'high' : status.level <= 2 ? 'low' : 'medium';
  return advice[type][level];
};

// 获取星级评分
const getStarRating = (level) => {
  return '★'.repeat(level) + '☆'.repeat(5 - level);
};

const BiorhythmInfo = ({ data, title }) => {
  if (!data) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>暂无可用的节律数据</p>
          <p className="text-sm mt-2">请确保已输入出生日期并获取数据</p>
        </div>
      </div>
    );
  }

  const rhythmTypes = [
    { 
      key: 'physical', 
      name: '体力节律', 
      value: data.physical,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
        </svg>
      ),
      color: 'red',
      description: '反映身体的体能状态、耐力和活力水平'
    },
    { 
      key: 'emotional', 
      name: '情绪节律', 
      value: data.emotional,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      color: 'blue',
      description: '影响心情、情感表达和人际关系的和谐度'
    },
    { 
      key: 'intellectual', 
      name: '智力节律', 
      value: data.intellectual,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      color: 'green',
      description: '决定思维敏捷度、学习能力和决策判断力'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和说明 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">人体生物节律分析</h2>
        <p className="text-indigo-100">
          基于科学的生物节律理论，为您分析当前的体力、情绪和智力状态，助您合理安排生活节奏
        </p>
      </div>

      {/* 当前状态总览 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
          {title || '当前'}节律状态总览
        </h3>

        <div className="space-y-8">
          {rhythmTypes.map((rhythm) => {
            const status = getRhythmStatus(rhythm.value);
            const advice = getRhythmAdvice(rhythm.key, rhythm.value, status);
            
            return (
              <div key={rhythm.key} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* 节律标题和基本信息 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-${rhythm.color}-400 to-${rhythm.color}-600 mr-4 flex items-center justify-center text-white shadow-lg`}>
                      {rhythm.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{rhythm.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rhythm.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        周期：{rhythm.key === 'physical' ? '23天' : rhythm.key === 'emotional' ? '28天' : '33天'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{rhythm.value}</div>
                    <div className="text-lg font-medium text-gray-700">{status.status}</div>
                    <div className="text-yellow-500 text-sm">{getStarRating(status.level)}</div>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-6">
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-1/2 h-full ${getRhythmColorClass(rhythm.key, rhythm.value >= 0)} shadow-inner transition-all duration-300`}
                      style={{ 
                        width: `${Math.abs(rhythm.value)}%`, 
                        transform: rhythm.value >= 0 ? 'translateX(0)' : 'translateX(-100%)'
                      }}
                    ></div>
                    <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">{Math.abs(rhythm.value)}%</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>低潮期 -100</span>
                    <span>平衡点 0</span>
                    <span>高潮期 +100</span>
                  </div>
                </div>

                {/* 状态描述 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>当前状态：</strong>{status.description}
                  </p>
                </div>

                {/* 建议内容 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 推荐活动 */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h5 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      推荐活动
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {advice.activities.map((activity, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 贴心提示 */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      贴心提示
                    </h5>
                    <ul className="space-y-2">
                      {advice.tips.map((tip, index) => (
                        <li key={index} className="text-xs text-blue-700 flex items-start leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 综合建议 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          个性化生活建议
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 最佳时机 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              当前最佳时机
            </h4>
            <div className="space-y-2">
              {rhythmTypes
                .filter(r => r.value > 50)
                .map(r => (
                  <div key={r.key} className="flex items-center p-2 bg-white rounded border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span className="text-sm text-gray-800">
                      {r.name}状态良好，适合相关活动
                    </span>
                  </div>
                ))}
              {rhythmTypes.filter(r => r.value > 50).length === 0 && (
                <p className="text-sm text-green-700">当前处于调整期，建议保持平常心态</p>
              )}
            </div>
          </div>

          {/* 注意事项 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              需要注意的方面
            </h4>
            <div className="space-y-2">
              {rhythmTypes
                .filter(r => r.value < -30)
                .map(r => (
                  <div key={r.key} className="flex items-center p-2 bg-white rounded border border-yellow-200">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                    <span className="text-sm text-gray-800">
                      {r.name}处于低潮期，需要特别关注
                    </span>
                  </div>
                ))}
              {rhythmTypes.filter(r => r.value < -30).length === 0 && (
                <p className="text-sm text-yellow-700">目前各项节律相对稳定，继续保持</p>
              )}
            </div>
          </div>
        </div>

        {/* 生活节奏建议 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            生活节奏调节建议
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 根据节律高低合理安排重要活动和休息时间</li>
            <li>• 在节律低潮期避免做重大决定或承担过重任务</li>
            <li>• 保持规律的作息时间，有助于节律的自然调节</li>
            <li>• 适当的运动和放松可以帮助平衡各项节律</li>
            <li>• 关注身体信号，及时调整生活和工作安排</li>
          </ul>
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          温馨提示
        </h4>
        <div className="text-pink-100 text-sm leading-relaxed">
          <p className="mb-2">
            生物节律分析仅供参考，旨在帮助您更好地了解自己的生理和心理状态规律。
            每个人的实际情况可能因个体差异、环境因素等而有所不同。
          </p>
          <p>
            最重要的是倾听自己身体和内心的声音，结合节律分析合理安排生活，
            保持积极健康的生活方式，这样才能真正实现身心和谐发展。
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiorhythmInfo;
