import React, { useState, useEffect, useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fetchMayaBirthInfo, formatDateString } from '../services/apiService';

const MayaBirthChart = ({ apiBaseUrl }) => {
  // 默认日期设置为1991-01-01
  const defaultDate = new Date(1991, 0, 1); // JavaScript月份从0开始，所以0表示1月
  const [birthDate, setBirthDate] = useState(defaultDate);
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [isDefaultDate, setIsDefaultDate] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // 防止并发请求导致loading卡住
  const loadingRef = useRef(false);

  // 获取历史记录（最多6条）
  const fetchHistory = useCallback(async () => {
    if (!apiBaseUrl) return;
    try {
      const response = await fetch(`${apiBaseUrl}/maya/history`);
      const data = await response.json();
      if (data && Array.isArray(data.history)) {
        setHistoryDates(data.history.slice(0, 6));
      }
    } catch (err) {
      console.error("获取历史记录失败:", err);
    }
  }, [apiBaseUrl]);

  // 保存历史记录到后端（假设有POST接口）
  const saveHistory = useCallback(async (dates) => {
    if (!apiBaseUrl) return;
    try {
      await fetch(`${apiBaseUrl}/maya/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: dates })
      });
    } catch (err) {
      // 失败不影响前端展示
      console.error("保存历史记录失败:", err);
    }
  }, [apiBaseUrl]);

  // 加载出生日期的玛雅日历信息，并处理历史记录
  const loadBirthInfo = useCallback(
    async (date, saveToHistory = false) => {
      if (!date || !apiBaseUrl) return;
      if (loadingRef.current) return; // 防止并发
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      try {
        const dateStr = typeof date === 'string' ? date : formatDateString(date);
        const result = await fetchMayaBirthInfo(apiBaseUrl, dateStr);

        if (result.success) {
          setBirthInfo(result.birthInfo);
          setShowResults(true);

          // 如果是字符串日期，转换为Date对象并更新birthDate
          if (typeof date === 'string') {
            setBirthDate(new Date(date));
          }

          // 处理历史记录（仅在用户交互后且需要保存时）
          if (saveToHistory && userInteracted) {
            let newHistory = [dateStr, ...historyDates.filter(d => d !== dateStr)];
            if (newHistory.length > 6) newHistory = newHistory.slice(0, 6);
            setHistoryDates(newHistory);
            saveHistory(newHistory);
          }
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error("获取玛雅出生图信息失败:", error);
        setError("获取数据失败，请稍后再试");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [apiBaseUrl, userInteracted, historyDates, saveHistory]
  );

  // 初始加载
  useEffect(() => {
    if (apiBaseUrl) {
      loadBirthInfo(defaultDate, false);
      fetchHistory();
    }
    // eslint-disable-next-line
  }, [apiBaseUrl]);

  // 格式化日期显示
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 处理日期选择
  const handleDateChange = (date) => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
    setBirthDate(date);
    setIsDefaultDate(false);
    // 避免重复加载同一天
    if (!loading && (!birthInfo || formatDateString(date) !== formatDateString(birthDate))) {
      loadBirthInfo(date, true);
    }
  };

  // 刷新当前选择的出生日期信息
  const handleRefresh = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
    // 避免重复加载
    if (!loading) {
      loadBirthInfo(birthDate, true);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">玛雅出生日历解读</h2>
        <p className="text-gray-600">探索您的玛雅印记，了解生命使命与个人特质</p>
      </div>

      {/* 出生日期选择区域 */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">选择出生日期</h3>
              <p className="text-gray-600">获取您的专属玛雅出生日历解读</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <DatePicker
                selected={birthDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择出生日期"
                className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
              />
              <button
                onClick={handleRefresh}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    加载中...
                  </div>
                ) : (
                  "查询解读"
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 历史记录区域 - 只有在有历史记录且用户已交互时显示 */}
        {historyDates.length > 0 && userInteracted && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">历史查询记录</h3>
            <div className="flex flex-wrap gap-3">
              {historyDates.map((date, index) => {
                // 确保日期格式一致进行比较
                const currentDateStr = formatDateString(birthDate);
                const isActive = currentDateStr === date;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      // 避免重复加载当前已选择的日期和加载中时点击
                      if (!isActive && !loading) {
                        setIsDefaultDate(false);
                        setBirthDate(new Date(date));
                        loadBirthInfo(date, true);
                      }
                    }}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-sm"
                    }`}
                    disabled={loading}
                  >
                    {formatDate(date)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 结果展示 */}
      {showResults && birthInfo && (
        <div className="space-y-8">
          {/* 主要信息卡片 */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-2xl text-white shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {birthInfo.date} {birthInfo.weekday}
                </h3>
                <p className="text-indigo-100">您的玛雅出生印记</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <span className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium border border-white border-opacity-30">
                  {birthInfo.maya_kin}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white border-opacity-30 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold">{birthInfo.maya_seal}</div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">{birthInfo.maya_seal_desc}</h2>
              <p className="text-indigo-100 text-center">您的玛雅印记特质</p>
            </div>
          </div>

          {/* 生命使命 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">生命使命</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <p className="text-xl font-semibold mb-4 text-gray-900">{birthInfo.life_purpose.summary}</p>
              <p className="mb-4 text-gray-700 leading-relaxed">{birthInfo.life_purpose.details}</p>
              <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 font-medium">{birthInfo.life_purpose.action_guide}</p>
              </div>
            </div>
          </div>

          {/* 个人特质 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">个人优势</h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                <ul className="space-y-3">
                  {birthInfo.personal_traits.strengths.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">成长挑战</h3>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl">
                <ul className="space-y-3">
                  {birthInfo.personal_traits.challenges.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 能量场 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">能量场解读</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                <h4 className="font-bold text-purple-800 mb-4 text-lg">主要能量场: {birthInfo.birth_energy_field.primary.type}</h4>
                <div className="space-y-3 text-gray-700">
                  <p><span className="font-semibold">描述:</span> {birthInfo.birth_energy_field.primary.info.描述}</p>
                  <p><span className="font-semibold">影响范围:</span> {birthInfo.birth_energy_field.primary.info.影响范围}</p>
                  <p><span className="font-semibold">增强方法:</span> {birthInfo.birth_energy_field.primary.info.增强方法}</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-4 text-lg">次要能量场: {birthInfo.birth_energy_field.secondary.type}</h4>
                <div className="space-y-3 text-gray-700">
                  <p><span className="font-semibold">描述:</span> {birthInfo.birth_energy_field.secondary.info.描述}</p>
                  <p><span className="font-semibold">影响范围:</span> {birthInfo.birth_energy_field.secondary.info.影响范围}</p>
                  <p><span className="font-semibold">增强方法:</span> {birthInfo.birth_energy_field.secondary.info.增强方法}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border-l-4 border-yellow-500">
              <p className="text-gray-800 font-semibold text-lg">{birthInfo.birth_energy_field.balance_suggestion}</p>
            </div>
          </div>

          {/* 印记和音调详细信息 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">玛雅印记: {birthInfo.maya_seal}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">特质</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.特质}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">能量</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.能量}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">启示</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.启示}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">象征</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.象征}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4">玛雅音调</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">数字</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.数字}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">行动</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.行动}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">本质</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.本质}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">启示</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.启示}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 默认日期提示 */}
      {isDefaultDate && !loading && birthInfo && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-blue-800 font-medium">
                当前显示的是默认出生日期（1991年1月1日）的玛雅出生图解读。请选择您的实际出生日期以获取个性化分析。
              </p>
            </div>
          </div>
        </div>
      )}

      {!showResults && !loading && !birthInfo && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">请选择您的出生日期，获取个人玛雅日历解读</p>
        </div>
      )}
    </div>
  );
};

export default MayaBirthChart;