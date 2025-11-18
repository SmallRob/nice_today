#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一后端服务 - 整合生物节律和玛雅历法功能
提供RESTful API接口和优化的日志系统
"""

import os
import sys
import logging
from datetime import datetime, date
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import traceback
from typing import List, Dict, Any, Optional

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入服务模块
from services.biorhythm_service import (
    get_history, get_today_biorhythm, get_date_biorhythm, get_biorhythm_range
)
from services.dress_service import (
    get_today_dress_info, get_date_dress_info, get_dress_info_range
)
from services.maya_service import (
    get_today_maya_info, get_date_maya_info, get_maya_info_range,
    get_maya_birth_info, get_maya_history
)
from services.api_docs_service import api_docs_service
from utils.date_utils import normalize_date_string

class UnifiedBackendService:
    """统一后端服务类"""
    
    def __init__(self):
        self.setup_logging()
        self.app = FastAPI(
            title="统一后端API服务",
            description="整合生物节律、玛雅历法和穿搭建议的统一API服务",
            version="1.0.0",
            docs_url="/api/docs",
            redoc_url="/api/redoc",
            openapi_url="/api/openapi.json"
        )
        self.setup_middleware()
        self.setup_routes()
        
    def setup_logging(self):
        """配置优化的日志系统"""
        # 创建日志目录
        log_dir = os.path.join(os.path.dirname(__file__), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        # 配置日志格式
        log_format = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(name)-15s | %(funcName)-20s:%(lineno)-4d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # 配置根日志记录器
        self.logger = logging.getLogger('UnifiedBackend')
        self.logger.setLevel(logging.INFO)
        
        # 清除现有处理器
        self.logger.handlers.clear()
        
        # 控制台处理器 - 彩色输出
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(log_format)
        
        # 文件处理器 - 所有日志
        file_handler = logging.FileHandler(
            os.path.join(log_dir, f'backend_{datetime.now().strftime("%Y%m%d")}.log'),
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(log_format)
        
        # 错误文件处理器 - 仅错误日志
        error_handler = logging.FileHandler(
            os.path.join(log_dir, f'error_{datetime.now().strftime("%Y%m%d")}.log'),
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(log_format)
        
        # API访问日志处理器
        api_handler = logging.FileHandler(
            os.path.join(log_dir, f'api_access_{datetime.now().strftime("%Y%m%d")}.log'),
            encoding='utf-8'
        )
        api_handler.setLevel(logging.INFO)
        api_format = logging.Formatter(
            '%(asctime)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        api_handler.setFormatter(api_format)
        
        # 添加处理器
        self.logger.addHandler(console_handler)
        self.logger.addHandler(file_handler)
        self.logger.addHandler(error_handler)
        
        # 创建API访问日志记录器
        self.api_logger = logging.getLogger('APIAccess')
        self.api_logger.setLevel(logging.INFO)
        self.api_logger.addHandler(api_handler)
        
        self.logger.info("=" * 60)
        self.logger.info("统一后端服务启动")
        self.logger.info("=" * 60)
        
    def setup_middleware(self):
        """配置中间件"""
        # CORS中间件
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # 请求日志中间件
        @self.app.middleware("http")
        async def log_requests(request: Request, call_next):
            start_time = datetime.now()
            
            # 记录请求信息
            client_ip = request.client.host if request.client else "unknown"
            self.api_logger.info(
                f"请求开始 | {request.method} {request.url.path} | IP: {client_ip} | "
                f"User-Agent: {request.headers.get('user-agent', 'unknown')}"
            )
            
            try:
                # 处理请求
                response = await call_next(request)
                
                # 计算处理时间
                process_time = (datetime.now() - start_time).total_seconds()
                
                # 记录响应信息
                self.api_logger.info(
                    f"请求完成 | {request.method} {request.url.path} | "
                    f"状态码: {response.status_code} | 耗时: {process_time:.3f}s"
                )
                
                return response
                
            except Exception as e:
                # 记录异常
                process_time = (datetime.now() - start_time).total_seconds()
                self.logger.error(
                    f"请求异常 | {request.method} {request.url.path} | "
                    f"错误: {str(e)} | 耗时: {process_time:.3f}s"
                )
                self.logger.error(traceback.format_exc())
                raise
                
    def setup_routes(self):
        """设置路由"""
        
        # 全局异常处理
        @self.app.exception_handler(Exception)
        async def global_exception_handler(request: Request, exc: Exception):
            self.logger.error(f"全局异常处理 | {request.method} {request.url.path} | 错误: {str(exc)}")
            self.logger.error(traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "服务器内部错误",
                    "message": str(exc) if os.getenv('DEBUG', 'False').lower() == 'true' else "请联系管理员"
                }
            )
            
        # 健康检查
        @self.app.get("/health")
        async def health_check():
            """健康检查接口"""
            self.logger.info("执行健康检查")
            return {
                "status": "healthy",
                "service": "unified-backend",
                "timestamp": datetime.now().isoformat(),
                "services": {
                    "biorhythm": True,
                    "maya": True,
                    "dress": True
                }
            }
            
        # ==================== API管理接口 ====================
        
        @self.app.get("/api/management/endpoints")
        async def get_api_endpoints():
            """获取所有API端点信息"""
            self.logger.info("获取API端点信息")
            return {
                "endpoints": [
                    {
                        "method": "GET",
                        "path": "/health",
                        "description": "健康检查接口",
                        "category": "系统"
                    },
                    {
                        "method": "GET",
                        "path": "/",
                        "description": "API根路径",
                        "category": "系统"
                    },
                    {
                        "method": "GET",
                        "path": "/biorhythm/history",
                        "description": "获取生物节律历史查询记录",
                        "category": "生物节律"
                    },
                    {
                        "method": "GET",
                        "path": "/biorhythm/today",
                        "description": "获取今天的生物节律",
                        "category": "生物节律",
                        "parameters": [
                            {"name": "birth_date", "required": True, "type": "string", "description": "出生日期，格式为YYYY-MM-DD"}
                        ]
                    },
                    {
                        "method": "GET",
                        "path": "/biorhythm/date",
                        "description": "获取指定日期的生物节律",
                        "category": "生物节律",
                        "parameters": [
                            {"name": "birth_date", "required": True, "type": "string", "description": "出生日期，格式为YYYY-MM-DD"},
                            {"name": "date", "required": True, "type": "string", "description": "目标日期，格式为YYYY-MM-DD"}
                        ]
                    },
                    {
                        "method": "GET",
                        "path": "/biorhythm/range",
                        "description": "获取一段时间内的生物节律",
                        "category": "生物节律",
                        "parameters": [
                            {"name": "birth_date", "required": True, "type": "string", "description": "出生日期，格式为YYYY-MM-DD"},
                            {"name": "days_before", "required": False, "type": "integer", "description": "当前日期之前的天数", "default": 10},
                            {"name": "days_after", "required": False, "type": "integer", "description": "当前日期之后的天数", "default": 20}
                        ]
                    },
                    {
                        "method": "GET",
                        "path": "/maya/today",
                        "description": "获取今日玛雅历法信息",
                        "category": "玛雅历法"
                    },
                    {
                        "method": "GET",
                        "path": "/maya/date",
                        "description": "获取指定日期的玛雅历法信息",
                        "category": "玛雅历法",
                        "parameters": [
                            {"name": "date", "required": True, "type": "string", "description": "目标日期，格式为YYYY-MM-DD"}
                        ]
                    },
                    {
                        "method": "GET",
                        "path": "/maya/range",
                        "description": "获取一段时间内的玛雅历法信息",
                        "category": "玛雅历法",
                        "parameters": [
                            {"name": "days_before", "required": False, "type": "integer", "description": "当前日期之前的天数", "default": 3},
                            {"name": "days_after", "required": False, "type": "integer", "description": "当前日期之后的天数", "default": 3}
                        ]
                    },
                    {
                        "method": "POST",
                        "path": "/api/maya/birth-info",
                        "description": "获取玛雅出生图信息",
                        "category": "玛雅历法",
                        "parameters": [
                            {"name": "birth_date", "required": True, "type": "string", "description": "出生日期，格式为YYYY-MM-DD"}
                        ]
                    },
                    {
                        "method": "GET",
                        "path": "/api/maya/history",
                        "description": "获取玛雅历史记录",
                        "category": "玛雅历法"
                    },
                    {
                        "method": "POST",
                        "path": "/api/maya/history",
                        "description": "保存玛雅历史记录",
                        "category": "玛雅历法"
                    },
                    {
                        "method": "GET",
                        "path": "/dress/today",
                        "description": "获取今日穿衣颜色和饮食建议",
                        "category": "穿搭建议"
                    },
                    {
                        "method": "GET",
                        "path": "/dress/date",
                        "description": "获取指定日期的穿衣颜色和饮食建议",
                        "category": "穿搭建议",
                        "parameters": [
                            {"name": "date", "required": True, "type": "string", "description": "目标日期，格式为YYYY-MM-DD"}
                        ]
                    },
                    {
                        "method": "GET",
                        "path": "/dress/range",
                        "description": "获取一段时间内的穿衣颜色和饮食建议",
                        "category": "穿搭建议",
                        "parameters": [
                            {"name": "days_before", "required": False, "type": "integer", "description": "当前日期之前的天数", "default": 1},
                            {"name": "days_after", "required": False, "type": "integer", "description": "当前日期之后的天数", "default": 6}
                        ]
                    }
                ]
            }
            
        @self.app.get("/api/management/status")
        async def get_service_status():
            """获取服务状态信息"""
            self.logger.info("获取服务状态信息")
            try:
                # 获取系统信息
                import platform
                import psutil
                import time
                
                # 获取CPU和内存信息
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                
                # 获取磁盘信息
                disk = psutil.disk_usage('/')
                
                # 获取启动时间
                boot_time = psutil.boot_time()
                uptime = time.time() - boot_time
                
                return {
                    "status": "running",
                    "timestamp": datetime.now().isoformat(),
                    "system": {
                        "platform": platform.system(),
                        "platform_version": platform.version(),
                        "architecture": platform.machine(),
                        "hostname": platform.node()
                    },
                    "resources": {
                        "cpu_percent": cpu_percent,
                        "memory_total": memory.total,
                        "memory_available": memory.available,
                        "memory_percent": memory.percent,
                        "disk_total": disk.total,
                        "disk_used": disk.used,
                        "disk_free": disk.free,
                        "disk_percent": (disk.used / disk.total) * 100
                    },
                    "uptime": uptime,
                    "services": {
                        "biorhythm": True,
                        "maya": True,
                        "dress": True,
                        "api": True
                    }
                }
            except Exception as e:
                self.logger.error(f"获取服务状态信息失败: {str(e)}")
                return {
                    "status": "error",
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                }
                
        @self.app.post("/api/management/test")
        async def test_api_endpoint(request: Request):
            """测试API端点"""
            try:
                data = await request.json()
                endpoint = data.get('endpoint', '')
                method = data.get('method', 'GET')
                params = data.get('params', {})
                
                self.logger.info(f"测试API端点 | 方法: {method} | 路径: {endpoint} | 参数: {params}")
                
                # 实际调用API端点
                import httpx
                
                # 构造完整的URL
                base_url = f"http://localhost:{os.getenv('PORT', '5000')}"
                url = f"{base_url}{endpoint}"
                
                # 创建HTTP客户端
                async with httpx.AsyncClient() as client:
                    if method == 'GET':
                        # 处理查询参数
                        response = await client.get(url, params=params)
                    elif method == 'POST':
                        response = await client.post(url, json=params)
                    else:
                        return {
                            "success": False,
                            "error": f"不支持的HTTP方法: {method}",
                            "timestamp": datetime.now().isoformat()
                        }
                
                # 返回响应结果
                return {
                    "success": True,
                    "endpoint": endpoint,
                    "method": method,
                    "request_params": params,
                    "response": {
                        "status_code": response.status_code,
                        "headers": dict(response.headers),
                        "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                    },
                    "timestamp": datetime.now().isoformat()
                }
            except Exception as e:
                self.logger.error(f"API端点测试失败: {str(e)}")
                return {
                    "success": False,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
                
        # ==================== API管理认证接口 ====================
        
        @self.app.post("/api/management/login")
        async def api_management_login(request: Request):
            """API管理界面登录"""
            try:
                # 尝试解析JSON数据
                try:
                    data = await request.json()
                except Exception as json_error:
                    self.logger.error(f"API管理登录JSON解析失败: {str(json_error)}")
                    return {
                        "success": False,
                        "error": "请求数据格式错误"
                    }
                
                username = data.get('username', '')
                password = data.get('password', '')
                
                self.logger.info(f"API管理登录尝试 | 用户名: {username}")
                
                # 检查必需字段
                if not username or not password:
                    self.logger.warning(f"API管理登录缺少必需字段 | 用户名: {username}")
                    return {
                        "success": False,
                        "error": "用户名和密码不能为空"
                    }
                
                # 简单的认证逻辑（在实际应用中应该使用更安全的方式）
                # 这里我们假设环境变量中设置了管理用户名和密码
                import os
                admin_username = os.getenv('ADMIN_USERNAME', 'admin')
                admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
                
                self.logger.info(f"API管理登录验证 | 环境变量用户名: {admin_username}")
                
                if username == admin_username and password == admin_password:
                    # 生成简单的token（实际应用中应使用JWT等更安全的方式）
                    import secrets
                    token = secrets.token_hex(16)
                    
                    # 在实际应用中，应该将token存储在数据库或缓存中
                    # 这里我们只是演示
                    self.logger.info(f"API管理登录成功 | 用户名: {username}")
                    return {
                        "success": True,
                        "token": token,
                        "message": "登录成功"
                    }
                else:
                    self.logger.warning(f"API管理登录失败 | 用户名: {username} | 提供的用户名: {username}")
                    return {
                        "success": False,
                        "error": "用户名或密码错误"
                    }
            except Exception as e:
                self.logger.error(f"API管理登录失败: {str(e)}")
                self.logger.error(f"错误详情: {traceback.format_exc()}")
                return {
                    "success": False,
                    "error": "登录处理失败"
                }
                
        @self.app.post("/api/management/logout")
        async def api_management_logout(request: Request):
            """API管理界面登出"""
            try:
                # 在实际应用中，应该从存储中删除token
                # 这里我们只是演示
                return {
                    "success": True,
                    "message": "登出成功"
                }
            except Exception as e:
                self.logger.error(f"API管理登出失败: {str(e)}")
                return {
                    "success": False,
                    "error": "登出处理失败"
                }
            
        @self.app.get("/")
        async def root():
            """API根路径"""
            self.logger.info("访问API根路径")
            return {
                "message": "欢迎使用统一后端API服务",
                "version": "1.0.0",
                "services": ["生物节律", "玛雅历法", "穿搭建议"],
                "endpoints": {
                    "生物节律": {
                        "今日节律": "/biorhythm/today?birth_date=YYYY-MM-DD",
                        "指定日期节律": "/biorhythm/date?birth_date=YYYY-MM-DD&date=YYYY-MM-DD",
                        "日期范围节律": "/biorhythm/range?birth_date=YYYY-MM-DD&days_before=10&days_after=20",
                        "历史记录": "/biorhythm/history"
                    },
                    "玛雅历法": {
                        "今日玛雅信息": "/maya/today",
                        "指定日期玛雅信息": "/maya/date?date=YYYY-MM-DD",
                        "玛雅出生图": "/api/maya/birth-info (POST)",
                        "玛雅历史": "/api/maya/history"
                    },
                    "穿搭建议": {
                        "今日建议": "/dress/today",
                        "指定日期建议": "/dress/date?date=YYYY-MM-DD",
                        "日期范围建议": "/dress/range?days_before=1&days_after=6"
                    },
                    "系统": {
                        "健康检查": "/health"
                    }
                }
            }
            
        # ==================== API文档接口 ====================
        
        @self.app.get("/api/docs")
        async def get_api_docs():
            """获取API文档列表"""
            self.logger.info("获取API文档列表")
            try:
                docs = api_docs_service.get_all_docs()
                return docs
            except Exception as e:
                self.logger.error(f"获取API文档列表失败: {str(e)}")
                return {"docs": []}
                
        @self.app.get("/api/docs/{doc_id}")
        async def get_api_doc(doc_id: str):
            """获取特定API文档"""
            self.logger.info(f"获取API文档 | ID: {doc_id}")
            try:
                doc = api_docs_service.get_doc_by_id(doc_id)
                if doc:
                    return doc
                else:
                    raise HTTPException(status_code=404, detail="文档未找到")
            except HTTPException:
                raise
            except Exception as e:
                self.logger.error(f"获取API文档失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        @self.app.post("/api/docs")
        async def create_api_doc(request: Request):
            """创建新的API文档"""
            self.logger.info("创建新的API文档")
            try:
                data = await request.json()
                doc = api_docs_service.create_doc(data)
                return doc
            except Exception as e:
                self.logger.error(f"创建API文档失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        @self.app.put("/api/docs/{doc_id}")
        async def update_api_doc(doc_id: str, request: Request):
            """更新API文档"""
            self.logger.info(f"更新API文档 | ID: {doc_id}")
            try:
                data = await request.json()
                doc = api_docs_service.update_doc(doc_id, data)
                if doc:
                    return doc
                else:
                    raise HTTPException(status_code=404, detail="文档未找到")
            except HTTPException:
                raise
            except Exception as e:
                self.logger.error(f"更新API文档失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        @self.app.delete("/api/docs/{doc_id}")
        async def delete_api_doc(doc_id: str):
            """删除API文档"""
            self.logger.info(f"删除API文档 | ID: {doc_id}")
            try:
                result = api_docs_service.delete_doc(doc_id)
                if result:
                    return {"message": "文档删除成功"}
                else:
                    raise HTTPException(status_code=404, detail="文档未找到")
            except HTTPException:
                raise
            except Exception as e:
                self.logger.error(f"删除API文档失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
            
        # ==================== 生物节律相关接口 ====================
        
        @self.app.get("/biorhythm/history")
        async def api_get_biorhythm_history():
            """获取生物节律历史查询记录"""
            self.logger.info("获取生物节律历史记录")
            try:
                history = get_history()
                self.logger.info(f"返回{len(history)}条历史记录")
                return {"history": history}
            except Exception as e:
                self.logger.error(f"获取生物节律历史记录失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/biorhythm/today")
        async def api_get_today_biorhythm(birth_date: str = Query(..., description="出生日期，格式为YYYY-MM-DD")):
            """获取今天的生物节律"""
            self.logger.info(f"计算今日生物节律 | 生日: {birth_date}")
            try:
                birth_date = normalize_date_string(birth_date)
                result = get_today_biorhythm(birth_date)
                self.logger.info("今日生物节律计算成功")
                return result
            except Exception as e:
                self.logger.error(f"今日生物节律计算失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/biorhythm/date")
        async def api_get_date_biorhythm(
            birth_date: str = Query(..., description="出生日期，格式为YYYY-MM-DD"),
            date: str = Query(..., description="目标日期，格式为YYYY-MM-DD")
        ):
            """获取指定日期的生物节律"""
            self.logger.info(f"计算指定日期生物节律 | 生日: {birth_date} | 目标日期: {date}")
            try:
                birth_date = normalize_date_string(birth_date)
                date = normalize_date_string(date)
                result = get_date_biorhythm(birth_date, date)
                self.logger.info("指定日期生物节律计算成功")
                return result
            except Exception as e:
                self.logger.error(f"指定日期生物节律计算失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/biorhythm/range")
        async def api_get_biorhythm_range(
            birth_date: str = Query(..., description="出生日期，格式为YYYY-MM-DD"),
            days_before: int = Query(10, description="当前日期之前的天数"),
            days_after: int = Query(20, description="当前日期之后的天数")
        ):
            """获取一段时间内的生物节律"""
            self.logger.info(f"计算生物节律范围 | 生日: {birth_date} | 前{days_before}天 | 后{days_after}天")
            try:
                birth_date = normalize_date_string(birth_date)
                result = get_biorhythm_range(birth_date, days_before, days_after)
                self.logger.info(f"生物节律范围计算成功 | 共{len(result.get('biorhythm_list', []))}天数据")
                return result
            except Exception as e:
                self.logger.error(f"生物节律范围计算失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        # ==================== 玛雅历法相关接口 ====================
        
        @self.app.get("/maya/today")
        async def api_get_today_maya():
            """获取今日玛雅历法信息"""
            self.logger.info("获取今日玛雅历法信息")
            try:
                result = get_today_maya_info()
                self.logger.info("今日玛雅历法信息获取成功")
                return result
            except Exception as e:
                self.logger.error(f"今日玛雅历法信息获取失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        @self.app.get("/maya/date")
        async def api_get_date_maya(date: str = Query(..., description="目标日期，格式为YYYY-MM-DD")):
            """获取指定日期的玛雅历法信息"""
            self.logger.info(f"获取指定日期玛雅历法信息 | 日期: {date}")
            try:
                date = normalize_date_string(date)
                result = get_date_maya_info(date)
                self.logger.info("指定日期玛雅历法信息获取成功")
                return result
            except Exception as e:
                self.logger.error(f"指定日期玛雅历法信息获取失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        @self.app.get("/maya/range")
        async def api_get_maya_range(
            days_before: int = Query(3, description="当前日期之前的天数"),
            days_after: int = Query(3, description="当前日期之后的天数")
        ):
            """获取一段时间内的玛雅历法信息"""
            self.logger.info(f"获取玛雅历法范围信息 | 前{days_before}天 | 后{days_after}天")
            try:
                result = get_maya_info_range(days_before, days_after)
                self.logger.info(f"玛雅历法范围信息获取成功 | 共{len(result.get('maya_info_list', []))}天数据")
                return result
            except Exception as e:
                self.logger.error(f"玛雅历法范围信息获取失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        @self.app.post("/api/maya/birth-info")
        async def api_maya_birth_info(request: Request):
            """获取玛雅出生图信息"""
            try:
                data = await request.json()
                if not data or 'birth_date' not in data:
                    self.logger.warning("玛雅出生图请求缺少birth_date参数")
                    return JSONResponse(
                        status_code=400,
                        content={"success": False, "error": "缺少birth_date参数"}
                    )
                
                birth_date = data['birth_date']
                self.logger.info(f"计算玛雅出生图 | 生日: {birth_date}")
                
                birth_info = get_maya_birth_info(birth_date)
                self.logger.info("玛雅出生图计算成功")
                
                return {
                    "success": True,
                    "birthInfo": birth_info
                }
                
            except Exception as e:
                self.logger.error(f"玛雅出生图计算失败: {str(e)}")
                return JSONResponse(
                    status_code=500,
                    content={
                        "success": False,
                        "error": f"服务器内部错误: {str(e)}"
                    }
                )
                
        @self.app.get("/api/maya/history")
        async def api_maya_history():
            """获取玛雅历史记录"""
            self.logger.info("获取玛雅历史记录")
            try:
                history = get_maya_history()
                self.logger.info(f"返回{len(history)}条玛雅历史记录")
                return {
                    "success": True,
                    "history": history
                }
            except Exception as e:
                self.logger.error(f"获取玛雅历史记录失败: {str(e)}")
                return JSONResponse(
                    status_code=500,
                    content={"success": False, "error": str(e)}
                )
                
        @self.app.post("/api/maya/history")
        async def api_save_maya_history():
            """保存玛雅历史记录"""
            self.logger.info("保存玛雅历史记录")
            return {
                "success": True,
                "message": "历史记录已保存"
            }
            
        # ==================== 穿搭建议相关接口 ====================
        
        @self.app.get("/dress/today")
        async def api_get_today_dress():
            """获取今日穿衣颜色和饮食建议"""
            self.logger.info("获取今日穿搭建议")
            try:
                result = get_today_dress_info()
                self.logger.info("今日穿搭建议获取成功")
                return result
            except Exception as e:
                self.logger.error(f"今日穿搭建议获取失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/dress/date")
        async def api_get_date_dress(date: str = Query(..., description="目标日期，格式为YYYY-MM-DD")):
            """获取指定日期的穿衣颜色和饮食建议"""
            self.logger.info(f"获取指定日期穿搭建议 | 日期: {date}")
            try:
                date = normalize_date_string(date)
                result = get_date_dress_info(date)
                self.logger.info("指定日期穿搭建议获取成功")
                return result
            except Exception as e:
                self.logger.error(f"指定日期穿搭建议获取失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/dress/range")
        async def api_get_dress_range(
            days_before: int = Query(1, description="当前日期之前的天数"),
            days_after: int = Query(6, description="当前日期之后的天数")
        ):
            """获取一段时间内的穿衣颜色和饮食建议"""
            self.logger.info(f"获取穿搭建议范围 | 前{days_before}天 | 后{days_after}天")
            try:
                result = get_dress_info_range(days_before, days_after)
                self.logger.info(f"穿搭建议范围获取成功 | 共{len(result.get('dress_info_list', []))}天数据")
                return result
            except Exception as e:
                self.logger.error(f"穿搭建议范围获取失败: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
                
        # ==================== 向后兼容的旧版API ====================
        
        @self.app.get("/biorhythm")
        async def legacy_get_biorhythm_range(
            birth_date: str = Query(...),
            days_before: int = Query(10),
            days_after: int = Query(20)
        ):
            """旧版API路径，重定向到新路径"""
            return await api_get_biorhythm_range(birth_date, days_before, days_after)
            
    def run(self, host='0.0.0.0', port=5000, debug=False):
        """启动服务"""
        self.logger.info(f"启动统一后端服务")
        self.logger.info(f"服务地址: http://{host}:{port}")
        self.logger.info(f"调试模式: {debug}")
        self.logger.info("-" * 60)
        
        try:
            uvicorn.run(
                self.app,
                host=host,
                port=port,
                log_level="info" if not debug else "debug",
                access_log=False  # 使用自定义访问日志
            )
        except Exception as e:
            self.logger.error(f"服务启动失败: {str(e)}")
            raise

def create_app():
    """创建FastAPI应用实例"""
    service = UnifiedBackendService()
    return service.app

if __name__ == '__main__':
    import argparse
    from utils.port_utils import find_available_port, get_port_info
    
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='统一后端服务')
    parser.add_argument('--host', default=os.getenv('HOST', '0.0.0.0'), help='服务主机地址')
    parser.add_argument('--port', type=int, default=int(os.getenv('PORT', '5000')), help='服务端口')
    parser.add_argument('--debug', action='store_true', help='启用调试模式')
    parser.add_argument('--auto-port', action='store_true', help='自动查找可用端口')
    
    args = parser.parse_args()
    
    host = args.host
    preferred_port = args.port
    debug = args.debug or os.getenv('DEBUG', 'False').lower() == 'true'
    
    # 检查端口是否可用，如果不可用则自动查找
    if args.auto_port:
        port = find_available_port(host, preferred_port)
        if port == -1:
            print(f"错误: 无法找到可用端口，从{preferred_port}开始搜索")
            sys.exit(1)
        if port != preferred_port:
            print(f"端口{preferred_port}不可用，自动选择端口{port}")
    else:
        port = preferred_port
        # 检查端口占用情况
        port_info = get_port_info(port)
        if port_info.get('occupied'):
            print(f"警告: 端口{port}已被占用")
            print(f"占用进程: {port_info.get('command', 'unknown')} (PID: {port_info.get('pid', 'unknown')})")
            print("建议使用 --auto-port 参数自动选择可用端口")
            print("或者使用 --port 参数指定其他端口")
    
    # 创建并启动服务
    service = UnifiedBackendService()
    service.run(host=host, port=port, debug=debug)
