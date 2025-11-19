import React, { useState, useEffect } from 'react';
import BiorhythmTab from './BiorhythmTab';
import DressInfo from './DressInfo';
import MayaCalendar from './MayaCalendar';
import { testApiConnection } from '../services/apiService';

const BiorhythmDashboard = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiConnected, setApiConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('biorhythm');

  // 检测后端API连接
  const detectApiConnection = async () => {
    setLoading(true);
    
    // 定义可能的API地址
    const possibleUrls = [
      process.env.REACT_APP_API_BASE_URL || '', // 环境变量中的API地址
      'http://localhost:5201',
      'http://localhost:5000',
      '/api',
      '/backend'
    ];

    console.log('开始检测API连接，可能的地址:', possibleUrls);

    for (const url of possibleUrls) {
      if (!url) continue;
      
      try {
        console.log(`尝试连接: ${url}`);
        const result = await testApiConnection(url);
        
        if (result.success) {
          console.log(`API连接成功: ${result.url}`);
          setApiBaseUrl(result.url);
          setApiConnected(true);
          setApiStatus(result.message);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error(`连接 ${url} 失败:`, err);
      }
    }

    // 所有尝试都失败
    console.log('所有API地址连接失败');
    setApiConnected(false);
    setApiStatus('无法连接到后端API服务，请确保后端服务已启动');
    setLoading(false);
  };

  useEffect(() => {
    detectApiConnection();
  }, []);

  // 标签配置
  const tabs = [
    { id: 'biorhythm', label: '生物节律分析', icon: '📊' },
    { id: 'maya', label: '玛雅日历', icon: '🌙' },
    { id: 'dress', label: '穿衣饮食指南', icon: '👕' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">正在检测后端服务连接...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
      {/* 顶部导航栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                🌟
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">生物节律生活助手</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">基于科学计算的个性化生活建议</p>
              </div>
            </div>
            
            {/* API状态指示器 */}
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              apiConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {apiConnected ? '✅ 后端服务已连接' : '❌ 后端服务未连接'}
            </div>
          </div>
        </div>
      </div>

      {/* API连接状态提示 */}
      {!apiConnected && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">后端服务未连接</h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>{apiStatus}</p>
                  <p className="mt-1">部分功能可能无法正常使用。您可以：</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>检查后端服务是否已启动</li>
                    <li>尝试刷新页面重新连接</li>
                    <li>联系技术支持</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <button
                    onClick={detectApiConnection}
                    className="bg-yellow-100 dark:bg-yellow-800 border border-yellow-300 dark:border-yellow-600 rounded-md px-3 py-1 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                  >
                    重新检测连接
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标签导航 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <div className="flex border-b dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 标签内容 */}
          <div className="p-6">
            {activeTab === 'biorhythm' && (
              <BiorhythmTab 
                apiBaseUrl={apiBaseUrl} 
                apiConnected={apiConnected} 
              />
            )}
            
            {activeTab === 'maya' && (
              <MayaCalendar apiBaseUrl={apiBaseUrl} />
            )}
            
            {activeTab === 'dress' && (
              <DressInfo apiBaseUrl={apiBaseUrl} />
            )}
          </div>
        </div>

        {/* 功能说明卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl mb-4">
              📊
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">生物节律分析</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              基于23天体力周期、28天情绪周期和33天智力周期，
              科学计算您的生物节律状态，帮助您了解身心变化规律。
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 dark:bg-opacity-30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 text-xl mb-4">
              🌙
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">玛雅日历</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              探索古老的玛雅智慧，了解每日的KIN数、调性和图腾，
              获得更深层次的精神指导和能量洞察。
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-xl mb-4">
              👕
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">穿衣饮食指南</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              结合传统五行理论和现代健康理念，
              为您提供个性化的穿衣配色和饮食建议，促进身心健康。
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl mb-4">
              💡
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">生活建议报告</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              综合生物节律、天气状况和个人偏好，
              生成全面的生活建议报告，助您做出更明智的日常决策。
            </p>
          </div>
        </div>

        {/* 科学依据说明 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              🔬
            </div>
            <h2 className="text-xl font-bold">科学依据说明</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">体力周期 (23天)</h4>
              <p className="text-blue-100 dark:text-blue-200 text-sm">
                影响身体力量、耐力、协调性和抵抗疾病的能力。
                在高峰期，体力和精力充沛；在低谷期，容易感到疲劳。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">情绪周期 (28天)</h4>
              <p className="text-blue-100 dark:text-blue-200 text-sm">
                影响情绪稳定性、创造力、直觉和敏感性。
                在高峰期，情绪积极乐观；在低谷期，可能情绪波动较大。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">智力周期 (33天)</h4>
              <p className="text-blue-100 dark:text-blue-200 text-sm">
                影响思维能力、记忆力、分析能力和学习能力。
                在高峰期，思维敏捷清晰；在低谷期，注意力可能较难集中。
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-400 dark:border-blue-500">
            <p className="text-blue-100 dark:text-blue-200 text-sm italic">
              注意：生物节律理论仅供参考，个人体验可能因多种因素而异。
              建议结合自身实际情况合理参考，保持积极健康的生活方式。
            </p>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 生物节律生活助手. 基于科学计算的个性化生活建议系统.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="text-gray-500 dark:text-gray-500 text-sm">版本: v2.1</span>
              <span className="text-gray-500 dark:text-gray-500 text-sm">最后修改: 2025-11-12</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BiorhythmDashboard;