import React, { useState } from 'react';
import ApiDocsViewer from '../components/ApiDocsViewer/ApiDocsViewer';
import RequestForm from '../components/RequestForm/RequestForm';
import ResponseViewer from '../components/ResponseViewer/ResponseViewer';

const ApiManagementPage = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async (requestData) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // 使用环境变量配置的API基础URL，如果没有配置则使用默认值
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      
      // 构造完整的URL，包含查询参数
      let fullUrl = requestData.url;
      if (requestData.params && requestData.params.length > 0) {
        const queryParams = new URLSearchParams();
        requestData.params.forEach(param => {
          if (param.key && param.value) {
            queryParams.append(param.key, param.value);
          }
        });
        if (queryParams.toString()) {
          fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryParams.toString();
        }
      }

      const fetchOptions = {
        method: requestData.method,
        headers: {}
      };

      // 设置请求头
      if (requestData.headers && requestData.headers.length > 0) {
        requestData.headers.forEach(header => {
          if (header.key && header.value) {
            fetchOptions.headers[header.key] = header.value;
          }
        });
      }

      // 设置请求体（仅适用于POST, PUT, PATCH等方法）
      if (requestData.body && ['POST', 'PUT', 'PATCH'].includes(requestData.method)) {
        // 尝试解析JSON，如果失败则作为普通文本发送
        try {
          JSON.parse(requestData.body);
          fetchOptions.headers['Content-Type'] = 'application/json';
          fetchOptions.body = requestData.body;
        } catch {
          fetchOptions.body = requestData.body;
        }
      }

      const startTime = Date.now();
      const res = await fetch(fullUrl, fetchOptions);
      const endTime = Date.now();

      const responseHeaders = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseBody = await res.json();
      } else {
        responseBody = await res.text();
      }

      const responseData = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: endTime - startTime,
        size: JSON.stringify(responseBody).length
      };

      setResponse(responseData);
    } catch (err) {
      setError('请求失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API管理平台</h1>
          <p className="mt-2 text-gray-600">查看API文档并在线测试API端点</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：API文档查看器 */}
          <div className="lg:col-span-1">
            <ApiDocsViewer />
          </div>

          {/* 右侧：API测试面板 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <RequestForm onTest={handleTest} />
              <ResponseViewer response={response} loading={loading} error={error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiManagementPage;