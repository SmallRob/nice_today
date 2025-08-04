import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fetchDressInfoRange, fetchSpecificDateDressInfo, formatDateString } from '../services/apiService';

const DressInfo = ({ apiBaseUrl }) => {
  const [dressInfoList, setDressInfoList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDressInfo, setSelectedDressInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  useEffect(() => {
    const loadDressInfoRange = async () => {
      if (!apiBaseUrl) {
        setError("API基础URL未设置，无法获取穿衣信息");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const result = await fetchDressInfoRange(apiBaseUrl);
      
      if (result.success) {
        setDressInfoList(result.dressInfoList);
        setDateRange(result.dateRange);
        
        // 默认选择今天的数据
        const today = new Date().toISOString().split('T')[0];
        const todayInfo = result.dressInfoList.find(info => info.date === today);
        setSelectedDressInfo(todayInfo || result.dressInfoList[0]);
        setError(null);
      } else {
        setError(result.error);
      }
      
      setLoading(false);
    };

    if (apiBaseUrl) {
      loadDressInfoRange();
    }
  }, [apiBaseUrl]);

  // 处理日期选择
  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // 在已加载的数据中查找选中日期的信息
    const dateStr = formatDateString(date);
    const dateInfo = dressInfoList.find(info => info.date === dateStr);
    
    if (dateInfo) {
      setSelectedDressInfo(dateInfo);
    } else {
      // 如果在已加载数据中找不到，则请求特定日期的数据
      loadSpecificDateInfo(dateStr);
    }
  };

  // 获取特定日期的穿衣信息
  const loadSpecificDateInfo = async (dateStr) => {
    if (!apiBaseUrl) return;
    
    setLoading(true);
    const result = await fetchSpecificDateDressInfo(apiBaseUrl, dateStr);
    
    if (result.success) {
      // 更新选中的穿衣信息
      setSelectedDressInfo(result.dressInfo);
      
      // 将新获取的信息添加到列表中
      setDressInfoList(prevList => {
        // 检查是否已存在该日期的信息
        const exists = prevList.some(info => info.date === dateStr);
        if (exists) {
          // 如果存在，则替换
          return prevList.map(info => info.date === dateStr ? result.dressInfo : info);
        } else {
          // 如果不存在，则添加
          return [...prevList, result.dressInfo];
        }
      });
      
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // 日期格式化函数
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 获取日期标签类名
  const getDateTabClass = (dateStr) => {
    const isSelected = selectedDressInfo && selectedDressInfo.date === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    
    let className = "flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 py-2 ";
    
    if (isSelected) {
      className += "bg-blue-500 text-white font-medium ";
    } else if (isToday) {
      className += "bg-yellow-100 text-blue-700 border-b-2 border-blue-500 ";
    } else {
      className += "hover:bg-gray-100 ";
    }
    
    return className;
  };

  if (loading && !selectedDressInfo) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (error && !selectedDressInfo) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8 text-red-500">{error}</div>
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-yellow-700">
            提示：请确保后端服务已启动，并且已实现穿衣与饮食建议API。
          </p>
        </div>
      </div>
    );
  }

  if (!selectedDressInfo) {
    return <div className="text-center py-8">暂无穿衣信息</div>;
  }

  // 获取吉祥颜色系统
  const luckyColorSystems = selectedDressInfo.color_suggestions.filter(cs => cs.吉凶 === "吉");
  const unluckyColorSystems = selectedDressInfo.color_suggestions.filter(cs => cs.吉凶 === "不吉");

  return (
    <div className="space-y-6">
      {/* 页面标题和说明 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">五行穿衣与饮食指南</h2>
        <p className="text-purple-100">
          根据传统五行理论，为您提供每日的穿衣配色和饮食建议，助您趋吉避凶，身心和谐
        </p>
      </div>

      {/* 五行知识卡片 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          五行基础知识
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">木</div>
            <p className="text-sm font-medium">木行</p>
            <p className="text-xs text-gray-600">生长、向上</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">火</div>
            <p className="text-sm font-medium">火行</p>
            <p className="text-xs text-gray-600">温热、向上</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">土</div>
            <p className="text-sm font-medium">土行</p>
            <p className="text-xs text-gray-600">承载、中和</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">金</div>
            <p className="text-sm font-medium">金行</p>
            <p className="text-xs text-gray-600">收敛、肃杀</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">水</div>
            <p className="text-sm font-medium">水行</p>
            <p className="text-xs text-gray-600">滋润、向下</p>
          </div>
        </div>
      </div>

      {/* 日期选择区域 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-medium flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              选择查询日期
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              点击日期标签快速切换，或使用日期选择器查看特定日期的建议
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">选择日期:</span>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              minDate={dateRange.start}
              maxDate={dateRange.end}
            />
          </div>
        </div>
        
        {/* 日期快速选择标签 - 默认显示8天 */}
        <div className="flex border rounded-lg overflow-hidden shadow-sm">
          {dressInfoList.slice(0, 8).map((info, index) => (
            <div
              key={index}
              className={getDateTabClass(info.date)}
              onClick={() => handleDateChange(new Date(info.date))}
              style={{ width: `${100 / dressInfoList.length}%` }}
            >
              <div className="text-xs opacity-75">{info.weekday.replace('星期', '')}</div>
              <div className="font-medium">{formatDate(info.date)}</div>
              {new Date().toISOString().split('T')[0] === info.date && (
                <div className="flex items-center justify-center mt-1">
                  <span className="inline-block w-2 h-2 bg-current rounded-full"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 当日五行信息 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            {selectedDressInfo.date} {selectedDressInfo.weekday}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">当日主导五行:</span>
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-md">
              {selectedDressInfo.daily_element}
            </span>
          </div>
        </div>
        
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
          <p className="text-purple-800 text-sm leading-relaxed">
            <strong>五行穿衣原理：</strong>根据当日的五行属性，选择相生相助的颜色可以增强运势，
            避免相克相冲的颜色可以减少不利影响。合理的色彩搭配不仅美观，更能调和身心能量。
          </p>
        </div>
      </div>

      {/* 吉祥颜色详细指南 */}
      {luckyColorSystems.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-green-600">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            今日吉祥颜色搭配
          </h3>
          
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>穿衣建议：</strong>优先选择以下颜色作为主色调，可以作为外套、上衣或配饰的颜色。
              多种吉祥色可以搭配使用，但建议以一种为主，其他为辅，避免色彩过于繁杂。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {luckyColorSystems.map((colorSystem, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-4 flex-shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800">{colorSystem.颜色系统}</h4>
                    <p className="text-sm text-green-600">推荐指数: ★★★★★</p>
                  </div>
                </div>
                <div className="ml-14">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">具体颜色：</p>
                    <div className="flex flex-wrap gap-2">
                      {colorSystem.具体颜色.map((color, colorIndex) => (
                        <span key={colorIndex} className="px-3 py-1 bg-white border border-green-300 rounded-full text-sm text-green-700">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{colorSystem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 不宜颜色警示 */}
      {unluckyColorSystems.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-red-600">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            今日不宜颜色
          </h3>
          
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>注意事项：</strong>以下颜色在今日可能与您的气场相冲，建议避免作为主色调使用。
              如必须使用，可以小面积点缀，或搭配吉祥色来化解不利影响。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {unluckyColorSystems.map((colorSystem, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 mr-4 flex-shrink-0 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-red-800">{colorSystem.颜色系统}</h4>
                    <p className="text-sm text-red-600">建议避免使用</p>
                  </div>
                </div>
                <div className="ml-14">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">具体颜色：</p>
                    <div className="flex flex-wrap gap-2">
                      {colorSystem.具体颜色.map((color, colorIndex) => (
                        <span key={colorIndex} className="px-3 py-1 bg-white border border-red-300 rounded-full text-sm text-red-700">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{colorSystem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 饮食养生指南 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          今日饮食养生指南
        </h3>
        
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800 text-sm leading-relaxed">
            <strong>饮食养生原理：</strong>根据五行相生相克的原理，选择与当日五行相配的食物，
            可以调和体内气血，增强身体抵抗力。同时避免相克食物，减少身体负担。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 宜食推荐 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 mr-3 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-800">推荐食物</h4>
                <p className="text-sm text-green-600">有助于增强运势和健康</p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedDressInfo.food_suggestions.宜.map((food, index) => (
                <div key={index} className="flex items-center p-2 bg-white rounded border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span className="text-gray-800">{food}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-xs text-green-700">
                💡 建议：可以将这些食物作为今日饮食的主要选择，有助于调和体内五行平衡
              </p>
            </div>
          </div>

          {/* 忌食提醒 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 mr-3 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-800">不宜食物</h4>
                <p className="text-sm text-red-600">今日应当适量避免</p>
              </div>
            </div>
            <div className="space-y-2">
              {selectedDressInfo.food_suggestions.忌.map((food, index) => (
                <div key={index} className="flex items-center p-2 bg-white rounded border border-red-200">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>
                  <span className="text-gray-800">{food}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="text-xs text-red-700">
                ⚠️ 提醒：并非完全禁止，而是建议适量减少，如需食用可搭配推荐食物来平衡
              </p>
            </div>
          </div>
        </div>

        {/* 饮食小贴士 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            饮食养生小贴士
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 饮食宜清淡，避免过于油腻和辛辣</li>
            <li>• 用餐时保持心情愉悦，有助于消化吸收</li>
            <li>• 可根据个人体质适当调整，不必严格按照建议执行</li>
            <li>• 搭配适量运动，促进新陈代谢和气血循环</li>
          </ul>
        </div>
      </div>

      {/* 温馨提示 */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          温馨提示
        </h4>
        <div className="text-yellow-100 text-sm leading-relaxed">
          <p className="mb-2">
            五行穿衣和饮食建议仅供参考，主要目的是帮助您在日常生活中保持身心和谐。
            请根据个人实际情况、身体状况和喜好进行适当调整。
          </p>
          <p>
            最重要的是保持积极乐观的心态，合理搭配衣着，均衡营养饮食，这样才能真正达到养生保健的效果。
          </p>
        </div>
      </div>
    </div>
  );
};

export default DressInfo;