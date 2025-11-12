#!/usr/bin/env python3
"""
MCP服务器 - stdio模式版本
专门用于通过stdio方式运行的MCP服务器
"""

import asyncio
import json
import logging
import os
import sys
from typing import Dict, Any, List, Optional

from pydantic import BaseModel, Field

from services.biorhythm_service import (
    get_history, get_today_biorhythm, get_date_biorhythm, get_biorhythm_range
)
from services.dress_service import (
    get_today_dress_info, get_date_dress_info, get_dress_info_range
)
from services.biorhythm_life_guide_service import (
    get_biorhythm_life_guide, get_today_biorhythm_guide
)
from utils.date_utils import normalize_date_string

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger("mcp_stdio_server")

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
    tool_schema: ToolSchema = Field(..., alias='schema')
    
    model_config = {
        "populate_by_name": True,  # Pydantic V2 兼容配置
        "validate_by_name": True   # 替代 allow_population_by_field_name
    }

class ServerInfo(BaseModel):
    name: str = "生物节律MCP服务器"
    version: str = "1.0.0"
    description: str = "提供生物节律和穿衣建议的MCP服务器"
    vendor: str = "Nice Day"
    tools: List[Tool] = []

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

biorhythm_life_guide_schema = ToolSchema(
    properties={
        "birth_date": {"type": "string", "description": "出生日期，格式为YYYY-MM-DD"},
        "location": {"type": "string", "description": "地理位置（可选）", "default": ""}
    },
    required=["birth_date"]
)

biorhythm_today_guide_schema = ToolSchema(
    properties={
        "birth_date": {"type": "string", "description": "出生日期，格式为YYYY-MM-DD"}
    },
    required=["birth_date"]
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
    ),
    Tool(
        name="get_biorhythm_life_guide",
        description="获取综合生物节律生活指南（包含生物节律、穿衣建议、饮食建议等）",
        schema=biorhythm_life_guide_schema
    ),
    Tool(
        name="get_today_biorhythm_guide",
        description="获取今日生物节律生活指南",
        schema=biorhythm_today_guide_schema
    )
]

# 创建服务器信息
server_info = ServerInfo(tools=tools)

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
        
        elif method == "get_biorhythm_life_guide":
            birth_date = normalize_date_string(params["birth_date"])
            location = params.get("location", "")
            return get_biorhythm_life_guide(birth_date, location)
        
        elif method == "get_today_biorhythm_guide":
            birth_date = normalize_date_string(params["birth_date"])
            return get_today_biorhythm_guide(birth_date)
        
        else:
            raise ValueError(f"未知的方法: {method}")
    
    except Exception as e:
        logger.error(f"处理工具调用时出错: {str(e)}", exc_info=True)
        raise e

# stdio模式的主循环
async def main():
    """stdio模式的主循环"""
    logger.info("🚀 MCP服务器启动 (stdio模式)")
    
    while True:
        try:
            # 从stdin读取请求
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
                
            line = line.strip()
            if not line:
                continue
            
            logger.info(f"收到请求: {line}")
            
            try:
                # 解析请求
                request_data = json.loads(line)
                request = MCPRequest(**request_data)
                
                # 处理请求
                if request.method == "initialize":
                    # 初始化响应
                    response = {
                        "jsonrpc": "2.0",
                        "id": request.id,
                        "result": {
                            "protocolVersion": "2025-06-18",
                            "capabilities": {},
                            "serverInfo": server_info.model_dump(by_alias=True)
                        }
                    }
                elif request.method == "tools/list":
                    # 工具列表响应
                    response = {
                        "jsonrpc": "2.0",
                        "id": request.id,
                        "result": {
                            "tools": [tool.model_dump(by_alias=True) for tool in tools]
                        }
                    }
                elif request.method == "tools/call":
                    # 工具调用
                    params = request.params
                    tool_name = params.get("name")
                    arguments = params.get("arguments", {})
                    
                    result = await handle_tool_call(tool_name, arguments)
                    response = {
                        "jsonrpc": "2.0",
                        "id": request.id,
                        "result": {
                            "content": [{
                                "type": "text",
                                "text": json.dumps(result, ensure_ascii=False, indent=2)
                            }]
                        }
                    }
                else:
                    # 未知方法
                    response = {
                        "jsonrpc": "2.0",
                        "id": request.id,
                        "error": {
                            "code": -32601,
                            "message": f"Method not found: {request.method}"
                        }
                    }
                
                # 发送响应
                response_line = json.dumps(response, ensure_ascii=False) + "\n"
                sys.stdout.write(response_line)
                sys.stdout.flush()
                logger.info(f"发送响应: {response_line.strip()}")
                
            except Exception as e:
                # 错误处理
                error_response = {
                    "jsonrpc": "2.0",
                    "id": request_data.get("id", "unknown"),
                    "error": {
                        "code": -32000,
                        "message": str(e)
                    }
                }
                error_line = json.dumps(error_response, ensure_ascii=False) + "\n"
                sys.stdout.write(error_line)
                sys.stdout.flush()
                logger.error(f"处理请求时出错: {str(e)}", exc_info=True)
        
        except Exception as e:
            logger.error(f"处理消息时出错: {str(e)}", exc_info=True)
            break

if __name__ == "__main__":
    asyncio.run(main())