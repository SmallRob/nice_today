import React, { useState } from 'react';
import SimpleDateSelector from './SimpleDateSelector';
import DateSelector from './DateSelector';

// 测试用的模拟数据
const mockMayaInfoList = [
  { date: '2024-01-01', weekday: '星期一' },
  { date: '2024-01-02', weekday: '星期二' },
  { date: '2024-01-03', weekday: '星期三' },
  { date: '2024-01-04', weekday: '星期四' },
  { date: '2024-01-05', weekday: '星期五' },
  { date: '2024-01-06', weekday: '星期六' },
  { date: '2024-01-07', weekday: '星期日' },
  { date: '2024-01-08', weekday: '星期一' },
  { date: '2024-01-09', weekday: '星期二' },
  { date: '2024-01-10', weekday: '星期三' },
];

const DateSelectorTest = () => {
  const [selectedMayaInfo, setSelectedMayaInfo] = useState(mockMayaInfoList[0]);
  const [selectedType, setSelectedType] = useState('simple');

  const handleDateChange = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const info = mockMayaInfoList.find(item => item.date === dateStr);
    if (info) {
      setSelectedMayaInfo(info);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">日期选择器测试</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">选择器类型：</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="simple">SimpleDateSelector (按钮组)</option>
            <option value="grid">DateSelector (网格布局)</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">当前选中：{selectedMayaInfo?.date}</h2>
          
          {selectedType === 'simple' ? (
            <SimpleDateSelector 
              mayaInfoList={mockMayaInfoList}
              selectedMayaInfo={selectedMayaInfo}
              onDateChange={handleDateChange}
              formatDate={formatDate}
            />
          ) : (
            <DateSelector 
              mayaInfoList={mockMayaInfoList}
              selectedMayaInfo={selectedMayaInfo}
              onDateChange={handleDateChange}
              formatDate={formatDate}
            />
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">调试信息</h2>
          <div className="text-sm">
            <p>总数据量：{mockMayaInfoList.length}天</p>
            <p>当前选中：{selectedMayaInfo?.date}</p>
            <p>选择器类型：{selectedType}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateSelectorTest; 