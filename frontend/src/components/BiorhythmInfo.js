import React from 'react';
import { 
  rhythmStatusConfig, 
  rhythmTypeConfig, 
  predictionTipConfig, 
  organRhythmData, 
  biorhythmScienceInfo 
} from '../config/biorhythmConfig';

// 节律状态评估函数
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

// 节律颜色类 - 增强视觉效果
const getRhythmColorClass = (type) => {
  return rhythmTypeConfig[type]?.colorClass || 'bg-gradient-to-r from-gray-400 to-gray-600';
};

// 获取节律状态的颜色
const getStatusColorClass = (value) => {
  const absValue = Math.abs(value);
  
  for (const key in rhythmStatusConfig) {
    const config = rhythmStatusConfig[key];
    if (absValue >= config.threshold) {
      if (value >= 0 && key.includes('Positive')) {
        return config.colorClass;
      } else if (value < 0 && key.includes('Negative')) {
        return config.colorClass;
      }
    }
  }
  
  return rhythmStatusConfig.neutral.colorClass;
};

// 获取节律图标
const getRhythmIcon = (type) => {
  const config = rhythmTypeConfig[type] || rhythmTypeConfig.combined;
  
  return (
    <div className={`w-8 h-8 ${config.iconBgColor} rounded-full flex items-center justify-center text-white mr-3`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={config.iconPath} clipRule="evenodd" />
      </svg>
    </div>
  );
};

// 获取预测提示信息
const getPredictionTip = (type, value, title) => {
  if (title === "7天后") {
    const typeConfig = predictionTipConfig[type] || predictionTipConfig.combined;
    
    for (const key in typeConfig) {
      const config = typeConfig[key];
      if (value > config.threshold) {
        return config.tip;
      }
    }
    
    return typeConfig.lowPeak.tip;
  } else {
    const typeName = rhythmTypeConfig[type]?.name || '综合';
    return `${typeName}节律处于${getRhythmStatus(value)}状态`;
  }
};

// 计算生物节律值的核心函数
const calculateRhythmValue = (cycle, daysSinceBirth) => {
  return Math.round(100 * Math.sin(2 * Math.PI * daysSinceBirth / cycle));
};

// 计算指定日期的生物节律
const calculateBiorhythmForDate = (birthDate, targetDate) => {
  // 使用UTC时间避免时区问题
  const birth = new Date(Date.UTC(
    parseInt(birthDate.split('-')[0]),
    parseInt(birthDate.split('-')[1]) - 1,
    parseInt(birthDate.split('-')[2])
  ));
  
  const target = new Date(Date.UTC(
    parseInt(targetDate.split('-')[0]),
    parseInt(targetDate.split('-')[1]) - 1,
    parseInt(targetDate.split('-')[2])
  ));
  
  // 使用更精确的天数计算方法
  const diffTime = target.getTime() - birth.getTime();
  const daysSinceBirth = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    physical: calculateRhythmValue(23, daysSinceBirth),
    emotional: calculateRhythmValue(28, daysSinceBirth),
    intellectual: calculateRhythmValue(33, daysSinceBirth)
  };
};

// 找到指定月份的节律高低点
const findMonthlyHighLowPoints = (birthDate, year, month) => {
  // 使用UTC时间计算月份天数
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  let highPoint = { date: null, value: -101, physical: -101, emotional: -101, intellectual: -101 };
  let lowPoint = { date: null, value: 101, physical: 101, emotional: 101, intellectual: 101 };
  
  // 遍历该月每一天
  for (let day = 1; day <= daysInMonth; day++) {
    // 使用UTC时间格式
    const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const rhythm = calculateBiorhythmForDate(birthDate, currentDateStr);
    
    // 计算综合节律值（加权平均）
    const combinedValue = Math.round(
      (rhythm.physical * 0.33 + rhythm.emotional * 0.33 + rhythm.intellectual * 0.34)
    );
    
    // 更新高点
    if (combinedValue > highPoint.value) {
      highPoint = {
        date: currentDateStr,
        value: combinedValue,
        physical: rhythm.physical,
        emotional: rhythm.emotional,
        intellectual: rhythm.intellectual
      };
    }
    
    // 更新低点
    if (combinedValue < lowPoint.value) {
      lowPoint = {
        date: currentDateStr,
        value: combinedValue,
        physical: rhythm.physical,
        emotional: rhythm.emotional,
        intellectual: rhythm.intellectual
      };
    }
  }
  
  return { highPoint, lowPoint };
};

// 生成基于真实出生日期的当月节律高低点数据
const generateMonthlyHighLowData = (birthDate) => {
  if (!birthDate) {
    // 如果没有出生日期，返回空数据
    return [];
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const monthlyData = [];
  
  // 为每个月计算真实的节律高低点
  for (let month = 0; month < 12; month++) {
    const monthName = `${month + 1}月`;
    const { highPoint, lowPoint } = findMonthlyHighLowPoints(birthDate, currentYear, month);
    
    monthlyData.push({
      month: monthName,
      highDate: highPoint.date || '',
      highValue: highPoint.value,
      physicalHigh: highPoint.physical,
      emotionalHigh: highPoint.emotional,
      intellectualHigh: highPoint.intellectual,
      lowDate: lowPoint.date || '',
      lowValue: lowPoint.value,
      physicalLow: lowPoint.physical,
      emotionalLow: lowPoint.emotional,
      intellectualLow: lowPoint.intellectual
    });
  }
  
  return monthlyData;
};

const BiorhythmInfo = ({ data, title, birthDate }) => {
  if (!data) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          没有可用的节律数据
        </div>
      </div>
    );
  }

  // 计算综合累积值
  const calculateCombinedValue = () => {
    // 给不同节律分配权重
    const weights = {
      physical: 0.33,
      emotional: 0.33,
      intellectual: 0.34
    };
    
    // 计算加权平均值
    const combinedValue = (
      data.physical * weights.physical + 
      data.emotional * weights.emotional + 
      data.intellectual * weights.intellectual
    ).toFixed(1);
    
    return parseFloat(combinedValue);
  };

  const rhythmTypes = [
    { key: 'physical', name: '体力', value: data.physical },
    { key: 'emotional', name: '情绪', value: data.emotional },
    { key: 'intellectual', name: '智力', value: data.intellectual }
  ];

  // 添加综合累积值
  const combinedValue = calculateCombinedValue();
  const rhythmTypesWithCombined = [
    ...rhythmTypes,
    { key: 'combined', name: '综合', value: combinedValue }
  ];

  // 生成基于真实出生日期的当月节律高低点数据
  const monthlyHighLowData = generateMonthlyHighLowData(birthDate);

  // 显示生物节律科学依据卡片
  const renderScienceCard = () => (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-4 mb-6 text-white">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold">{biorhythmScienceInfo.title}</h3>
      </div>
      {biorhythmScienceInfo.description.map((paragraph, index) => (
        <p key={index} className={`text-white text-opacity-90 text-sm leading-relaxed ${index > 0 ? 'mt-2' : ''}`}>
          {paragraph}
        </p>
      ))}
      <p className="text-white text-opacity-75 text-xs mt-2">
        {biorhythmScienceInfo.disclaimer}
      </p>
    </div>
  );

  // 渲染当月节律高低点表格
  const renderMonthlyHighLowTable = () => {
    if (!birthDate || monthlyHighLowData.length === 0) {
      return (
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">每月节律高低点</h3>
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            请先输入出生日期以查看准确的节律高低点数据
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">每月节律高低点</h3>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">基于出生日期：</span>{birthDate} 
            <span className="ml-2 text-blue-600">| 计算依据：体力(23天)、情绪(28天)、智力(33天)周期</span>
          </p>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">月份</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">最高点日期</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">最高点值</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">体力</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">情绪</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">智力</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">最低点日期</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">最低点值</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">体力</th>
              <th className="py-3 px-4 border-b border-r border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">情绪</th>
              <th className="py-3 px-4 border-b border-blue-400 text-left text-xs font-semibold uppercase tracking-wider">智力</th>
            </tr>
          </thead>
          <tbody>
            {monthlyHighLowData.map((item, index) => (
              <tr key={index} 
                  className={index % 2 === 0 
                    ? 'bg-blue-50 hover:bg-blue-100 transition-colors duration-150' 
                    : 'bg-white hover:bg-gray-50 transition-colors duration-150'}>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-gray-900">{item.month}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-yellow-600">{item.highDate}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-green-600">{item.highValue}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm text-gray-900">{item.physicalHigh}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm text-gray-900">{item.emotionalHigh}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm text-gray-900">{item.intellectualHigh}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-yellow-600">{item.lowDate}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-red-600">{item.lowValue}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm text-gray-900">{item.physicalLow}</td>
                <td className="py-3 px-4 border-b border-r border-gray-200 text-sm text-gray-900">{item.emotionalLow}</td>
                <td className="py-3 px-4 border-b border-gray-200 text-sm text-gray-900">{item.intellectualLow}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    );
  };

  // 渲染24小时人体器官节律表格
  const render24HourOrganRhythm = () => (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">24小时人体器官节律</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden table-fixed">
          <thead>
            <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <th className="py-3 px-2 border-b border-r border-green-400 text-center text-xs font-semibold uppercase tracking-wider w-[10%]">时间段</th>
              <th className="py-3 px-2 border-b border-r border-green-400 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">部位</th>
              <th className="py-3 px-2 border-b border-r border-green-400 text-center text-xs font-semibold uppercase tracking-wider w-[32%]">说明</th>
              <th className="py-3 px-2 border-b border-r border-green-400 text-center text-xs font-semibold uppercase tracking-wider w-[25%]">建议活动</th>
              <th className="py-3 px-2 border-b border-green-400 text-center text-xs font-semibold uppercase tracking-wider w-[25%]">健康提示</th>
            </tr>
          </thead>
          <tbody>
            {organRhythmData.map((item, index) => (
              <tr key={index} 
                  className={index % 2 === 0 
                    ? 'bg-green-50 hover:bg-green-100 transition-colors duration-150' 
                    : 'bg-white hover:bg-gray-50 transition-colors duration-150'}>
                <td className="py-2 px-2 border-b border-r border-gray-200 text-sm font-medium text-gray-900 text-center whitespace-nowrap">{item.timeRange}</td>
                <td className="py-2 px-2 border-b border-r border-gray-200 text-sm font-bold text-blue-600 text-center whitespace-nowrap">{item.organ}</td>
                <td className="py-2 px-2 border-b border-r border-gray-200 text-sm text-gray-800 truncate" title={item.description}>
                  <div className="max-h-12 overflow-hidden">{item.description}</div>
                </td>
                <td className="py-2 px-2 border-b border-r border-gray-200 text-sm text-gray-800 truncate" title={item.activities}>
                  <div className="max-h-12 overflow-hidden">{item.activities}</div>
                </td>
                <td className="py-2 px-2 border-b border-gray-200 text-sm text-gray-800 truncate" title={item.tips}>
                  <div className="max-h-12 overflow-hidden">{item.tips}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 添加移动端优化视图 */}
      <div className="md:hidden mt-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">器官节律详情</h4>
        {organRhythmData.map((item, index) => (
          <div key={index} className="mb-4 p-3 bg-white rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold bg-green-100 text-green-800 px-2 py-1 rounded">{item.timeRange}</span>
              <span className="text-sm font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.organ}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2"><span className="font-medium">说明：</span>{item.description}</p>
            <p className="text-sm text-gray-700 mb-2"><span className="font-medium">建议活动：</span>{item.activities}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">健康提示：</span>{item.tips}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染节律信息卡片（优化手机屏幕显示）
  const renderRhythmCards = (rhythmData) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {rhythmData.map((rhythm) => (
        <div key={rhythm.key} className="bg-white shadow rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-6 h-6 ${
                rhythm.key === 'physical' ? 'bg-red-500' : 
                rhythm.key === 'emotional' ? 'bg-blue-500' : 
                rhythm.key === 'intellectual' ? 'bg-purple-500' : 
                'bg-yellow-500'
              } rounded-full flex items-center justify-center text-white mr-2`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  {rhythm.key === 'physical' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  ) : rhythm.key === 'emotional' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  ) : rhythm.key === 'intellectual' ? (
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800">{rhythm.name}</h3>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-800 mr-2">{rhythm.value}</span>
              <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColorClass(rhythm.value)}`}>
                {getRhythmStatus(rhythm.value)}
              </div>
            </div>
          </div>
          
          <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`absolute top-0 left-1/2 h-full ${getRhythmColorClass(rhythm.key)} shadow-sm`} 
              style={{ 
                width: `${Math.abs(rhythm.value)}%`, 
                transform: rhythm.value >= 0 ? 'translateX(0)' : 'translateX(-100%)'
              }}
            ></div>
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400"></div>
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span className="font-medium">-100</span>
            <span className="font-medium">0</span>
            <span className="font-medium">+100</span>
          </div>
          
          <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${rhythm.value > 0 ? 'bg-green-500' : rhythm.value < 0 ? 'bg-red-500' : 'bg-gray-500'}`}></div>
              <p className="text-xs text-gray-700 font-medium">
                {getPredictionTip(rhythm.key, rhythm.value, title)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染综合累积值卡片
  const renderCombinedCard = () => (
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 mb-6 text-white">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">综合节律状态</h3>
      </div>
      <p className="text-white text-opacity-90 text-sm leading-relaxed">
        综合节律值为 <span className="font-bold text-xl">{combinedValue}</span>，状态：<span className="font-bold">{getRhythmStatus(combinedValue)}</span>
      </p>
      <p className="text-white text-opacity-90 text-sm leading-relaxed mt-2">
        {getPredictionTip('combined', combinedValue, title)}
      </p>
    </div>
  );

  return (
    <div>
      {/* 根据不同情况显示不同内容 */}
      {title === "今日" ? (
        // 今日标签只显示科学依据卡片，不再显示节律信息
        renderScienceCard()
      ) : title === "7天后" ? (
        // 7天后标签显示综合累积值、节律详细信息、当月节律高低点和24小时人体器官节律
        <div>
          {/* 显示综合累积值卡片 */}
          {renderCombinedCard()}
          
          {/* 使用优化后的节律卡片布局，包含综合累积值 */}
          {renderRhythmCards(rhythmTypesWithCombined)}
          
          {/* 当月节律高低点表格 */}
          {renderMonthlyHighLowTable()}
          
          {/* 24小时人体器官节律表格 */}
          {render24HourOrganRhythm()}
        </div>
      ) : null}
    </div>
  );
};

export default BiorhythmInfo;
