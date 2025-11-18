# API管理台登录故障排除指南

## 问题描述
用户报告API管理台登录时出现网络错误："网络错误，请稍后重试: Failed to fetch"

## 问题根因分析
1. **后端API路由问题** - 登录接口可能未正确处理异常
2. **CORS配置不完整** - 跨域请求被浏览器阻止
3. **环境变量配置错误** - 前端和后端API URL不匹配
4. **网络连接问题** - 后端服务未启动或端口被占用

## 已实施的修复方案

### 1. 后端登录API增强
- ✅ 改进了异常处理和错误响应
- ✅ 使用标准JSONResponse格式
- ✅ 添加详细的日志记录
- ✅ 支持适当的HTTP状态码

### 2. 前端错误处理优化
- ✅ 实现了重试机制（最多3次尝试）
- ✅ 改进了错误消息显示
- ✅ 移除credentials以避免CORS预检问题
- ✅ 添加Accept头确保JSON响应

### 3. 环境变量配置
- ✅ 创建了前端和后端的.env.example文件
- ✅ 设置了正确的默认端口配置
- ✅ 统一了API基础URL（端口5000）

### 4. CORS配置增强
- ✅ 扩展了允许的来源列表
- ✅ 增加了预检请求缓存时间
- ✅ 支持更多HTTP方法和头部

## 故障排除步骤

### 第一步：检查后端服务状态
```bash
# 检查后端服务是否运行
curl http://localhost:5000/health

# 检查端口占用情况
lsof -i :5000
```

### 第二步：验证前端环境变量
确保前端目录下的`.env`文件包含：
```
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 第三步：检查浏览器控制台
打开浏览器开发者工具，查看Network标签页：
1. 是否发送了POST请求到`/api/management/login`
2. 检查请求和响应详情
3. 查看是否有CORS错误

### 第四步：查看后端日志
```bash
# 查看后端日志
cat backend/logs/backend_*.log
```

## 快速测试

### 使用curl测试登录接口
```bash
curl -X POST http://localhost:5000/api/management/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 预期响应
```json
{
  "success": true,
  "token": "随机生成的token",
  "message": "登录成功"
}
```

## 常见问题及解决方案

### 问题1："Failed to fetch"错误
**原因**：后端服务未启动或网络连接问题
**解决方案**：
1. 启动后端服务：`cd backend && python app.py`
2. 检查防火墙设置
3. 验证端口5000是否可用

### 问题2：CORS错误
**原因**：跨域请求被浏览器阻止
**解决方案**：
1. 确保后端CORS配置正确
2. 检查请求来源是否在白名单中
3. 使用正确的HTTP方法

### 问题3："用户名或密码错误"
**原因**：认证信息不匹配
**解决方案**：
1. 使用默认用户名：`admin`，密码：`admin123`
2. 检查后端环境变量`ADMIN_USERNAME`和`ADMIN_PASSWORD`

### 问题4："请求数据格式错误"
**原因**：JSON格式不正确
**解决方案**：
1. 确保请求体是有效的JSON
2. 检查Content-Type头设置为`application/json`

## 部署说明

### 开发环境部署
1. **启动后端服务**
   ```bash
   cd backend
   python app.py --port 5000
   ```

2. **启动前端服务**
   ```bash
   cd frontend
   npm start
   ```

### Docker部署
```bash
# 使用Docker Compose
docker-compose up -d

# 检查服务状态
docker-compose ps
```

## 监控和日志

### 后端日志位置
- 主日志：`backend/logs/backend_YYYYMMDD.log`
- 错误日志：`backend/logs/error_YYYYMMDD.log`
- API访问日志：`backend/logs/api_access_YYYYMMDD.log`

### 前端调试
在浏览器控制台中启用详细日志：
```javascript
// 查看详细的网络请求信息
console.log('API请求详情:', {
  url: loginUrl,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

## 联系支持
如果以上步骤无法解决问题，请提供：
1. 浏览器控制台错误信息
2. 后端日志内容
3. 网络请求的完整详情

---

**最后更新**：2025-11-18  
**版本**：1.0.0