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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">玛雅出生日历解读</h2>

      {/* 出生日期选择区域 */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-medium">选择出生日期</h3>
            <p className="text-sm text-gray-500">获取您的玛雅出生日历解读</p>
          </div>
          <div className="flex items-center">
            <DatePicker
              selected={birthDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="选择出生日期"
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
            />
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "加载中..." : "查询解读"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md mt-2">
            {error}
          </div>
        )}
      </div>

      {/* 历史记录区域 - 只有在有历史记录且用户已交互时显示 */}
      {historyDates.length > 0 && userInteracted && (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2 text-gray-700">历史查询记录</h3>
          <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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

      {/* 结果展示 */}
      {showResults && birthInfo && (
        <div className="mt-6">
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {birthInfo.date} {birthInfo.weekday}
              </h3>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {birthInfo.maya_kin}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-24 h-24 bg-indigo-400 rounded-lg flex items-center justify-center mb-3">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">{birthInfo.maya_seal}</div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-center">{birthInfo.maya_seal_desc}</h2>
            </div>
          </div>

          {/* 生命使命 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 border-b pb-2">生命使命</h3>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <p className="text-lg font-medium mb-2">{birthInfo.life_purpose.summary}</p>
              <p className="mb-3 text-gray-700">{birthInfo.life_purpose.details}</p>
              <p className="text-blue-600">{birthInfo.life_purpose.action_guide}</p>
            </div>
          </div>

          {/* 个人特质 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-3 border-b pb-2">个人优势</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <ul className="list-disc list-inside">
                  {birthInfo.personal_traits.strengths.map((item, index) => (
                    <li key={index} className="text-gray-700 mb-2">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 border-b pb-2">成长挑战</h3>
              <div className="bg-amber-50 p-4 rounded-lg">
                <ul className="list-disc list-inside">
                  {birthInfo.personal_traits.challenges.map((item, index) => (
                    <li key={index} className="text-gray-700 mb-2">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 能量场 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 border-b pb-2">能量场解读</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-700 mb-2">主要能量场: {birthInfo.birth_energy_field.primary.type}</h4>
                <p className="text-gray-700 mb-2">{birthInfo.birth_energy_field.primary.info.描述}</p>
                <p className="text-gray-700 mb-2"><span className="font-medium">影响范围:</span> {birthInfo.birth_energy_field.primary.info.影响范围}</p>
                <p className="text-gray-700"><span className="font-medium">增强方法:</span> {birthInfo.birth_energy_field.primary.info.增强方法}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">次要能量场: {birthInfo.birth_energy_field.secondary.type}</h4>
                <p className="text-gray-700 mb-2">{birthInfo.birth_energy_field.secondary.info.描述}</p>
                <p className="text-gray-700 mb-2"><span className="font-medium">影响范围:</span> {birthInfo.birth_energy_field.secondary.info.影响范围}</p>
                <p className="text-gray-700"><span className="font-medium">增强方法:</span> {birthInfo.birth_energy_field.secondary.info.增强方法}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-gray-800 font-medium">{birthInfo.birth_energy_field.balance_suggestion}</p>
            </div>
          </div>

          {/* 印记和音调详细信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-3 border-b pb-2">玛雅印记: {birthInfo.maya_seal}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">特质</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.特质}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">能量</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.能量}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">启示</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.启示}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">象征</h4>
                  <p className="text-gray-600">{birthInfo.maya_seal_info.象征}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-3 border-b pb-2">玛雅音调</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">数字</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.数字}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">行动</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.行动}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">本质</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.本质}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">启示</h4>
                  <p className="text-gray-600">{birthInfo.maya_tone_info.启示}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 默认日期提示 */}
      {isDefaultDate && !loading && birthInfo && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-blue-700">
            当前显示的是默认出生日期（1991年1月1日）的玛雅出生图解读。请选择您的实际出生日期以获取个性化分析。
          </p>
        </div>
      )}

      {!showResults && !loading && !birthInfo && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">请选择您的出生日期，获取个人玛雅日历解读</p>
        </div>
      )}
    </div>
  );
};

export default MayaBirthChart;