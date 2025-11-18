import React, { useState } from 'react';

const ApiManagementLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 前端验证
    if (!username.trim() || !password.trim()) {
      setError('用户名和密码不能为空');
      setLoading(false);
      return;
    }

    // 重试机制
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        // 使用环境变量配置的API基础URL，如果没有配置则使用默认值5001端口
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
        const loginUrl = `${apiBaseUrl}/api/management/login`;
        
        console.log(`发送登录请求到: ${loginUrl} (尝试 ${retryCount + 1}/${maxRetries + 1})`);
        
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username, password }),
          // 移除credentials以避免CORS预检问题
          credentials: 'omit'
        });

        console.log('收到响应:', response.status, response.statusText);

        // 检查响应状态
        if (!response.ok) {
          let errorText;
          try {
            errorText = await response.text();
          } catch {
            errorText = '无法读取响应内容';
          }
          
          console.error(`HTTP错误响应: ${response.status} - ${errorText}`);
          
          // 如果是服务器错误，重试
          if (response.status >= 500 && retryCount < maxRetries) {
            retryCount++;
            console.log(`服务器错误，第${retryCount}次重试...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          }
          
          // 尝试解析错误响应
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          
          throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.message || errorText}`);
        }

        const data = await response.json();
        console.log('响应数据:', data);

        if (data.success) {
          // 保存token到localStorage
          localStorage.setItem('apiManagementToken', data.token);
          onLogin(data.token);
          break; // 成功，退出循环
        } else {
          setError(data.error || '登录失败');
          break; // 业务逻辑错误，不重试
        }
        
      } catch (err) {
        console.error(`登录请求失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, err);
        
        // 如果是网络错误且还有重试次数，则重试
        if (err.message.includes('Failed to fetch') && retryCount < maxRetries) {
          retryCount++;
          console.log(`网络错误，第${retryCount}次重试...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        
        // 最终错误处理
        if (err.message.includes('HTTP')) {
          // HTTP错误
          setError(err.message);
        } else if (err.message.includes('Failed to fetch')) {
          // 网络连接错误
          setError('网络连接失败，请检查：\n1. 后端服务是否启动\n2. 网络连接是否正常\n3. 端口是否被占用');
        } else {
          // 其他错误
          setError(`登录失败: ${err.message}`);
        }
        break;
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            API管理面板登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            默认用户名: admin, 默认密码: admin123
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiManagementLogin;