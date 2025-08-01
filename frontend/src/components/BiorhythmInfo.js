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

// 节律颜色类
const getRhythmColorClass = (type) => {
  switch (type) {
    case 'physical':
      return 'bg-physical';
    case 'emotional':
      return 'bg-emotional';
    case 'intellectual':
      return 'bg-intellectual';
    default:
      return 'bg-gray-500';
  }
};

const BiorhythmInfo = ({ data, title }) => {
  if (!data) {
    return <div className="text-center py-4">没有可用的节律数据</div>;
  }

  const rhythmTypes = [
    { key: 'physical', name: '体力', value: data.physical },
    { key: 'emotional', name: '情绪', value: data.emotional },
    { key: 'intellectual', name: '智力', value: data.intellectual }
  ];

  return (
    <div>
      <div className="space-y-4">
        {rhythmTypes.map((rhythm) => (
          <div key={rhythm.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">{rhythm.name}节律</h3>
              <span className="text-lg font-bold">{rhythm.value}</span>
            </div>
            
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-1/2 h-full ${getRhythmColorClass(rhythm.key)}`} 
                style={{ 
                  width: `${Math.abs(rhythm.value)}%`, 
                  transform: rhythm.value >= 0 ? 'translateX(0)' : 'translateX(-100%)'
                }}
              ></div>
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400"></div>
            </div>
            
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
            
            <p className="mt-3 text-sm">
              {title}的{rhythm.name}节律状态: 
              <span className="font-medium ml-1">
                {getRhythmStatus(rhythm.value)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BiorhythmInfo;