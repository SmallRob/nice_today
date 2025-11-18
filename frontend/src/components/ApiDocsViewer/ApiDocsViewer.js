import React, { useState, useEffect } from 'react';

const ApiDocsViewer = () => {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取API文档列表
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        // 使用环境变量配置的API基础URL，如果没有配置则使用默认值
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
        const response = await fetch(`${apiBaseUrl}/api/docs`);
        const data = await response.json();
        setDocs(data.docs || []);
        setLoading(false);
      } catch (err) {
        setError('获取API文档列表失败');
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">错误: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">API文档</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 文档列表侧边栏 */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">文档列表</h2>
            <div className="space-y-2">
              {docs.map((doc, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedDoc?.id === doc.id
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-xs text-gray-500">版本: {doc.version}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 文档详情区域 */}
        <div className="lg:w-3/4">
          {selectedDoc ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">{selectedDoc.title}</h2>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-600">版本: {selectedDoc.version}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-600">
                    更新时间: {new Date(selectedDoc.updatedAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-3 text-gray-700">{selectedDoc.description}</p>
              </div>

              {/* Swagger UI 集成 */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium">API文档详情</h3>
                </div>
                <div className="p-4">
                  {selectedDoc.openApiSpec ? (
                    <pre className="text-sm text-gray-800 overflow-x-auto bg-gray-50 p-4 rounded">
                      {JSON.stringify(selectedDoc.openApiSpec, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-500">暂无详细文档信息</p>
                  )}
                </div>
              </div>

              {/* 测试按钮 */}
              <div className="mt-6">
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={() => alert('跳转到API测试页面')}
                >
                  测试此API
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium">未选择文档</h3>
                <p className="mt-1 text-sm">请从左侧列表中选择一个API文档</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDocsViewer;