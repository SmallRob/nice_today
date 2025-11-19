import React, { useState, useEffect } from 'react';

const ApiManagementDashboard = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取API端点信息
  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        // 使用环境变量配置的API基础URL，如果没有配置则使用默认值
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
        const response = await fetch(`${apiBaseUrl}/api/management/endpoints`);
        const data = await response.json();
        setEndpoints(data.endpoints);
        setLoading(false);
      } catch (err) {
        setError('获取API端点信息失败');
        setLoading(false);
      }
    };

    const fetchServiceStatus = async () => {
      try {
        // 使用环境变量配置的API基础URL，如果没有配置则使用默认值
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
        const response = await fetch(`${apiBaseUrl}/api/management/status`);
        const data = await response.json();
        setServiceStatus(data);
      } catch (err) {
        console.error('获取服务状态失败:', err);
      }
    };

    fetchEndpoints();
    fetchServiceStatus();

    // 每30秒刷新一次服务状态
    const interval = setInterval(fetchServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-700 dark:text-gray-300">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 dark:text-red-400">错误: {error}</div>;
  }

  // 按分类组织端点
  const endpointsByCategory = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">API管理面板</h1>
      
      {/* 服务状态卡片 */}
      {serviceStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">服务状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">CPU使用率</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{serviceStatus.resources?.cpu_percent?.toFixed(1) || 'N/A'}%</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">内存使用率</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{serviceStatus.resources?.memory_percent?.toFixed(1) || 'N/A'}%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">磁盘使用率</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{serviceStatus.resources?.disk_percent?.toFixed(1) || 'N/A'}%</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">服务状态: 
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded">
                {serviceStatus.status}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">API端点</h2>
        {Object.entries(endpointsByCategory).map(([category, categoryEndpoints]) => (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryEndpoints.map((endpoint, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-700/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                        endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="ml-2 font-mono text-sm text-gray-900 dark:text-gray-100">{endpoint.path}</span>
                    </div>
                    <button
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200 transition-colors dark:bg-indigo-900/50 dark:text-indigo-200 dark:hover:bg-indigo-800/50"
                      onClick={() => alert(`测试 ${endpoint.method} ${endpoint.path}`)}
                    >
                      测试
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{endpoint.description}</p>
                  {endpoint.parameters && endpoint.parameters.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">参数:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <span key={paramIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded dark:bg-gray-600 dark:text-gray-200">
                            {param.name}{param.required ? '*' : ''} ({param.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiManagementDashboard;