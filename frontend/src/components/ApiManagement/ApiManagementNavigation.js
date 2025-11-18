import React, { useState, useEffect } from 'react';
import ApiManagementDashboard from './ApiManagementDashboard';
import ServiceStatusDashboard from './ServiceStatusDashboard';
import ApiManagementLogin from './ApiManagementLogin';
import ApiDocsViewer from '../ApiDocsViewer/ApiDocsViewer';
import ApiManagementPage from '../../pages/ApiManagementPage';

const ApiManagementNavigation = () => {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'endpoints', label: 'API端点' },
    { id: 'status', label: '服务状态' },
    { id: 'docs', label: 'API文档' },
    { id: 'test', label: 'API测试' }
  ];

  // 检查是否已经登录
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedToken = localStorage.getItem('apiManagementToken');
      if (savedToken) {
        // 验证token是否仍然有效
        try {
          // 这里可以添加一个API调用来验证token
          setIsLoggedIn(true);
          setToken(savedToken);
        } catch (err) {
          console.error('Token验证失败:', err);
          // Token无效，清除它
          localStorage.removeItem('apiManagementToken');
          setIsLoggedIn(false);
          setToken('');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (newToken) => {
    setIsLoggedIn(true);
    setToken(newToken);
  };

  const handleLogout = async () => {
    try {
      // 使用环境变量配置的API基础URL，如果没有配置则使用默认值
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      await fetch(`${apiBaseUrl}/api/management/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('登出请求失败:', err);
    } finally {
      localStorage.removeItem('apiManagementToken');
      setIsLoggedIn(false);
      setToken('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <ApiManagementLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">API管理面板</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'endpoints' && <ApiManagementDashboard />}
        {activeTab === 'status' && <ServiceStatusDashboard />}
        {activeTab === 'docs' && <ApiDocsViewer />}
        {activeTab === 'test' && <ApiManagementPage />}
      </main>
    </div>
  );
};

export default ApiManagementNavigation;