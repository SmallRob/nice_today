# API文档页面集成与API管理测试功能使用说明

## 功能概述

本功能提供了完整的API文档查看和在线测试能力，包括：

1. API文档集成展示
2. 在线API测试工具
3. 请求历史记录管理

## 前端组件

### ApiDocsViewer (API文档查看器)
- 展示所有可用的API文档
- 支持文档版本管理
- 集成Swagger UI显示OpenAPI规范

### RequestForm (请求表单)
- 支持所有HTTP方法(GET, POST, PUT, DELETE等)
- 动态参数配置
- 请求头和请求体编辑
- 查询参数管理

### ResponseViewer (响应查看器)
- 格式化显示API响应
- 响应头和响应体分开展示
- 请求性能信息显示

### ApiManagementPage (API管理页面)
- 集成文档查看和API测试功能
- 提供完整的API管理界面

## 后端服务

### ApiDocsService (API文档服务)
- 管理API文档的增删改查
- 生成和维护OpenAPI规范
- 支持多版本文档管理

### API端点

1. `GET /api/docs` - 获取API文档列表
2. `GET /api/docs/{id}` - 获取特定API文档
3. `POST /api/docs` - 创建新的API文档
4. `PUT /api/docs/{id}` - 更新API文档
5. `DELETE /api/docs/{id}` - 删除API文档

## 使用方法

### 访问API管理界面
1. 启动前端和后端服务
2. 访问主应用页面
3. 点击顶部导航栏的"API管理"选项卡

### 查看API文档
1. 在API管理界面中点击"API文档"选项卡
2. 从左侧文档列表中选择要查看的API文档
3. 右侧将显示文档详情和Swagger UI界面

### 测试API端点
1. 在API管理界面中点击"API测试"选项卡
2. 在请求表单中配置请求方法、URL和参数
3. 点击"发送请求"按钮执行测试
4. 在响应查看器中查看测试结果

## 技术实现

### 前端技术栈
- React框架
- Tailwind CSS样式库
- Fetch API进行HTTP请求

### 后端技术栈
- Python FastAPI框架
- JSON文件存储API文档
- 标准HTTP客户端进行API测试

## 安全考虑

- API管理界面需要登录认证
- 所有API请求都经过CORS验证
- 敏感操作需要适当的权限控制

## 扩展性

- 支持集成Swagger UI或ReDoc等专业文档工具
- 可扩展支持GraphQL API文档
- 支持API测试用例的保存和重用