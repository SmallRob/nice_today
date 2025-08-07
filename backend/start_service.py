#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一后端服务启动脚本
提供便捷的服务启动和管理功能
"""

import os
import sys
import argparse
from app import UnifiedBackendService

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='启动统一后端服务')
    parser.add_argument('--host', default='0.0.0.0', help='服务主机地址 (默认: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=5000, help='服务端口 (默认: 5000)')
    parser.add_argument('--debug', action='store_true', help='启用调试模式')
    parser.add_argument('--env', choices=['dev', 'prod'], default='dev', help='运行环境 (默认: dev)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("统一后端服务启动脚本")
    print("=" * 60)
    print(f"服务地址: http://{args.host}:{args.port}")
    print(f"运行环境: {args.env}")
    print(f"调试模式: {'开启' if args.debug else '关闭'}")
    print("=" * 60)
    
    # 设置环境变量
    os.environ['HOST'] = args.host
    os.environ['PORT'] = str(args.port)
    os.environ['DEBUG'] = str(args.debug).lower()
    os.environ['ENV'] = args.env
    
    try:
        # 创建并启动服务
        service = UnifiedBackendService()
        service.run(host=args.host, port=args.port, debug=args.debug)
    except KeyboardInterrupt:
        print("\n服务已停止")
    except Exception as e:
        print(f"服务启动失败: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()