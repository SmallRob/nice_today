import React, { useState, useEffect } from 'react';
import { rhythmStatusConfig, rhythmTypeConfig } from '../config/biorhythmConfig';

// 生成基于节律值的每日建议
const generateDailySuggestions = (rhythmData, birthDate) => {
  if (!rhythmData) return [];

  // 获取各节律状态
  const physicalStatus = getRhythmStatus(rhythmData.physical);
  const emotionalStatus = getRhythmStatus(rhythmData.emotional);
  const intellectualStatus = getRhythmStatus(rhythmData.intellectual);

  // 根据不同节律状态生成建议池
  const physicalSuggestions = getPhysicalSuggestions(rhythmData.physical, physicalStatus);
  const emotionalSuggestions = getEmotionalSuggestions(rhythmData.emotional, emotionalStatus);
  const intellectualSuggestions = getIntellectualSuggestions(rhythmData.intellectual, intellectualStatus);

  // 从各类型建议中随机选择一个，确保多样性
  const selectedPhysical = physicalSuggestions[Math.floor(Math.random() * physicalSuggestions.length)];
  const selectedEmotional = emotionalSuggestions[Math.floor(Math.random() * emotionalSuggestions.length)];
  const selectedIntellectual = intellectualSuggestions[Math.floor(Math.random() * intellectualSuggestions.length)];

  return [selectedPhysical, selectedEmotional, selectedIntellectual];
};

// 获取节律状态
const getRhythmStatus = (value) => {
  const absValue = Math.abs(value);
  
  for (const key in rhythmStatusConfig) {
    const config = rhythmStatusConfig[key];
    if (absValue >= config.threshold) {
      if (value >= 0 && key.includes('Positive')) {
        return config.status;
      } else if (value < 0 && key.includes('Negative')) {
        return config.status;
      }
    }
  }
  
  return rhythmStatusConfig.neutral.status;
};

// 体力节律建议
const getPhysicalSuggestions = (value, status) => {
  if (value >= 70) {
    return [
      { 
        icon: '💪', 
        title: '高效体能训练', 
        description: '今日体力处于高峰期，适合进行高强度运动或体能训练，挑战个人极限，提升身体素质。',
        energyLevel: '高',
        category: '体力'
      },
      { 
        icon: '🏃', 
        title: '户外有氧运动', 
        description: '体力充沛，适合户外跑步、骑行或团队运动，充分释放身体能量，提升心肺功能。',
        energyLevel: '高',
        category: '体力'
      },
      { 
        icon: '🚴', 
        title: '挑战新运动', 
        description: '尝试新的运动项目或技能，今日身体协调性和反应速度佳，学习新动作效果更好。',
        energyLevel: '高',
        category: '体力'
      }
    ];
  } else if (value >= 30) {
    return [
      { 
        icon: '🚶', 
        title: '适度运动活动', 
        description: '体力状态良好，适合进行中等强度的运动，如快走、瑜伽或太极，保持身体活力。',
        energyLevel: '中',
        category: '体力'
      },
      { 
        icon: '🏊', 
        title: '水中健身', 
        description: '水中运动对关节压力小，同时能全面锻炼肌肉，适合当前体力状态，提升身体柔韧性。',
        energyLevel: '中',
        category: '体力'
      },
      { 
        icon: '🧘', 
        title: '身心平衡练习', 
        description: '进行瑜伽或普拉提练习，既能锻炼身体又能放松心灵，平衡当前体力状态。',
        energyLevel: '中',
        category: '体力'
      }
    ];
  } else if (value >= -30) {
    return [
      { 
        icon: '🚶‍♂️', 
        title: '轻度日常活动', 
        description: '体力处于平稳期，适合日常活动，如散步、做家务或轻松伸展，保持身体基本活动量。',
        energyLevel: '平稳',
        category: '体力'
      },
      { 
        icon: '🌿', 
        title: '自然疗愈', 
        description: '到公园或自然环境中进行轻度活动，呼吸新鲜空气，帮助恢复身体能量。',
        energyLevel: '平稳',
        category: '体力'
      },
      { 
        icon: '☕', 
        title: '能量补给活动', 
        description: '进行轻松的社交活动或喝杯温茶，温和地恢复体力，为明天储备能量。',
        energyLevel: '平稳',
        category: '体力'
      }
    ];
  } else {
    return [
      { 
        icon: '🛌', 
        title: '休息与恢复', 
        description: '体力处于低谷期，今天应以休息为主，保证充足睡眠，让身体充分恢复和修复。',
        energyLevel: '低',
        category: '体力'
      },
      { 
        icon: '🌙', 
        title: '温和放松活动', 
        description: '进行冥想、深呼吸或轻度伸展，帮助身体放松，避免过度消耗体力。',
        energyLevel: '低',
        category: '体力'
      },
      { 
        icon: '🍲', 
        title: '营养补充计划', 
        description: '注重营养摄入，选择易消化且能量丰富的食物，为身体提供必要的修复原料。',
        energyLevel: '低',
        category: '体力'
      }
    ];
  }
};

// 情绪节律建议
const getEmotionalSuggestions = (value, status) => {
  if (value >= 70) {
    return [
      { 
        icon: '🎉', 
        title: '社交互动时光', 
        description: '情绪积极高涨，适合与朋友聚会、参加社交活动，分享正能量，增强人际关系。',
        energyLevel: '高',
        category: '情绪'
      },
      { 
        icon: '🎨', 
        title: '创意表达活动', 
        description: '情绪丰富且积极，是进行艺术创作、写作或音乐表达的好时机，展现内心感受。',
        energyLevel: '高',
        category: '情绪'
      },
      { 
        icon: '💬', 
        title: '深度情感交流', 
        description: '与亲密的人进行深入对话，分享感受和想法，增进情感联系和理解。',
        energyLevel: '高',
        category: '情绪'
      }
    ];
  } else if (value >= 30) {
    return [
      { 
        icon: '📚', 
        title: '情感成长阅读', 
        description: '情绪状态良好，适合阅读心理学、自我成长类书籍，提升情商和自我认知。',
        energyLevel: '中',
        category: '情绪'
      },
      { 
        icon: '🌈', 
        title: '感受美好事物', 
        description: '主动寻找和欣赏生活中的美好事物，如听音乐、看画展，培养积极情绪。',
        energyLevel: '中',
        category: '情绪'
      },
      { 
        icon: '🤝', 
        title: '中等社交活动', 
        description: '参加小型聚会或与亲近朋友交流，满足社交需求又不至于情绪过度消耗。',
        energyLevel: '中',
        category: '情绪'
      }
    ];
  } else if (value >= -30) {
    return [
      { 
        icon: '☕', 
        title: '安静独处时光', 
        description: '情绪平稳期，适合独处、喝茶或进行轻度反思，享受内心的宁静与平衡。',
        energyLevel: '平稳',
        category: '情绪'
      },
      { 
        icon: '📝', 
        title: '情绪记录日记', 
        description: '记录当前情绪状态和感受，增强情绪自我觉察能力，了解自己的情绪模式。',
        energyLevel: '平稳',
        category: '情绪'
      },
      { 
        icon: '🎵', 
        title: '舒缓音乐疗愈', 
        description: '聆听轻柔舒缓的音乐，帮助平衡情绪，放松身心，获得内心平静。',
        energyLevel: '平稳',
        category: '情绪'
      }
    ];
  } else {
    return [
      { 
        icon: '🛡️', 
        title: '情绪保护机制', 
        description: '情绪处于低谷期，今天应避免高强度社交和冲突情境，给自己创造一个安全的情感空间。',
        energyLevel: '低',
        category: '情绪'
      },
      { 
        icon: '🧘‍♀️', 
        title: '冥想正念练习', 
        description: '进行冥想或正念练习，观察自己的情绪而不被其控制，培养情绪调节能力。',
        energyLevel: '低',
        category: '情绪'
      },
      { 
        icon: '🌱', 
        title: '温柔自我关怀', 
        description: '给自己一些特别的关怀，如泡个热水澡、看慰藉性电影，温柔对待自己的情绪。',
        energyLevel: '低',
        category: '情绪'
      }
    ];
  }
};

// 智力节律建议
const getIntellectualSuggestions = (value, status) => {
  if (value >= 70) {
    return [
      { 
        icon: '🧠', 
        title: '深度学习挑战', 
        description: '智力处于高峰期，适合学习新知识或解决复杂问题，挑战自我认知边界，提升思维能力。',
        energyLevel: '高',
        category: '智力'
      },
      { 
        icon: '💡', 
        title: '创意头脑风暴', 
        description: '思维敏捷，适合进行创意思考和头脑风暴，解决工作中的难题或产生新想法。',
        energyLevel: '高',
        category: '智力'
      },
      { 
        icon: '🔬', 
        title: '研究探索活动', 
        description: '对感兴趣的领域进行深入研究，分析复杂问题，今日思维清晰，容易获得新见解。',
        energyLevel: '高',
        category: '智力'
      }
    ];
  } else if (value >= 30) {
    return [
      { 
        icon: '📖', 
        title: '知识积累阅读', 
        description: '智力状态良好，适合阅读学习，吸收新知识，进行思维训练，提升认知能力。',
        energyLevel: '中',
        category: '智力'
      },
      { 
        icon: '🎯', 
        title: '规划整理任务', 
        description: '整理思路和计划，制定目标和策略，当前思维状态适合进行系统性思考和组织。',
        energyLevel: '中',
        category: '智力'
      },
      { 
        icon: '🗺️', 
        title: '思维导图构建', 
        description: '创建思维导图整理复杂信息，建立知识体系，加深理解和记忆。',
        energyLevel: '中',
        category: '智力'
      }
    ];
  } else if (value >= -30) {
    return [
      { 
        icon: '📝', 
        title: '轻量级学习', 
        description: '智力平稳期，适合进行轻松的学习活动，如看纪录片、听播客，不增加认知负担。',
        energyLevel: '平稳',
        category: '智力'
      },
      { 
        icon: '🔄', 
        title: '知识复习巩固', 
        description: '复习已学知识，巩固基础，不必学习全新内容，让大脑有充足时间消化吸收。',
        energyLevel: '平稳',
        category: '智力'
      },
      { 
        icon: '🌳', 
        title: '散步思考', 
        description: '进行轻度散步，让大脑在放松状态下整理思绪，往往能获得新灵感和洞察。',
        energyLevel: '平稳',
        category: '智力'
      }
    ];
  } else {
    return [
      { 
        icon: '🔋', 
        title: '大脑休息充电', 
        description: '智力处于低谷期，今天应减少高认知负荷活动，给大脑充分休息和恢复的时间。',
        energyLevel: '低',
        category: '智力'
      },
      { 
        icon: '🎮', 
        title: '轻松娱乐活动', 
        description: '参与轻松的娱乐活动，如简单的游戏或看轻松视频，让大脑在不费力的状态下运转。',
        energyLevel: '低',
        category: '智力'
      },
      { 
        icon: '🧩', 
        title: '简单重复性任务', 
        description: '处理简单的重复性工作，如整理文件或手工制作，减少决策负担，让大脑轻松运转。',
        energyLevel: '低',
        category: '智力'
      }
    ];
  }
};

// 根据能量等级获取颜色类
const getEnergyColorClass = (energyLevel) => {
  switch (energyLevel) {
    case '高': return 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
    case '中': return 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
    case '平稳': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    case '低': return 'bg-orange-100 dark:bg-orange-900 dark:bg-opacity-30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  }
};

const DailySuggestions = ({ rhythmData, birthDate }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    if (rhythmData) {
      const newSuggestions = generateDailySuggestions(rhythmData, birthDate);
      setSuggestions(newSuggestions);
      setRefreshTime(new Date());
    }
  }, [rhythmData, birthDate]);

  const refreshSuggestions = () => {
    if (rhythmData) {
      const newSuggestions = generateDailySuggestions(rhythmData, birthDate);
      setSuggestions(newSuggestions);
      setRefreshTime(new Date());
    }
  };

  if (!rhythmData) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>请先选择出生日期以获取每日建议</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">每日综合建议</h2>
        <button
          onClick={refreshSuggestions}
          className="flex items-center px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 text-blue-800 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          换一批
        </button>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
        <p className="text-sm">
          <span className="font-semibold">基于今日节律：</span>
          体力{getRhythmStatus(rhythmData.physical)}({rhythmData.physical})、
          情绪{getRhythmStatus(rhythmData.emotional)}({rhythmData.emotional})、
          智力{getRhythmStatus(rhythmData.intellectual)}({rhythmData.intellectual})
        </p>
        <p className="text-xs mt-1 text-indigo-100">
          生成时间: {refreshTime.toLocaleTimeString()}
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mr-4">
                {suggestion.icon}
              </div>
              <div className="flex-grow">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                    {suggestion.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getEnergyColorClass(suggestion.energyLevel)}`}>
                    {suggestion.category} · 能量: {suggestion.energyLevel}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {suggestion.description}
                </p>
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id={`todo-${index}`}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) {
                        // 可以添加完成待办事项的逻辑
                        console.log(`已完成待办: ${suggestion.title}`);
                      }
                    }}
                  />
                  <label
                    htmlFor={`todo-${index}`}
                    className="ml-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                  >
                    标记为已完成
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 能量使用指引</h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>• <span className="font-medium">高能量期</span>：适合挑战性任务、重要决策和新技能学习</p>
          <p>• <span className="font-medium">中能量期</span>：适合日常工作、技能练习和社交活动</p>
          <p>• <span className="font-medium">平稳期</span>：适合整理计划、轻松学习和轻度活动</p>
          <p>• <span className="font-medium">低能量期</span>：适合休息恢复、简单任务和自我关怀</p>
        </div>
      </div>
    </div>
  );
};

export default DailySuggestions;