#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
服务测试脚本
用于测试统一后端服务的各个接口
"""

import requests
import json
import sys
from datetime import datetime

def test_endpoint(url, method='GET', data=None, description=""):
    """测试API端点"""
    try:
        print(f"测试: {description}")
        print(f"请求: {method} {url}")
        
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=5)
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"响应: {json.dumps(result, ensure_ascii=False, indent=2)[:200]}...")
            print("✅ 成功")
        else:
            print(f"❌ 失败: {response.text}")
        
        print("-" * 50)
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ 异常: {str(e)}")
        print("-" * 50)
        return False

def main():
    # 从命令行参数获取端口，默认5002
    port = sys.argv[1] if len(sys.argv) > 1 else "5002"
    base_url = f"http://localhost:{port}"
    
    print("=" * 60)
    print(f"统一后端服务测试 - 端口: {port}")
    print("=" * 60)
    
    # 测试用例
    tests = [
        # 基础接口
        (f"{base_url}/", "GET", None, "根路径"),
        (f"{base_url}/health", "GET", None, "健康检查"),
        
        # 生物节律接口
        (f"{base_url}/biorhythm/today?birth_date=1990-01-01", "GET", None, "今日生物节律"),
        (f"{base_url}/biorhythm/history", "GET", None, "生物节律历史"),
        
        # 玛雅历法接口
        (f"{base_url}/maya/today", "GET", None, "今日玛雅信息"),
        (f"{base_url}/api/maya/birth-info", "POST", {"birth_date": "1990-01-01"}, "玛雅出生图"),
        
        # 穿搭建议接口
        (f"{base_url}/dress/today", "GET", None, "今日穿搭建议"),
    ]
    
    success_count = 0
    total_count = len(tests)
    
    for url, method, data, description in tests:
        if test_endpoint(url, method, data, description):
            success_count += 1
    
    print("=" * 60)
    print(f"测试结果: {success_count}/{total_count} 成功")
    
    if success_count == total_count:
        print("🎉 所有测试通过！服务运行正常")
    else:
        print("⚠️  部分测试失败，请检查服务状态")
    
    print("=" * 60)

if __name__ == '__main__':
    main()