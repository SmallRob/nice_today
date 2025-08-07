#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
端口检查脚本
用于检查端口占用情况和测试服务启动
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.port_utils import is_port_available, find_available_port, get_port_info

def main():
    print("=" * 50)
    print("端口检查工具")
    print("=" * 50)
    
    # 检查常用端口
    common_ports = [5000, 5001, 5002, 8000, 8080]
    
    print("检查常用端口状态:")
    for port in common_ports:
        available = is_port_available('0.0.0.0', port)
        status = "可用" if available else "占用"
        print(f"  端口 {port}: {status}")
        
        if not available:
            port_info = get_port_info(port)
            if port_info.get('occupied'):
                print(f"    占用进程: {port_info.get('command', 'unknown')} (PID: {port_info.get('pid', 'unknown')})")
    
    print("\n" + "-" * 50)
    
    # 查找可用端口
    print("查找可用端口:")
    available_port = find_available_port('0.0.0.0', 5000, 10)
    if available_port != -1:
        print(f"  推荐使用端口: {available_port}")
        print(f"  启动命令: python app.py --port {available_port}")
    else:
        print("  未找到可用端口")
    
    print("=" * 50)

if __name__ == '__main__':
    main()