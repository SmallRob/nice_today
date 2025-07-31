import asyncio
import json
import logging
import os
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.biorhythm_service import (
    get_history, get_today_biorhythm, get_date_biorhythm, get_biorhythm_range
)
from services.dress_service import (
    get_today_dress_info, get_date_dress_info, get_dress_info_range
)
from utils.date_utils import normalize_date_string

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("mcp_server.log")
    ]
)
logger = logging.getLogger("mcp_server")

# 创建FastAPI应用
app = FastAPI(title="生物节律MCP服务器", description="提供生物节律数据的MCP服务器")

# 启用跨域资源共享
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# MCP协议相关模型
class MCPRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: str
    method: str
    params: Dict[str, Any] = {}

class MCPResponse(BaseModel):
    jsonrpc: str = "2.0"
    id: str
    result: Any = None
    error: Optional[Dict[str, Any]] = None

class MCPError(BaseModel):
    code: int
    message: str
    data: Optional[Any] = None

class ToolSchema(BaseModel):
    type: str = "object"
    properties: Dict[str, Any]
    required: List[str] = []

class Tool(BaseModel):
    name: str
    description: str
    # 修改字段名，使用alias保持与MCP协议的兼容性
    tool_schema: ToolSchema = Field(..., alias='schema')
    
    class Config:
        # 允许通过别名访问字段
        allow_population_by_field_name = True

class ServerInfo(BaseModel):
    name: str = "生物节律MCP服务器"
    version: str = "1.0.0"
    description: str = "提供生物节律和穿衣建议的MCP服务器"
    vendor: str = "Nice Day"
    tools: List[Tool] = []
    resources: List[Dict[str, Any]] = []

# 定义工具模式
biorhythm_today_schema = ToolSchema(
    properties={
        "birth_date": {"type": "string", "description": "出生日期，格式为YYYY-MM-DD"}
    },
    required=["birth_date"]
)

biorhythm_date_schema = ToolSchema(
    properties={
        "birth_date": {"type": "string", "description": "出生日期，格式为YYYY-MM-DD"},
        "date": {"type": "string", "description": "目标日期，格式为YYYY-MM-DD"}
    },
    required=["birth_date", "date"]
)

biorhythm_range_schema = ToolSchema(
    properties={
        "birth_date": {"type": "string", "description": "出生日期，格式为YYYY-MM-DD"},
        "days_before": {"type": "integer", "description": "当前日期之前的天数", "default": 10},
        "days_after": {"type": "integer", "description": "当前日期之后的天数", "default": 20}
    },
    required=["birth_date"]
)

dress_date_schema = ToolSchema(
    properties={
        "date": {"type": "string", "description": "目标日期，格式为YYYY-MM-DD"}
    },
    required=["date"]
)

dress_range_schema = ToolSchema(
    properties={
        "days_before": {"type": "integer", "description": "当前日期之前的天数", "default": 1},
        "days_after": {"type": "integer", "description": "当前日期之后的天数", "default": 6}
    }
)

# 定义工具列表
tools = [
    Tool(
        name="get_biorhythm_today",
        description="获取今天的生物节律",
        schema=biorhythm_today_schema
    ),
    Tool(
        name="get_biorhythm_date",
        description="获取指定日期的生物节律",
        schema=biorhythm_date_schema
    ),
    Tool(
        name="get_biorhythm_range",
        description="获取一段时间内的生物节律",
        schema=biorhythm_range_schema
    ),
    Tool(
        name="get_dress_today",
        description="获取今日穿衣颜色和饮食建议",
        schema=ToolSchema(properties={})
    ),
    Tool(
        name="get_dress_date",
        description="获取指定日期的穿衣颜色和饮食建议",
        schema=dress_date_schema
    ),
    Tool(
        name="get_dress_range",
        description="获取一段时间内的穿衣颜色和饮食建议",
        schema=dress_range_schema
    ),
    Tool(
        name="get_history",
        description="获取历史查询的出生日期",
        schema=ToolSchema(properties={})
    )
]

# 创建服务器信息
server_info = ServerInfo(tools=tools)

# 连接管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"客户端连接成功，当前连接数: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"客户端断开连接，当前连接数: {len(self.active_connections)}")

manager = ConnectionManager()

# 工具处理函数
async def handle_tool_call(method: str, params: Dict[str, Any]) -> Any:
    try:
        if method == "get_biorhythm_today":
            birth_date = normalize_date_string(params["birth_date"])
            return get_today_biorhythm(birth_date)
        
        elif method == "get_biorhythm_date":
            birth_date = normalize_date_string(params["birth_date"])
            date = normalize_date_string(params["date"])
            return get_date_biorhythm(birth_date, date)
        
        elif method == "get_biorhythm_range":
            birth_date = normalize_date_string(params["birth_date"])
            days_before = params.get("days_before", 10)
            days_after = params.get("days_after", 20)
            return get_biorhythm_range(birth_date, days_before, days_after)
        
        elif method == "get_dress_today":
            return get_today_dress_info()
        
        elif method == "get_dress_date":
            date = normalize_date_string(params["date"])
            return get_date_dress_info(date)
        
        elif method == "get_dress_range":
            days_before = params.get("days_before", 1)
            days_after = params.get("days_after", 6)
            return get_dress_info_range(days_before, days_after)
        
        elif method == "get_history":
            return {"history": get_history()}
        
        else:
            raise ValueError(f"未知的方法: {method}")
    
    except Exception as e:
        logger.error(f"处理工具调用时出错: {str(e)}", exc_info=True)
        raise e

# WebSocket端点
@app.websocket("/mcp")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            logger.info(f"收到消息: {data}")
            
            try:
                # 解析请求
                request_data = json.loads(data)
                request = MCPRequest(**request_data)
                
                # 处理请求
                if request.method == "server.info":
                    # 返回服务器信息
                    response = MCPResponse(
                        id=request.id,
                        result=server_info.dict(by_alias=True)  # 使用别名
                    )
                else:
                    # 处理工具调用
                    result = await handle_tool_call(request.method, request.params)
                    response = MCPResponse(
                        id=request.id,
                        result=result
                    )
                
                # 发送响应
                await websocket.send_text(json.dumps(response.dict(by_alias=True)))  # 使用别名
                logger.info(f"发送响应: {response}")
                
            except Exception as e:
                # 处理错误
                error = MCPError(
                    code=500,
                    message=str(e)
                )
                response = MCPResponse(
                    id=request_data.get("id", "unknown"),
                    error=error.dict()
                )
                await websocket.send_text(json.dumps(response.dict()))
                logger.error(f"处理请求时出错: {str(e)}", exc_info=True)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket连接已关闭")

# HTTP端点，用于健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy", "server": server_info.name, "version": server_info.version}

# 主页
@app.get("/")
async def root():
    return {
        "message": "欢迎使用生物节律MCP服务器",
        "description": server_info.description,
        "version": server_info.version,
        "websocket_endpoint": "/mcp",
        "health_check": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("MCP_PORT", 8765))
    uvicorn.run(app, host="0.0.0.0", port=port)