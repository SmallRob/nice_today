import React, { useState, useEffect } from 'react';

const RequestForm = ({ endpoint, onTest }) => {
  const [method, setMethod] = useState(endpoint?.method || 'GET');
  const [url, setUrl] = useState(endpoint?.url || '');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [params, setParams] = useState([{ key: '', value: '' }]);

  // 初始化表单数据
  useEffect(() => {
    if (endpoint) {
      setMethod(endpoint.method || 'GET');
      setUrl(endpoint.url || '');
      
      // 初始化参数
      if (endpoint.parameters) {
        const initialParams = endpoint.parameters.map(param => ({
          key: param.name,
          value: param.default || '',
          required: param.required || false,
          description: param.description || ''
        }));
        setParams(initialParams);
      }
    }
  }, [endpoint]);

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    if (headers.length > 1) {
      const newHeaders = headers.filter((_, i) => i !== index);
      setHeaders(newHeaders);
    }
  };

  const handleParamChange = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const addParam = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  const removeParam = (index) => {
    if (params.length > 1) {
      const newParams = params.filter((_, i) => i !== index);
      setParams(newParams);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 构造请求数据
    const requestData = {
      method,
      url,
      headers: headers.filter(h => h.key && h.value),
      body: body || undefined,
      params: params.filter(p => p.key && p.value)
    };
    
    onTest(requestData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">API测试</h3>
      
      <form onSubmit={handleSubmit}>
        {/* 请求方法和URL */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-3">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div className="col-span-9">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        {/* 查询参数 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">查询参数</h4>
            <button
              type="button"
              onClick={addParam}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              + 添加参数
            </button>
          </div>
          <div className="space-y-2">
            {params.map((param, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                    placeholder="参数名"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-6">
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                    placeholder="参数值"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeParam(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={params.length <= 1}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 请求头 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">请求头</h4>
            <button
              type="button"
              onClick={addHeader}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              + 添加请求头
            </button>
          </div>
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    placeholder="Header Key"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-6">
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    placeholder="Header Value"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeHeader(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    disabled={headers.length <= 1}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 请求体 */}
        {method !== 'GET' && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-white">请求体</h4>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={6}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          发送请求
        </button>
      </form>
    </div>
  );
};

export default RequestForm;