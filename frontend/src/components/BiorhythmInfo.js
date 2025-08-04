import React from 'react';

// 节律状态评估函数
const getRhythmStatus = (value) => {
  const absValue = Math.abs(value);
  
  if (absValue >= 90) {
    return value > 0 ? '极佳' : '极差';
  } else if (absValue >= 70) {
    return value > 0 ? '很好' : '很差';
  } else if (absValue >= 50) {
    return value > 0 ? '良好' : '较差';
  } else if (absValue >= 30) {
    return value > 0 ? '一般' : '一般偏低';
  } else {
    return '平稳期';
  }
};

// 节律颜色类 - 增强视觉效果
const getRhythmColorClass = (type) => {
  switch (type) {
    case 'physical':
      return 'bg-gradient-to-r from-red-400 to-red-600';
    case 'emotional':
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    case 'intellectual':
      return 'bg-gradient-to-r from-purple-400 to-purple-600';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

// 获取节律状态的颜色
const getStatusColorClass = (value) => {
  const absValue = Math.abs(value);
  
  if (absValue >= 90) {
    return value > 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
  } else if (absValue >= 70) {
    return value > 0 ? 'text-green-500 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200';
  } else if (absValue >= 50) {
    return value > 0 ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-orange-600 bg-orange-50 border-orange-200';
  } else if (absValue >= 30) {
    return value > 0 ? 'text-gray-600 bg-gray-50 border-gray-200' : 'text-gray-600 bg-gray-50 border-gray-200';
  } else {
    return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// 获取节律图标
const getRhythmIcon = (type) => {
  switch (type) {
    case 'physical':
      return (
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white mr-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'emotional':
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'intellectual':
      return (
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white mr-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white mr-3">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      );
  }
};



const BiorhythmInfo = ({ data, title }) => {
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

  const rhythmTypes = [
    { key: 'physical', name: '体力', value: data.physical },
    { key: 'emotional', name: '情绪', value: data.emotional },
    { key: 'intellectual', name: '智力', value: data.intellectual }
  ];

  return (
    <div>
      {/* 生物节律知识卡片 - 只在今日栏目显示 */}
      {title === "今日" && (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-4 mb-6 text-white">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold">生物节律智慧</h3>
          </div>
          <p className="text-white text-opacity-90 text-sm leading-relaxed">
            生物节律是人体内在的周期性变化规律，包括体力（23天）、情绪（28天）和智力（33天）三个维度。了解自己的生物节律，可以帮助我们更好地安排生活和工作，在最佳状态时发挥最大潜能。
          </p>
          <p className="text-white text-opacity-75 text-xs mt-2">
            注意：本工具仅供参考，不应作为医疗或重要决策的唯一依据。
          </p>
        </div>
      )}

      <div className="space-y-4">
        {rhythmTypes.map((rhythm) => (
          <div key={rhythm.key} className="bg-white shadow rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getRhythmIcon(rhythm.key)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{rhythm.name}节律</h3>
                  <p className="text-sm text-gray-500">周期变化规律</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-800">{rhythm.value}</span>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(rhythm.value)}`}>
                  {getRhythmStatus(rhythm.value)}
                </div>
              </div>
            </div>
            
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`absolute top-0 left-1/2 h-full ${getRhythmColorClass(rhythm.key)} shadow-sm`} 
                style={{ 
                  width: `${Math.abs(rhythm.value)}%`, 
                  transform: rhythm.value >= 0 ? 'translateX(0)' : 'translateX(-100%)'
                }}
              ></div>
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400"></div>
            </div>
            
            <div className="mt-3 flex justify-between text-sm text-gray-500">
              <span className="font-medium">-100</span>
              <span className="font-medium">0</span>
              <span className="font-medium">+100</span>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{title}</span>的{rhythm.name}节律当前处于
                <span className={`font-semibold ml-1 ${getStatusColorClass(rhythm.value).split(' ')[0]}`}>
                  {getRhythmStatus(rhythm.value)}
                </span>
                状态，建议根据节律特点合理安排相关活动。
              </p>
            </div>
          </div>
        ))}
      </div>
      

    </div>
    
  );
};

export default BiorhythmInfo;
