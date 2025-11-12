import React, { useState } from 'react';
import MayaCalendar from './MayaCalendar_old';

const MayaCalendarTest = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:5201');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Maya日历日期选择测试</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">API基础URL：</label>
          <input 
            type="text" 
            value={apiBaseUrl} 
            onChange={(e) => setApiBaseUrl(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="http://localhost:5201"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">测试说明</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. <strong>DatePicker测试</strong>：点击日期选择器，应该可以选择任意日期，不受限制</p>
            <p>2. <strong>快速选择标签测试</strong>：应该固定显示7天，点击可以切换日期</p>
            <p>3. <strong>今日按钮测试</strong>：点击"今日"按钮应该回到今天</p>
            <p>4. <strong>历史记录测试</strong>：选择不同日期后，应该出现在历史记录中</p>
            <p>5. <strong>API调用测试</strong>：选择不在7天范围内的日期时，应该调用API获取数据</p>
          </div>
        </div>

        <div className="mt-6">
          <MayaCalendar apiBaseUrl={apiBaseUrl} />
        </div>
      </div>
    </div>
  );
};

export default MayaCalendarTest; 