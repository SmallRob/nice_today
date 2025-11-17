import pytest
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from fastapi.testclient import TestClient
from app import UnifiedBackendService

# 创建测试客户端
@pytest.fixture
def client():
    service = UnifiedBackendService()
    with TestClient(service.app) as client:
        yield client

def test_api_endpoints_endpoint(client):
    """测试获取API端点信息接口"""
    response = client.get("/api/management/endpoints")
    assert response.status_code == 200
    data = response.json()
    assert "endpoints" in data
    assert isinstance(data["endpoints"], list)
    # 检查至少有一些端点被返回
    assert len(data["endpoints"]) > 0

def test_service_status_endpoint(client):
    """测试服务状态接口"""
    response = client.get("/api/management/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "timestamp" in data
    # 检查状态是运行中或错误
    assert data["status"] in ["running", "error"]

def test_api_test_endpoint(client):
    """测试API测试接口"""
    # 测试一个简单的GET请求
    test_data = {
        "endpoint": "/health",
        "method": "GET",
        "params": {}
    }
    response = client.post("/api/management/test", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "success" in data

def test_api_login_endpoint(client):
    """测试API管理登录接口"""
    # 设置环境变量用于测试
    os.environ['ADMIN_USERNAME'] = 'test_admin'
    os.environ['ADMIN_PASSWORD'] = 'test_password'
    
    # 测试正确的凭据
    login_data = {
        "username": "test_admin",
        "password": "test_password"
    }
    response = client.post("/api/management/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert data["success"] == True

    # 测试错误的凭据
    login_data = {
        "username": "wrong_user",
        "password": "wrong_password"
    }
    response = client.post("/api/management/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert data["success"] == False

def test_api_logout_endpoint(client):
    """测试API管理登出接口"""
    response = client.post("/api/management/logout")
    assert response.status_code == 200
    data = response.json()
    assert "success" in data