import React, { useState, useEffect } from 'react';
import BiorhythmTab from './components/BiorhythmTab';
import DressInfo from './components/DressInfo';
import { testApiConnection } from './services/apiService';
import niceDayLogo from './images/nice_day.png';

// 动态获取API基础URL
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // 统一使用 /api 路径，这是nginx配置的API代理路径
    return `/api`;
  } else {
    const backendPort = process.env.REACT_APP_BACKEND_PORT || 5020;
    return `http://localhost:${backendPort}`;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('biorhythm'); // 'biorhythm' 或 'dressInfo'
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [apiConnected, setApiConnected] = useState(false);
  // 保留 setError 用于错误处理，但在 UI 中显示错误信息
  const [, setError] = useState(null);

  // 组件挂载时初始化API基础URL和修改页面标题
  useEffect(() => {
    // 修改网页标题
    document.title = "Nice Day";
    
    const url = getApiBaseUrl();
    setApiBaseUrl(url);
    console.log("API基础URL:", url);
    
    // 测试API连接
    initializeApiConnection(url);
  }, []);

  // 初始化API连接
  const initializeApiConnection = async (baseUrl) => {
    const result = await testApiConnection(baseUrl);
    
    if (result.success) {
      setApiBaseUrl(result.url);
      setApiConnected(true);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <img 
            src={niceDayLogo} 
            alt="Nice Day Logo" 
            className="h-12 w-auto mr-4"
          />
          <h1 className="page-title">Nice Day 生物节律分析</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="content-section">
          {/* API连接状态 */}
          {!apiConnected && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    无法连接到后端API服务。请确保后端服务已启动，并检查端口配置。
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 标签页导航 */}
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'biorhythm' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
              onClick={() => setActiveTab('biorhythm')}
            >
              生物节律
            </button>
            <button
              className={`nav-tab ${activeTab === 'dressInfo' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
              onClick={() => setActiveTab('dressInfo')}
            >
              穿衣与饮食指南
            </button>
          </div>

          {/* 标签页内容 */}
          {activeTab === 'biorhythm' && (
            <BiorhythmTab apiBaseUrl={apiBaseUrl} apiConnected={apiConnected} />
          )}

          {activeTab === 'dressInfo' && (
            <DressInfo apiBaseUrl={apiBaseUrl} />
          )}
        </div>
      </main>
      
      <footer className="bg-white shadow mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">Nice Day 生物节律分析工具 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;