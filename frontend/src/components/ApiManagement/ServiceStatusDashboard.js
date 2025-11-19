import React, { useState, useEffect } from 'react';

const ServiceStatusDashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // 使用环境变量配置的API基础URL，如果没有配置则使用默认值
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
        const response = await fetch(`${apiBaseUrl}/api/management/status`);
        const data = await response.json();
        setStatus(data);
        setLoading(false);
      } catch (err) {
        setError('获取服务状态失败');
        setLoading(false);
      }
    };

    fetchStatus();

    // 每10秒刷新一次状态
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-700 dark:text-gray-300">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 dark:text-red-400">错误: {error}</div>;
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 格式化字节大小
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">服务状态监控</h1>
      
      {/* 基本状态信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">基本状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${status.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">服务状态</p>
              <p className={`text-lg font-medium ${status.status === 'running' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {status.status === 'running' ? '运行中' : '异常'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">更新时间</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{formatTime(status.timestamp)}</p>
          </div>
        </div>
      </div>

      {/* 资源使用情况 */}
      {status.resources && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">资源使用情况</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU使用率 */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">CPU</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${status.resources.cpu_percent}%` }}
                ></div>
              </div>
              <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{status.resources.cpu_percent.toFixed(2)}%</p>
            </div>
            
            {/* 内存使用率 */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">内存</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${status.resources.memory_percent}%` }}
                ></div>
              </div>
              <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{status.resources.memory_percent.toFixed(2)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {formatBytes(status.resources.memory_used)} / {formatBytes(status.resources.memory_total)}
              </p>
            </div>
            
            {/* 磁盘使用率 */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">磁盘</h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${status.resources.disk_percent}%` }}
                ></div>
              </div>
              <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{status.resources.disk_percent.toFixed(2)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {formatBytes(status.resources.disk_used)} / {formatBytes(status.resources.disk_total)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 服务详情 */}
      {status.services && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">服务详情</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(status.services).map(([serviceName, isRunning]) => (
              <div key={serviceName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 dark:bg-gray-700/50">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium capitalize text-gray-900 dark:text-white">{serviceName}</p>
                    <p className={`text-sm ${isRunning ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isRunning ? '运行中' : '停止'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceStatusDashboard;