import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fetchMayaCalendarRange, fetchSpecificDateMayaInfo, formatDateString } from '../services/apiService';


// 玛雅日历工具类 - 集中管理所有辅助功能
class MayaCalendarUtils {
  // 能量提示生成器
  static getTip(score) {
    let tip = '';
    let bgColor = 'bg-blue-50';
    let textColor = 'text-blue-700';
    let borderColor = 'border-blue-100';
    let level = '';
    let suggestion = '';
    
    if (score >= 80) {
      tip = "今日能量充沛，是行动的好时机！保持积极心态，勇敢追求目标。";
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-100';
      level = '高';
      suggestion = '适合开展重要活动、做决策、开启新项目';
    } else if (score >= 60) {
      tip = "今日能量中等，适合稳步推进计划。注意调节身心平衡，避免过度劳累。";
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-100';
      level = '中';
      suggestion = '适合日常工作、学习、社交活动';
    } else {
      tip = "今日能量偏低，建议放慢节奏，多休息调整。适合内省和规划，避免重大决策。";
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-100';
      level = '低';
      suggestion = '适合休息、冥想、规划、内省活动';
    }
    
    return {
      tip,
      bgColor,
      textColor,
      borderColor,
      level,
      suggestion
    };
  }

  // 幸运颜色提示生成器
  static getColorTip(color) {
    // 防止color为undefined的情况
    if (!color) {
      return {
        tip: "今日没有特定的幸运颜色，可以选择您喜欢的任何颜色。",
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-100',
        colorHex: '#CCCCCC',
        symbolism: '个人偏好'
      };
    }
    
    let symbolism = '';
    let bgColor = 'bg-blue-50';
    let textColor = 'text-blue-700';
    let borderColor = 'border-blue-100';
    let colorHex = '#CCCCCC';
    
    if (color.includes('红')) {
      symbolism = '热情与活力';
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
      borderColor = 'border-red-100';
      colorHex = '#FF5252';
    } else if (color.includes('蓝')) {
      symbolism = '平静与智慧';
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-100';
      colorHex = '#4299E1';
    } else if (color.includes('绿')) {
      symbolism = '成长与和谐';
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-100';
      colorHex = '#48BB78';
    } else if (color.includes('黄')) {
      symbolism = '光明与希望';
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-100';
      colorHex = '#ECC94B';
    } else if (color.includes('紫')) {
      symbolism = '神秘与创造';
      bgColor = 'bg-purple-50';
      textColor = 'text-purple-700';
      borderColor = 'border-purple-100';
      colorHex = '#9F7AEA';
    } else if (color.includes('白')) {
      symbolism = '纯净与清新';
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-700';
      borderColor = 'border-gray-100';
      colorHex = '#FFFFFF';
    } else if (color.includes('黑')) {
      symbolism = '力量与深度';
      bgColor = 'bg-gray-700';
      textColor = 'text-gray-100';
      borderColor = 'border-gray-600';
      colorHex = '#2D3748';
    } else {
      symbolism = '独特的能量';
      bgColor = 'bg-indigo-50';
      textColor = 'text-indigo-700';
      borderColor = 'border-indigo-100';
      colorHex = '#667EEA';
    }
    
    return {
      tip: `${color}象征着${symbolism}，今日穿戴此色系的衣物或配饰，能够增强您的个人磁场，吸引正能量与好运。`,
      bgColor,
      textColor,
      borderColor,
      colorHex,
      symbolism
    };
  }
  
  // 幸运数字提示生成器
  static getNumberTip(number) {
    // 防止number为undefined的情况
    if (!number) {
      return {
        tip: "今日没有特定的幸运数字，可以选择您直觉中的数字。",
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-100',
        emoji: '🔢',
        meaning: '个人直觉',
        usage: '选择时间、座位号、楼层等'
      };
    }
    
    let meaning = '';
    let bgColor = 'bg-indigo-50';
    let textColor = 'text-indigo-700';
    let borderColor = 'border-indigo-100';
    let emoji = '🔢';
    let usage = '选择时间、座位号、楼层等';
    
    switch (number) {
      case '1': 
        meaning = '代表新的开始与领导力，适合开启新项目。'; 
        bgColor = 'bg-red-50';
        textColor = 'text-red-700';
        borderColor = 'border-red-100';
        emoji = '1️⃣';
        break;
      case '2': 
        meaning = '象征平衡与合作，适合团队协作与沟通。'; 
        bgColor = 'bg-orange-50';
        textColor = 'text-orange-700';
        borderColor = 'border-orange-100';
        emoji = '2️⃣';
        break;
      case '3': 
        meaning = '代表创意与表达，适合艺术创作与社交活动。'; 
        bgColor = 'bg-yellow-50';
        textColor = 'text-yellow-700';
        borderColor = 'border-yellow-100';
        emoji = '3️⃣';
        break;
      case '4': 
        meaning = '象征稳定与秩序，适合规划与执行长期计划。'; 
        bgColor = 'bg-green-50';
        textColor = 'text-green-700';
        borderColor = 'border-green-100';
        emoji = '4️⃣';
        break;
      case '5': 
        meaning = '代表变化与自由，适合尝试新事物与冒险。'; 
        bgColor = 'bg-teal-50';
        textColor = 'text-teal-700';
        borderColor = 'border-teal-100';
        emoji = '5️⃣';
        break;
      case '6': 
        meaning = '象征爱与责任，适合关注家庭与人际关系。'; 
        bgColor = 'bg-blue-50';
        textColor = 'text-blue-700';
        borderColor = 'border-blue-100';
        emoji = '6️⃣';
        break;
      case '7': 
        meaning = '代表智慧与内省，适合学习思考与精神成长。'; 
        bgColor = 'bg-indigo-50';
        textColor = 'text-indigo-700';
        borderColor = 'border-indigo-100';
        emoji = '7️⃣';
        break;
      case '8': 
        meaning = '象征财富与成功，适合商业决策与财务规划。'; 
        bgColor = 'bg-purple-50';
        textColor = 'text-purple-700';
        borderColor = 'border-purple-100';
        emoji = '8️⃣';
        break;
      case '9': 
        meaning = '代表完成与慈悲，适合慈善与帮助他人。'; 
        bgColor = 'bg-pink-50';
        textColor = 'text-pink-700';
        borderColor = 'border-pink-100';
        emoji = '9️⃣';
        break;
      default: 
        meaning = '将为您带来意想不到的惊喜与机遇。';
        emoji = '🔟';
    }
    
    return {
      tip: `数字${number}蕴含着特殊的宇宙频率，今日在重要决策、时间安排或选择时参考此数字，${meaning}`,
      bgColor,
      textColor,
      borderColor,
      emoji,
      meaning,
      usage
    };
  }
  
  // 幸运食物提示生成器
  static getFoodTip(food) {
    // 防止food为undefined的情况
    if (!food) {
      return {
        tip: "今日没有特定的幸运食物，可以选择您喜欢的健康食品。",
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-100',
        emoji: '🍽️',
        nutrition: '均衡营养'
      };
    }
    
    let benefit = '';
    let bgColor = 'bg-green-50';
    let textColor = 'text-green-700';
    let borderColor = 'border-green-100';
    let emoji = '🍽️';
    let nutrition = '均衡营养';
    
    if (food.includes('果')) {
      benefit = '水果的清新能量将为您带来活力与好心情。';
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-100';
      emoji = '🍎';
      nutrition = '维生素C、膳食纤维';
    } else if (food.includes('茶')) {
      benefit = '茶的清香能够净化心灵，提升专注力。';
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-100';
      emoji = '🍵';
      nutrition = '抗氧化物、茶多酚';
    } else if (food.includes('豆')) {
      benefit = '豆类的丰富营养将为您提供持久的能量支持。';
      bgColor = 'bg-amber-50';
      textColor = 'text-amber-700';
      borderColor = 'border-amber-100';
      emoji = '🫘';
      nutrition = '植物蛋白、膳食纤维';
    } else if (food.includes('鱼')) {
      benefit = '鱼肉的优质蛋白有助于大脑思考与决策。';
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-100';
      emoji = '🐟';
      nutrition = 'omega-3脂肪酸、优质蛋白';
    } else if (food.includes('米')) {
      benefit = '谷物的稳定能量让您保持平和与稳重。';
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-700';
      borderColor = 'border-orange-100';
      emoji = '🍚';
      nutrition = '碳水化合物、B族维生素';
    } else {
      benefit = '其独特的能量属性将为您带来意想不到的好运。';
      emoji = '🍲';
    }
    
    return {
      tip: `${food}富含特殊的能量营养，今日食用此食物不仅能够滋养身体，更能激活您的幸运磁场。建议在重要场合前享用，能够提升您的运势与表现。${benefit}`,
      bgColor,
      textColor,
      borderColor,
      emoji,
      nutrition
    };
  }

  // 日期格式化函数
  static formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  // 获取日期标签类名
  static getDateTabClass(dateStr, selectedMayaInfo) {
    const isSelected = selectedMayaInfo && selectedMayaInfo.date === dateStr;
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
  }
  
  // 安全获取对象属性
  static safeGet(obj, path, defaultValue = []) {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result === undefined || result === null ? defaultValue : result;
  }
  

}

const MayaCalendar = ({ apiBaseUrl }) => {
  const [mayaInfoList, setMayaInfoList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMayaInfo, setSelectedMayaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [historyDates, setHistoryDates] = useState([]);

  useEffect(() => {
    const loadMayaCalendarRange = async () => {
      if (!apiBaseUrl) {
        setError("API基础URL未设置，无法获取玛雅日历信息");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const result = await fetchMayaCalendarRange(apiBaseUrl);
      
      if (result.success) {
        console.log(`API返回的玛雅日历数据: ${result.mayaInfoList.length}天`);
        console.log('日期列表:', result.mayaInfoList.map(info => info.date));
        setMayaInfoList(result.mayaInfoList);
        setDateRange(result.dateRange);
        
        // 默认选择今天的数据
        const today = new Date().toISOString().split('T')[0];
        const todayInfo = result.mayaInfoList.find(info => info.date === today);
        setSelectedMayaInfo(todayInfo || result.mayaInfoList[0]);
        setError(null);
        
        // 加载历史记录
        loadHistoryDates();
      } else {
        setError(result.error);
      }
      
      setLoading(false);
    };

    if (apiBaseUrl) {
      loadMayaCalendarRange();
    }
  }, [apiBaseUrl]);
  
  // 加载历史记录
  const loadHistoryDates = () => {
    try {
      const mayaHistoryStr = localStorage.getItem('mayaCalendarHistory');
      if (mayaHistoryStr) {
        const history = JSON.parse(mayaHistoryStr);
        if (Array.isArray(history) && history.length > 0) {
          setHistoryDates(history);
        }
      }
    } catch (error) {
      console.error("获取玛雅日历历史记录失败:", error);
    }
  };

  // 处理日期选择
  const handleDateChange = (date) => {
    console.log('用户选择了日期:', date);
    setSelectedDate(date);
    
    // 在已加载的数据中查找选中日期的信息
    const dateStr = formatDateString(date);
    console.log('格式化后的日期字符串:', dateStr);
    selectDateByString(dateStr);
  };

  // 处理历史记录点击 - 不改变日期选择栏状态
  const handleHistoryClick = (dateStr) => {
    selectDateByString(dateStr);
  };
  
  // 根据日期字符串选择日期信息
  const selectDateByString = (dateStr) => {
    console.log('正在查找日期信息:', dateStr);
    console.log('当前可用的日期列表:', mayaInfoList.map(info => info.date));
    
    // 在已加载的数据中查找选中日期的信息
    const dateInfo = mayaInfoList.find(info => info.date === dateStr);
    
    if (dateInfo) {
      console.log('在本地数据中找到日期信息');
      setSelectedMayaInfo(dateInfo);
      updateHistory(dateStr);
    } else {
      console.log('本地数据中未找到，将请求API获取');
      // 如果在已加载数据中找不到，则请求特定日期的数据
      // 但不再添加到日历选择栏中，保持固定显示天数
      loadSpecificDateInfo(dateStr);
    }
  };
  
  // 更新历史记录
  const updateHistory = (dateStr) => {
    try {
      // 创建历史记录副本
      let history = [...historyDates];
      
      // 如果历史记录中已存在该日期，则将其移到最前面
      const index = history.indexOf(dateStr);
      if (index !== -1) {
        history.splice(index, 1);
      }
      
      // 将新日期添加到历史记录的最前面
      history.unshift(dateStr);
      
      // 只保留最近的6条记录
      const maxHistoryLength = 6;
      if (history.length > maxHistoryLength) {
        history = history.slice(0, maxHistoryLength);
      }
      
      // 更新状态和localStorage
      setHistoryDates(history);
      localStorage.setItem('mayaCalendarHistory', JSON.stringify(history));
    } catch (error) {
      console.error("保存玛雅日历历史记录失败:", error);
    }
  };

  // 获取特定日期的玛雅日历信息
  const loadSpecificDateInfo = async (dateStr) => {
    if (!apiBaseUrl) return;
    
    setLoading(true);
    try {
      const result = await fetchSpecificDateMayaInfo(apiBaseUrl, dateStr);
      
      if (result.success) {
        // 更新选中的玛雅日历信息
        setSelectedMayaInfo(result.mayaInfo);
        
        // 不再将新获取的信息添加到列表中，保持日历选择栏显示固定天数
        // 仅更新历史记录
        updateHistory(dateStr);
        
        setError(null);
      } else {
        setError(result.error || "获取日期信息失败");
      }
    } catch (error) {
      console.error("加载特定日期玛雅信息失败:", error);
      setError("获取日期信息时发生错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  // 日期格式化函数
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 使用MayaCalendarUtils类的方法
  const getDateTabClass = (dateStr) => {
    return MayaCalendarUtils.getDateTabClass(dateStr, selectedMayaInfo);
  };

  if (loading && !selectedMayaInfo) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (error && !selectedMayaInfo) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8 text-red-500">{error}</div>
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-yellow-700">
            提示：请确保后端服务已启动，并且已实现玛雅日历API。
          </p>
        </div>
      </div>
    );
  }

  if (!selectedMayaInfo) {
    return <div className="text-center py-8">暂无玛雅日历信息</div>;
  }

  // 确保lucky_items存在，如果不存在则提供默认值
  const luckyItems = selectedMayaInfo.lucky_items || {};
  // 确保suggestions存在，如果不存在则提供默认值
  const suggestions = selectedMayaInfo.suggestions || { 建议: [], 避免: [] };
  // 确保energy_scores存在，如果不存在则提供默认值
  const energyScores = selectedMayaInfo.energy_scores || { 综合: 70 };
  // 确保daily_guidance存在，如果不存在则提供默认值
  const dailyGuidance = selectedMayaInfo.daily_guidance || { 
    morning: "保持平静的心态，专注于当下", 
    afternoon: "处理重要事务，保持专注", 
    evening: "放松身心，回顾今日收获" 
  };
  // 确保daily_quote存在，如果不存在则提供默认值
  const dailyQuote = selectedMayaInfo.daily_quote || { 
    content: "顺应自然，方得始终", 
    author: "古谚" 
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
        玛雅启示
      </h2> */}
      
      {/* 玛雅日历知识卡片 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-4 mb-6 text-white">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">玛雅日历智慧</h3>
        </div>
        <p className="text-white text-opacity-90 text-sm leading-relaxed">
          玛雅日历是古玛雅文明创造的精密历法系统，它不仅是时间记录工具，更是连接宇宙能量与人类意识的桥梁。
          通过玛雅日历，我们可以理解每日的宇宙能量模式，获得生活指引，与宇宙节奏同步。
        </p>
      </div>
       {/* 玛雅日历知识卡片 */}
       <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          玛雅日历基础知识
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">印</div>
            <p className="text-sm font-medium">红色印记</p>
            <p className="text-xs text-gray-600">开始、启动</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-gray-700 font-bold">风</div>
            <p className="text-sm font-medium">白色风</p>
            <p className="text-xs text-gray-600">沟通、灵感</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">夜</div>
            <p className="text-sm font-medium">蓝色夜</p>
            <p className="text-xs text-gray-600">梦想、直觉</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">种</div>
            <p className="text-sm font-medium">黄色种子</p>
            <p className="text-xs text-gray-600">觉醒、成长</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">地</div>
            <p className="text-sm font-medium">绿色地球</p>
            <p className="text-xs text-gray-600">同步、和谐</p>
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
              点击日期标签快速切换，或使用日期选择器查看特定日期的玛雅启示
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">选择日期:</span>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <button
              onClick={() => handleDateChange(new Date())}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm"
            >
              今日
            </button>
          </div>
        </div>
        
        {/* 历史记录 */}
        {historyDates.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              历史查询记录
            </h4>
            <div className="flex flex-wrap gap-2">
              {historyDates.map((dateStr, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(dateStr)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedMayaInfo && selectedMayaInfo.date === dateStr
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {dateStr}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 日期快速选择标签 - 固定显示7天 */}
        <div className="flex border rounded-lg overflow-hidden shadow-sm">
          {mayaInfoList.slice(0, 7).map((info, index) => (
            <div
              key={index}
              className={getDateTabClass(info.date)}
              onClick={() => handleDateChange(new Date(info.date))}
              style={{ width: `${100 / 7}%` }}
            >
              <div className="text-xs opacity-75">{info.weekday.replace('星期', '')}</div>
              <div className="font-medium">{MayaCalendarUtils.formatDate(info.date)}</div>
              {new Date().toISOString().split('T')[0] === info.date && (
                <div className="flex items-center justify-center mt-1">
                  <span className="inline-block w-2 h-2 bg-current rounded-full"></span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 调试信息 */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          调试信息: 总数据量 {mayaInfoList.length}天, 显示前7天
        </div>
        
        {/* 提示信息 */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          快速选择标签显示最近7天，您也可以使用上方日期选择器查看任意日期的玛雅启示
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 左侧：玛雅日历详细信息 */}
        <div>
          {/* 玛雅日历基本信息 - 增强视觉效果 */}
          <div className="mb-6 bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                {selectedMayaInfo.date} {selectedMayaInfo.weekday}
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm shadow-sm">
                {selectedMayaInfo.maya_tone}
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-24 h-24 bg-yellow-400 rounded-lg flex items-center justify-center mb-3">
                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedMayaInfo.maya_kin}</div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-center">{selectedMayaInfo.maya_seal_desc}</h2>
            </div>
            
            {/* 每日启示语 */}
            <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg">
              <p className="text-gray-800 italic text-center">"{selectedMayaInfo.daily_message}"</p>
              <p className="text-right text-sm mt-2 text-gray-600">
                —— {selectedMayaInfo.daily_quote.content} · {selectedMayaInfo.daily_quote.author}
              </p>
            </div>
          </div>
          
          {/* 建议与禁忌 - 增强视觉效果 */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white mr-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-green-700">今日宜</h4>
              </div>
              <ul className="space-y-1 ml-8">
                {suggestions.建议.map((item, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white mr-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-red-700">今日忌</h4>
              </div>
              <ul className="space-y-1 ml-8">
                {suggestions.避免.map((item, index) => (
                  <li key={index} className="text-gray-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 每日指引卡片 - 移动到左侧每日禁忌下方 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                每日指引
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">晨</span>
                    <span className="font-medium text-blue-800">早晨指引</span>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">{dailyGuidance.morning}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">午</span>
                    <span className="font-medium text-orange-800">下午指引</span>
                  </div>
                  <p className="text-sm text-orange-700 leading-relaxed">{dailyGuidance.afternoon}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">晚</span>
                    <span className="font-medium text-purple-800">夜晚指引</span>
                  </div>
                  <p className="text-sm text-purple-700 leading-relaxed">{dailyGuidance.evening}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧：能量分数和幸运物品 */}
        <div>
          {/* 能量分数 - 增强视觉效果 */}
          {(() => {
            const energyInfo = MayaCalendarUtils.getTip(energyScores.综合);
            const energyScore = energyScores.综合;
            
            // 确定能量分数的颜色
            const scoreColor = energyScore >= 80 ? '#48BB78' : 
                              energyScore >= 60 ? '#4299E1' : 
                              '#ECC94B';
                              
            return (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">今日能量分数</h3>
                <div className={`${energyInfo.bgColor} p-4 rounded-lg border ${energyInfo.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-bold ${energyInfo.textColor}`}>能量等级: <span className="text-lg">{energyInfo.level}</span></h4>
                    <div className={`px-3 py-1 bg-white rounded-full ${energyInfo.textColor} text-sm border ${energyInfo.borderColor}`}>
                      {energyScore}/100
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold" style={{ color: scoreColor }}>{energyScore}</span>
                      </div>
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={scoreColor}
                          strokeWidth="3"
                          strokeDasharray={`${energyScore}, 100`}
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* 能量分数总结提示 */}
                  <div className="mb-4 p-3 bg-white rounded-lg shadow-inner">
                    <p className={`text-sm ${energyInfo.textColor}`}>
                      {energyInfo.tip}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {energyInfo.suggestion}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(energyScores).filter(([key]) => key !== '综合').map(([key, value]) => {
                      // 为每个能量类型确定颜色
                      const itemColor = value >= 80 ? 'bg-green-600' : 
                                      value >= 60 ? 'bg-blue-600' : 
                                      value >= 40 ? 'bg-yellow-500' : 
                                      'bg-red-500';
                      
                      return (
                        <div key={key} className="text-center">
                          <div className="text-lg font-semibold">{value}</div>
                          <div className="text-xs text-gray-600">{key}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`${itemColor} h-2 rounded-full`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* 幸运物品 - 增强视觉效果 */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
              今日幸运物品
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {/* 幸运色详细解读 */}
              {(() => {
                const colorInfo = MayaCalendarUtils.getColorTip(luckyItems.幸运色);
                const colorName = luckyItems.幸运色;
                // 生成色系变体
                const colorVariants = colorName.includes('系') ? 
                  ['浅' + colorName.replace('系', ''), '中' + colorName.replace('系', ''), '深' + colorName.replace('系', '')] : 
                  [colorName + '色', colorName + '调', colorName + '韵'];
                
                return (
                  <div className={`mb-4 ${colorInfo.bgColor} p-4 rounded-lg border ${colorInfo.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-10 h-10 rounded-full mr-3 flex-shrink-0 shadow-inner" 
                        style={{ background: `linear-gradient(135deg, ${colorInfo.colorHex}, ${colorInfo.colorHex})` }}
                      ></div>
                      <h4 className={`text-lg font-bold ${colorInfo.textColor}`}>{colorName}</h4>
                    </div>
                    <div className="ml-2">
                      <div className="flex flex-wrap mb-2">
                        {colorVariants.map((variant, idx) => (
                          <span key={idx} className={`mr-2 mb-2 px-3 py-1 bg-white ${colorInfo.textColor} rounded-full text-sm border ${colorInfo.borderColor} shadow-sm`}>
                            {variant}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        于当日五行相同，吉相宜。今日若身着此类衣物配饰，有助于提升个人气场。
                      </p>
                      <p className={`text-xs ${colorInfo.textColor} mt-2 italic`}>
                        适合用于：上衣、外套、裙装、配饰
                      </p>
                    </div>
                  </div>
                );
              })()}
              
              {/* 幸运数字详细解读 */}
              {(() => {
                const numberInfo = MayaCalendarUtils.getNumberTip(luckyItems.幸运数字);
                const luckyNumber = luckyItems.幸运数字;
                
                // 生成数字相关组合
                const numberCombinations = [
                  `${luckyNumber}`,
                  `${luckyNumber}${luckyNumber}`,
                  `${luckyNumber}${luckyNumber}${luckyNumber}`
                ];
                
                return (
                  <div className={`mb-4 ${numberInfo.bgColor} p-4 rounded-lg border ${numberInfo.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                        <span className="text-2xl">{numberInfo.emoji}</span>
                      </div>
                      <h4 className={`text-lg font-bold ${numberInfo.textColor}`}>数字 {luckyNumber}</h4>
                    </div>
                    <div className="ml-2">
                      <div className="flex flex-wrap mb-2">
                        {numberCombinations.map((combo, idx) => (
                          <span key={idx} className={`mr-2 mb-2 px-3 py-1 bg-white ${numberInfo.textColor} rounded-full text-sm border ${numberInfo.borderColor} shadow-sm`}>
                            {combo}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        {numberInfo.meaning}
                      </p>
                      <p className={`text-xs ${numberInfo.textColor} mt-2 italic`}>
                        适用场景：{numberInfo.usage}
                      </p>
                    </div>
                  </div>
                );
              })()}
              
              {/* 幸运食物详细解读 */}
              {(() => {
                const foodInfo = MayaCalendarUtils.getFoodTip(luckyItems.幸运食物);
                const luckyFood = luckyItems.幸运食物;
                
                return (
                  <div className={`mb-4 ${foodInfo.bgColor} p-4 rounded-lg border ${foodInfo.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                        <span className="text-2xl">{foodInfo.emoji}</span>
                      </div>
                      <h4 className={`text-lg font-bold ${foodInfo.textColor}`}>{luckyFood}</h4>
                    </div>
                    <div className="ml-2">
                      <div className={`inline-block mb-2 px-3 py-1 bg-white ${foodInfo.textColor} rounded-full text-sm border ${foodInfo.borderColor} shadow-sm`}>
                        {foodInfo.nutrition}
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        今日食用此食物能够激活您的幸运磁场，提升运势与表现。
                      </p>
                      <p className={`text-xs ${foodInfo.textColor} mt-2 italic`}>
                        建议：早餐或午餐时食用效果最佳
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      
      {/* 玛雅启示语录 */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border-t border-purple-100">
        <h3 className="text-lg font-medium mb-4 text-center text-purple-800">玛雅启示语录</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-70 rounded-lg p-4 shadow-sm border border-purple-100">
            <p className="text-gray-700 italic">
              "时间不是线性的，而是螺旋状的。过去、现在和未来交织在一起，形成了我们生命的织锦。"
            </p>
            <p className="text-right text-sm mt-2 text-purple-600">— 玛雅智者</p>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg p-4 shadow-sm border border-purple-100">
            <p className="text-gray-700 italic">
              "每一天都是一个独特的能量门户，通过它我们可以连接宇宙的智慧和力量。"
            </p>
            <p className="text-right text-sm mt-2 text-purple-600">— 玛雅历法</p>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg p-4 shadow-sm border border-purple-100">
            <p className="text-gray-700 italic">
              "我们不是在地球上生活，而是与地球共同生活。尊重自然的节奏，就是尊重自己的生命。"
            </p>
            <p className="text-right text-sm mt-2 text-purple-600">— 玛雅古训</p>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg p-4 shadow-sm border border-purple-100">
            <p className="text-gray-700 italic">
              "真正的力量不在于控制外界，而在于掌握内心的平衡与和谐。"
            </p>
            <p className="text-right text-sm mt-2 text-purple-600">— 玛雅哲学</p>
          </div>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
          <p className="text-purple-800 text-sm leading-relaxed">
            <strong>玛雅日历原理：</strong> 玛雅日历是基于宇宙能量周期的古老智慧系统，通过20个太阳印记和13个银河音阶的组合，形成260天的神圣周期。每个印记代表特定的能量特质，音阶则对应宇宙振动的频率，共同构成了人类与宇宙能量同步的密码。
          </p>
        </div>
      </div>
    </div>
  );
};

export default MayaCalendar;
