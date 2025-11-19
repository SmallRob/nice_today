import React, { useState } from 'react';

const ResponseViewer = ({ response, loading, error }) => {
  const [activeTab, setActiveTab] = useState('body');

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">响应</h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-700 dark:text-gray-300">请求中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">响应</h3>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">请求失败</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">响应</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="mt-2">发送请求以查看响应</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('body')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'body'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            响应体
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'headers'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            响应头
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            请求信息
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'body' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">响应体</h4>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {response.status} • {response.statusText}
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md">
              <pre className="p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto max-h-96 bg-gray-50 dark:bg-gray-700">
                {response.body ? JSON.stringify(response.body, null, 2) : '无响应体'}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'headers' && (
          <div>
            <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-white">响应头</h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md">
              <div className="p-4 space-y-2">
                {response.headers && Object.entries(response.headers).map(([key, value], index) => (
                  <div key={index} className="flex">
                    <div className="w-1/3 text-gray-600 dark:text-gray-300 font-mono">{key}:</div>
                    <div className="w-2/3 font-mono text-gray-900 dark:text-gray-100">{value}</div>
                  </div>
                ))}
                {!response.headers && <p className="text-gray-500 dark:text-gray-400">无响应头信息</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div>
            <h4 className="text-md font-medium mb-4 text-gray-900 dark:text-white">请求信息</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">状态码</div>
                <div className="font-medium text-gray-900 dark:text-white">{response.status}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">状态文本</div>
                <div className="font-medium text-gray-900 dark:text-white">{response.statusText}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">响应时间</div>
                <div className="font-medium text-gray-900 dark:text-white">{response.time} ms</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">响应大小</div>
                <div className="font-medium text-gray-900 dark:text-white">{response.size} bytes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;