from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, Response
import uvicorn
import os
import sys
from typing import List, Dict, Any, Optional

# 导入服务模块
from services.biorhythm_service import (
    get_history, get_today_biorhythm, get_date_biorhythm, get_biorhythm_range
)
from services.dress_service import (
    get_today_dress_info, get_date_dress_info, get_dress_info_range
)
from utils.date_utils import normalize_date_string

app = FastAPI(title="生物节律API", description="计算和提供生物节律数据的API")

# 启用跨域资源共享
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# 创建生物节律路由器
biorhythm_router = APIRouter(
    prefix="/biorhythm",
    tags=["生物节律"],
    responses={404: {"description": "未找到"}},
)

# 创建穿衣与饮食建议路由器
dress_router = APIRouter(
    prefix="/dress",
    tags=["穿衣与饮食建议"],
    responses={404: {"description": "未找到"}},
)

@biorhythm_router.get("/history")
async def api_get_history():
    """获取历史查询的出生日期"""
    return {"history": get_history()}

@biorhythm_router.get("/today")
async def api_get_today_biorhythm(
    birth_date: str = Query(..., description="出生日期，格式为YYYY-MM-DD"),
    response: Response = None
):
    """获取今天的生物节律"""
    try:
        # 标准化日期字符串
        birth_date = normalize_date_string(birth_date)
        return get_today_biorhythm(birth_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@biorhythm_router.get("/date")
async def api_get_date_biorhythm(
    birth_date: str = Query(..., description="出生日期，格式为YYYY-MM-DD"),
    date: str = Query(..., description="目标日期，格式为YYYY-MM-DD")
):
    """获取指定日期的生物节律"""
    try:
        # 标准化日期字符串
        birth_date = normalize_date_string(birth_date)
        date = normalize_date_string(date)
        return get_date_biorhythm(birth_date, date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@biorhythm_router.get("/range")
async def api_get_biorhythm_range(
    birth_date: str = Query(..., description="出生日期，格式为YYYY-MM-DD"),
    days_before: int = Query(10, description="当前日期之前的天数"),
    days_after: int = Query(20, description="当前日期之后的天数")
):
    """获取一段时间内的生物节律"""
    try:
        # 标准化日期字符串
        birth_date = normalize_date_string(birth_date)
        return get_biorhythm_range(birth_date, days_before, days_after)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dress_router.get("/today")
async def api_get_today_dress_info():
    """获取今日穿衣颜色和饮食建议"""
    try:
        return get_today_dress_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dress_router.get("/date")
async def api_get_date_dress_info(
    date: str = Query(..., description="目标日期，格式为YYYY-MM-DD")
):
    """获取指定日期的穿衣颜色和饮食建议"""
    try:
        # 标准化日期字符串
        date = normalize_date_string(date)
        return get_date_dress_info(date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dress_router.get("/range")
async def api_get_dress_info_range(
    days_before: int = Query(1, description="当前日期之前的天数"),
    days_after: int = Query(6, description="当前日期之后的天数")
):
    """获取一段时间内的穿衣颜色和饮食建议"""
    try:
        return get_dress_info_range(days_before, days_after)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 为了向后兼容，保留原有的API路径
@app.get("/biorhythm/today")
async def legacy_get_today_biorhythm(birth_date: str = Query(...)):
    """旧版API路径，重定向到新路径"""
    return await api_get_today_biorhythm(birth_date)

@app.get("/biorhythm/date")
async def legacy_get_date_biorhythm(birth_date: str = Query(...), date: str = Query(...)):
    """旧版API路径，重定向到新路径"""
    return await api_get_date_biorhythm(birth_date, date)

@app.get("/biorhythm")
async def legacy_get_biorhythm_range(
    birth_date: str = Query(...),
    days_before: int = Query(10),
    days_after: int = Query(20)
):
    """旧版API路径，重定向到新路径"""
    return await api_get_biorhythm_range(birth_date, days_before, days_after)

@app.get("/health")
async def health_check():
    """健康检查端点，用于Docker容器监控"""
    return {"status": "healthy", "service": "biorhythm-backend"}

@app.get("/")
async def root():
    """API根路径，返回简单的欢迎信息"""
    return {
        "message": "欢迎使用生物节律API",
        "endpoints": {
            "生物节律": {
                "今日节律": "/biorhythm/today?birth_date=YYYY-MM-DD",
                "指定日期节律": "/biorhythm/date?birth_date=YYYY-MM-DD&date=YYYY-MM-DD",
                "日期范围节律": "/biorhythm/range?birth_date=YYYY-MM-DD&days_before=10&days_after=20",
                "历史记录": "/biorhythm/history"
            },
            "穿衣与饮食建议": {
                "今日建议": "/dress/today",
                "指定日期建议": "/dress/date?date=YYYY-MM-DD",
                "日期范围建议": "/dress/range?days_before=1&days_after=6"
            },
            "系统": {
                "健康检查": "/health"
            }
        }
    }

# 注册路由器
app.include_router(biorhythm_router)
app.include_router(dress_router)

if __name__ == '__main__':
    # 从环境变量获取端口，默认为5000
    port_str = os.environ.get('FLASK_RUN_PORT', '5000')
    
    # 处理可能包含额外文本的端口字符串
    try:
        # 尝试直接解析为整数
        port = int(port_str)
    except ValueError:
        # 如果解析失败，尝试提取字符串中的数字部分
        import re
        port_match = re.search(r'\d+', port_str)
        if port_match:
            port = int(port_match.group())
        else:
            # 如果无法提取数字，使用默认端口5000
            port = 5000
        print(f"警告: 端口值格式不正确，使用提取的端口: {port}")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
