import React, { useState, useEffect, useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BiorhythmChart from './BiorhythmChart';
import BiorhythmInfo from './BiorhythmInfo';
import { fetchHistoryDates, fetchBiorhythmData } from '../services/apiService';
import elementConfig from '../config/elementConfig.json';

const BiorhythmTab = ({ apiBaseUrl, apiConnected }) => {
  const [birthDate, setBirthDate] = useState(null);
  const [rhythmData, setRhythmData] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [futureData, setFutureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyDates, setHistoryDates] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDefaultDate, setIsDefaultDate] = useState(false);

  // 从配置文件获取默认出生日期
  const DEFAULT_BIRTH_DATE = elementConfig.defaultBirthDate || "1991-01-01";

  // 使用 useRef 来存储最新的 loadBiorhythmData 函数引用
  const loadBiorhythmDataRef = useRef(null);

  // 加载生物节律数据
  const loadBiorhythmData = useCallback(async (selectedDate = null) => {
    // 使用函数参数或当前状态
    const dateToUse = selectedDate || birthDate;
    
    if (!dateToUse) {
      setError("请选择出生日期");
      return;
    }

    if (!apiConnected) {
      setError("后端API未连接，无法获取数据");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await fetchBiorhythmData(apiBaseUrl, dateToUse);
    
    if (result.success) {
      setRhythmData(result.rhythmData);
      setTodayData(result.todayData);
      setFutureData(result.futureData);
      
      // 如果不是使用默认日期，则更新历史记录
      if (!isDefaultDate || typeof dateToUse !== 'string' || dateToUse !== DEFAULT_BIRTH_DATE) {
        setIsDefaultDate(false);
        // 更新历史记录
        const historyResult = await fetchHistoryDates(apiBaseUrl);
        if (historyResult.success) {
          setHistoryDates(historyResult.history);
        }
      }
      
      // 如果是字符串日期，转换为Date对象并更新birthDate
      if (typeof dateToUse === 'string') {
        setBirthDate(new Date(dateToUse));
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    setShowHistory(false); // 隐藏历史记录下拉菜单
  }, [apiBaseUrl, apiConnected, birthDate, isDefaultDate]);

  // 更新 ref 以保存最新的 loadBiorhythmData 函数
  useEffect(() => {
    loadBiorhythmDataRef.current = loadBiorhythmData;
  }, [loadBiorhythmData]);

  // 加载历史记录和数据
  const loadHistoryAndData = useCallback(async () => {
    const historyResult = await fetchHistoryDates(apiBaseUrl);
    
    if (historyResult.success) {
      setHistoryDates(historyResult.history);
      
      // 如果有历史记录，加载最后一次查询的日期
      if (historyResult.history.length > 0) {
        console.log("加载历史记录中的最后一次查询日期:", historyResult.history[0]);
        // 使用 ref 中存储的最新函数
        if (loadBiorhythmDataRef.current) {
          loadBiorhythmDataRef.current(historyResult.history[0]);
        }
      } else {
        // 如果没有历史记录，加载默认日期
        console.log("没有历史记录，加载默认日期:", DEFAULT_BIRTH_DATE);
        setIsDefaultDate(true);
        // 使用 ref 中存储的最新函数
        if (loadBiorhythmDataRef.current) {
          loadBiorhythmDataRef.current(DEFAULT_BIRTH_DATE);
        }
      }
    } else {
      // 如果获取历史记录失败，加载默认日期
      console.log("获取历史记录失败，加载默认日期:", DEFAULT_BIRTH_DATE);
      setIsDefaultDate(true);
      // 使用 ref 中存储的最新函数
      if (loadBiorhythmDataRef.current) {
        loadBiorhythmDataRef.current(DEFAULT_BIRTH_DATE);
      }
    }
  }, [apiBaseUrl, setIsDefaultDate]);

  // 组件挂载时加载历史记录和数据
  useEffect(() => {
    // 确保 loadBiorhythmDataRef.current 已经被设置
    if (loadBiorhythmDataRef.current && apiBaseUrl && apiConnected) {
      // 使用 setTimeout 确保在下一个事件循环中执行，避免初始化时的循环调用
      const timer = setTimeout(() => {
        loadHistoryAndData();
      }, 0);
      return () => clearTimeout(timer);
    } else if (!apiConnected) {
      // 如果API未连接，使用默认日期但不发送请求
      setIsDefaultDate(true);
      setBirthDate(new Date(DEFAULT_BIRTH_DATE));
    }
  }, [apiBaseUrl, apiConnected, loadHistoryAndData]);

  // 处理日期选择变化
  const handleDateChange = (date) => {
    setBirthDate(date);
    // 当用户选择日期后立即查询
    if (date && apiConnected) {
      loadBiorhythmData(date);
    }
  };

  // 格式化日期显示
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">输入您的出生日期</h2>
        {isDefaultDate && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-blue-700">
              当前显示的是默认出生日期（1991年1月1日）的生物节律数据。请选择您的实际出生日期以获取个性化分析。
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <DatePicker
            selected={birthDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="选择出生日期"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
          />
          <div className="flex gap-2">
            <button
              onClick={() => loadBiorhythmData()}
              disabled={loading || !birthDate || !apiConnected}
              className={`px-4 py-2 rounded-md text-white ${loading || !birthDate || !apiConnected ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? '加载中...' : '分析节律'}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                disabled={loading || historyDates.length === 0}
                className={`px-4 py-2 rounded-md text-white ${loading || historyDates.length === 0 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                历史记录
              </button>
              
              {showHistory && historyDates.length > 0 && (
                <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg">
                  <div className="py-1">
                    {historyDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => loadBiorhythmData(date)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      
      {rhythmData && todayData && (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">您的生物节律图表</h2>
            <BiorhythmChart data={rhythmData} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">今日节律</h2>
              <BiorhythmInfo data={todayData} title="今日" />
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">10天后节律</h2>
              <BiorhythmInfo data={futureData} title="10天后" />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BiorhythmTab;