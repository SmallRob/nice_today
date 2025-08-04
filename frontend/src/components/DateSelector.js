import React from 'react';

// 简单的7天日期选择器组件
const DateSelector = ({ mayaInfoList, selectedMayaInfo, onDateChange, formatDate }) => {
  // 获取要显示的7天日期
  const getDisplayDates = () => {
    if (!mayaInfoList || mayaInfoList.length === 0) {
      return [];
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayIndex = mayaInfoList.findIndex(info => info.date === todayStr);

    // 如果找不到今天，返回前7天
    if (todayIndex === -1) {
      return mayaInfoList.slice(0, 7);
    }

    // 以今天为中心，显示7天
    const startIndex = Math.max(0, todayIndex - 3);
    const endIndex = Math.min(mayaInfoList.length, startIndex + 7);
    let displayDates = mayaInfoList.slice(startIndex, endIndex);

    // 如果不足7天，从前面补充
    if (displayDates.length < 7 && startIndex > 0) {
      const remainingDays = 7 - displayDates.length;
      const additionalStartIndex = Math.max(0, startIndex - remainingDays);
      const additionalDates = mayaInfoList.slice(additionalStartIndex, startIndex);
      displayDates = [...additionalDates, ...displayDates];
    }

    // 确保最多只有7天
    return displayDates.slice(0, 7);
  };

  const displayDates = getDisplayDates();

  if (displayDates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        暂无日期数据
      </div>
    );
  }

  // 获取日期标签的样式类
  const getDateTabClass = (dateStr) => {
    const isSelected = selectedMayaInfo && selectedMayaInfo.date === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    
    let className = "flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 py-2 px-1 ";
    
    if (isSelected) {
      className += "bg-blue-500 text-white font-medium ";
    } else if (isToday) {
      className += "bg-yellow-100 text-blue-700 border-b-2 border-blue-500 ";
    } else {
      className += "hover:bg-gray-100 ";
    }
    
    return className;
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 divide-x divide-gray-200">
        {displayDates.map((info, index) => (
          <div
            key={index}
            className={getDateTabClass(info.date)}
            onClick={() => onDateChange(new Date(info.date))}
            style={{ minHeight: '70px' }}
          >
            <div className="text-xs text-center mb-1">
              {info.weekday.replace('星期', '')}
            </div>
            <div className="text-center font-medium text-sm">
              {formatDate(info.date)}
            </div>
            {new Date().toISOString().split('T')[0] === info.date && (
              <div className="flex justify-center mt-1">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DateSelector; 