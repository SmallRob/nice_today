import React, { useState } from 'react';

const ApiTester = ({ endpoint }) => {
  const [params, setParams] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 初始化参数状态
  React.useEffect(() => {
    const initialParams = {};
    if (endpoint.parameters) {
      endpoint.parameters.forEach(param => {
        initialParams[param.name] = param.default || '';
      });
    }
    setParams(initialParams);
  }, [endpoint]);

  const handleParamChange = (paramName, value) => {
    setParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // 构造请求数据
      const testData = {
        endpoint: endpoint.path,
        method: endpoint.method,
        params: params
      };

      // 使用环境变量配置的API基础URL，如果没有配置则使用默认值
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${apiBaseUrl}/api/management/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError('测试请求失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">测试 {endpoint.method} {endpoint.path}</h3>
      
      {/* 参数输入 */}
      {endpoint.parameters && endpoint.parameters.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">参数</h4>
          <div className="space-y-3">
            {endpoint.parameters.map((param, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700">
                  {param.name} {param.required && <span className="text-red-500">*</span>}
                  {param.type && <span className="text-xs text-gray-500 ml-2">({param.type})</span>}
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={params[param.name] || ''}
                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                  placeholder={param.description || param.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 测试按钮 */}
      <button
        onClick={handleTest}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? '测试中...' : '发送请求'}
      </button>

      {/* 响应显示 */}
      {response && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">响应</h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 错误显示 */}
      {error && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">错误</h4>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTester;