import React from 'react';

// 简单的7天日期选择器 - 使用按钮组形式
const SimpleDateSelector = ({ mayaInfoList, selectedMayaInfo, onDateChange, formatDate }) => {
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

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {displayDates.map((info, index) => {
        const isSelected = selectedMayaInfo && selectedMayaInfo.date === info.date;
        const isToday = new Date().toISOString().split('T')[0] === info.date;
        
        let buttonClass = "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ";
        
        if (isSelected) {
          buttonClass += "bg-blue-500 text-white shadow-md ";
        } else if (isToday) {
          buttonClass += "bg-yellow-100 text-blue-700 border-2 border-blue-500 ";
        } else {
          buttonClass += "bg-gray-100 text-gray-700 hover:bg-gray-200 ";
        }

        return (
          <button
            key={index}
            className={buttonClass}
            onClick={() => onDateChange(new Date(info.date))}
          >
            <div className="text-xs">{info.weekday.replace('星期', '')}</div>
            <div className="font-bold">{formatDate(info.date)}</div>
            {isToday && (
              <div className="flex justify-center mt-1">
                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SimpleDateSelector; 