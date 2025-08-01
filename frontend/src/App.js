import React, { useState, useEffect } from 'react';
import BiorhythmTab from './components/BiorhythmTab';
import DressInfo from './components/DressInfo';
import MayaCalendar from './components/MayaCalendar';
import MayaBirthChart from './components/MayaBirthChart';
import { testApiConnection } from './services/apiService';
import niceDayLogo from './images/nice_day.png';

// 动态获取API基础URL
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log("生产环境：使用环境变量配置的域名访问API");
    
    // 使用环境变量配置的域名，如果没有则使用当前域名
    const apiDomain = process.env.REACT_APP_API_DOMAIN || '';
    return `${apiDomain}/api`;
  } else {
    // 开发环境中使用本地地址
    const backendPort = process.env.REACT_APP_BACKEND_PORT || 5001;
    console.log("开发环境：使用后端端口:", backendPort);
    return `http://localhost:${backendPort}`;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('biorhythm'); // 'biorhythm', 'dressInfo' 或 'mayaCalendar'
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
            <button
              className={`nav-tab ${activeTab === 'mayaCalendar' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
              onClick={() => setActiveTab('mayaCalendar')}
            >
              玛雅日历
            </button>
            <button
              className={`nav-tab ${activeTab === 'mayaBirthChart' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
              onClick={() => setActiveTab('mayaBirthChart')}
            >
              玛雅出生图
            </button>
          </div>

          {/* 标签页内容 */}
          {activeTab === 'biorhythm' && (
            <BiorhythmTab apiBaseUrl={apiBaseUrl} apiConnected={apiConnected} />
          )}

          {activeTab === 'dressInfo' && (
            <DressInfo apiBaseUrl={apiBaseUrl} />
          )}
          
          {activeTab === 'mayaCalendar' && (
            <MayaCalendar apiBaseUrl={apiBaseUrl} />
          )}
          
          {activeTab === 'mayaBirthChart' && (
            <MayaBirthChart apiBaseUrl={apiBaseUrl} />
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