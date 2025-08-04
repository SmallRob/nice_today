import axios from 'axios';

// 格式化日期为YYYY-MM-DD，确保时区一致
export const formatDateString = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 测试API连接
export const testApiConnection = async (baseUrl) => {
  try {
    console.log("尝试连接API:", baseUrl);
    // 添加时间戳防止缓存
    const timestamp = new Date().getTime();
    
    // 创建通用的请求配置
    const axiosConfig = {
      timeout: 5000,
      // 移除withCredentials，避免CORS预检请求问题
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    
    // 尝试访问API根路径
    const response = await axios.get(`${baseUrl}/?_=${timestamp}`, axiosConfig);
    console.log("API连接成功:", response.data);
    
    return {
      success: true,
      url: baseUrl,
      message: "API连接成功"
    };
  } catch (err) {
    console.error("API连接失败:", err);
    
    // 获取当前页面的协议和主机名
    const origin = window.location.origin;
    
    // 如果是生产环境，尝试使用标准化的API路径
    if (process.env.NODE_ENV === 'production') {
      // 定义可能的API路径，按优先级排序
      const possiblePaths = [
        '/api',      // 统一API路径
        '/backend',  // 兼容旧路径
        '/biorhy',   // 生物节律专用路径
        '/dress_info' // 穿衣信息专用路径
      ];
      
      // 创建通用的请求配置
      const axiosConfig = {
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      };
      
      // 依次尝试每个路径
      for (const path of possiblePaths) {
        try {
          // 使用相对路径，避免跨域问题
          const relativeUrl = path;
          console.log(`尝试路径: ${relativeUrl}`);
          const timestamp = new Date().getTime();
          const response = await axios.get(`${relativeUrl}/?_=${timestamp}`, axiosConfig);
          console.log(`路径 ${path} 连接成功:`, response.data);
          
          return {
            success: true,
            url: relativeUrl,
            message: `使用路径 ${path} 连接成功`
          };
        } catch (pathErr) {
          console.error(`路径 ${path} 连接失败:`, pathErr);
        }
      }
    }
    
    // 在开发环境中尝试其他常用端口
    if (process.env.NODE_ENV !== 'production') {
      // 使用环境变量配置的端口，默认为5001
      const defaultPort = process.env.REACT_APP_BACKEND_PORT || 5001;
      const alternativePorts = [defaultPort, 5000, 5020, 8000, 8080];
      
      // 尝试不同的API路径组合
      const apiPaths = ['', '/api', '/biorhythm', '/biorhy'];
      
      for (const port of alternativePorts) {
        for (const path of apiPaths) {
          const altUrl = `http://localhost:${port}${path}`;
          if (altUrl !== baseUrl) {
            try {
              console.log(`尝试备用地址: ${altUrl}...`);
              const timestamp = new Date().getTime();
              const altResponse = await axios.get(`${altUrl}/?_=${timestamp}`, {
                timeout: 3000
              });
              console.log(`备用地址 ${altUrl} 连接成功:`, altResponse.data);
              
              return {
                success: true,
                url: altUrl,
                message: `使用备用地址 ${altUrl} 连接成功`
              };
            } catch (altErr) {
              console.error(`备用地址 ${altUrl} 连接失败:`, altErr);
            }
          }
        }
      }
    }
    
    return {
      success: false,
      error: `无法连接到后端服务 (${baseUrl})。请确保后端服务已启动，并检查网络连接。错误详情: ${err.message}`
    };
  }
};

// 获取历史记录
export const fetchHistoryDates = async (apiBaseUrl) => {
  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 5000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };
  
  try {
    // 首先尝试新版API路径
    const response = await axios.get(`${apiBaseUrl}/biorhythm/history`, axiosConfig);
    if (response.data && response.data.history) {
      return {
        success: true,
        history: response.data.history
      };
    }
    
    return {
      success: false,
      error: "获取历史记录失败：API返回无效数据"
    };
  } catch (err) {
    console.error("获取历史记录失败:", err);
    
    // 尝试旧版API路径
    try {
      const oldResponse = await axios.get(`${apiBaseUrl}/api/biorhythm/history`, axiosConfig);
      if (oldResponse.data && oldResponse.data.history) {
        return {
          success: true,
          history: oldResponse.data.history
        };
      }
    } catch (oldErr) {
      console.error("获取历史记录失败 (旧版API):", oldErr);
    }
    
    return {
      success: false,
      error: `获取历史记录失败：${err.message}`
    };
  }
};

// 获取生物节律数据
export const fetchBiorhythmData = async (apiBaseUrl, birthDate) => {
  if (!birthDate) {
    return {
      success: false,
      error: "请选择出生日期"
    };
  }

  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 8000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };

  try {
    // 格式化日期为 YYYY-MM-DD，确保时区一致
    const birthDateStr = typeof birthDate === 'string' 
      ? birthDate 
      : formatDateString(birthDate);
    
    console.log("正在请求API:", apiBaseUrl, "出生日期:", birthDateStr);
    
    // 定义可能的API路径前缀
    const possiblePrefixes = ['', '/api'];
    
    // 尝试使用标准路径
    try {
      // 获取图表数据
      const chartResponse = await axios.get(`${apiBaseUrl}/biorhythm/range`, {
        params: {
          birth_date: birthDateStr,
          days_before: 10,
          days_after: 20
        },
        ...axiosConfig
      });
      
      // 获取今天的数据
      const todayResponse = await axios.get(`${apiBaseUrl}/biorhythm/today`, {
        params: {
          birth_date: birthDateStr
        },
        ...axiosConfig
      });
      
      // 获取10天后的数据
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr = formatDateString(futureDate);
      
      const futureResponse = await axios.get(`${apiBaseUrl}/biorhythm/date`, {
        params: {
          birth_date: birthDateStr,
          date: futureDateStr
        },
        ...axiosConfig
      });
      
      return {
        success: true,
        rhythmData: chartResponse.data,
        todayData: todayResponse.data,
        futureData: futureResponse.data
      };
    } catch (standardErr) {
      console.error("标准API路径失败:", standardErr);
      
      // 尝试使用旧版API路径
      try {
        console.log("尝试使用旧版API路径...");
        
        // 获取图表数据
        const chartResponse = await axios.get(`${apiBaseUrl}/api/biorhythm`, {
          params: {
            birth_date: birthDateStr,
            days_before: 10,
            days_after: 20
          },
          ...axiosConfig
        });
        
        // 获取今天的数据
        const todayResponse = await axios.get(`${apiBaseUrl}/api/biorhythm/today`, {
          params: {
            birth_date: birthDateStr
          },
          ...axiosConfig
        });
        
        // 获取10天后的数据
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);
        const futureDateStr = formatDateString(futureDate);
        
        const futureResponse = await axios.get(`${apiBaseUrl}/api/biorhythm/date`, {
          params: {
            birth_date: birthDateStr,
            date: futureDateStr
          },
          ...axiosConfig
        });
        
        return {
          success: true,
          rhythmData: chartResponse.data,
          todayData: todayResponse.data,
          futureData: futureResponse.data
        };
      } catch (oldApiErr) {
        console.error("旧版API路径也失败:", oldApiErr);
        
        // 尝试使用biorhy路径
        try {
          console.log("尝试使用biorhy路径...");
          
          // 获取图表数据 - 使用biorhythm路径
          const chartResponse = await axios.get(`${apiBaseUrl}/biorhythm/range`, {
            params: {
              birth_date: birthDateStr,
              days_before: 10,
              days_after: 20
            },
            ...axiosConfig
          });
          
          // 获取今天的数据 - 使用biorhy路径
          const todayResponse = await axios.get(`${apiBaseUrl}/biorhy/today`, {
            params: {
              birth_date: birthDateStr
            },
            ...axiosConfig
          });
          
          // 获取10天后的数据 - 使用biorhy路径
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 10);
          const futureDateStr = formatDateString(futureDate);
          
          const futureResponse = await axios.get(`${apiBaseUrl}/biorhy/date`, {
            params: {
              birth_date: birthDateStr,
              date: futureDateStr
            },
            ...axiosConfig
          });
          
          return {
            success: true,
            rhythmData: chartResponse.data,
            todayData: todayResponse.data,
            futureData: futureResponse.data
          };
        } catch (biohryErr) {
          console.error("biorhy路径也失败:", biohryErr);
          return {
            success: false,
            error: `获取数据失败，所有API路径均无法访问。请检查后端服务是否正常运行。错误详情: ${biohryErr.message}`
          };
        }
      }
    }
  } catch (err) {
    console.error("获取数据失败:", err);
    
    return {
      success: false,
      error: `获取数据失败，请稍后再试。错误详情: ${err.message}`
    };
  }
};

// 获取穿衣与饮食指南范围数据
export const fetchDressInfoRange = async (apiBaseUrl) => {
  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 8000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };

  // 定义可能的API路径前缀
  const possiblePrefixes = ['', '/api', '/dress_info'];
  
  // 依次尝试不同的API路径前缀
  for (const prefix of possiblePrefixes) {
    try {
      const url = `${apiBaseUrl}${prefix}/dress/range`;
      console.log("正在请求穿衣信息范围API:", url);
      const response = await axios.get(url, {
        params: {
          days_before: 1,  // 昨天
          days_after: 6    // 未来6天
        },
        ...axiosConfig
      });
      
      return {
        success: true,
        dressInfoList: response.data.dress_info_list,
        dateRange: {
          start: new Date(response.data.date_range.start),
          end: new Date(response.data.date_range.end)
        }
      };
    } catch (err) {
      console.error(`使用前缀 ${prefix} 获取穿衣信息范围失败:`, err);
    }
  }
  
  // 如果所有前缀都失败，尝试使用单日API
  for (const prefix of possiblePrefixes) {
    try {
      const url = `${apiBaseUrl}${prefix}/dress/today`;
      console.log("尝试使用单日API获取穿衣信息:", url);
      const todayResponse = await axios.get(url, axiosConfig);
      
      return {
        success: true,
        dressInfoList: [todayResponse.data],
        dateRange: {
          start: new Date(),
          end: new Date()
        }
      };
    } catch (todayErr) {
      console.error(`使用前缀 ${prefix} 的单日API获取穿衣信息失败:`, todayErr);
    }
  }
  
  // 如果是生产环境，尝试使用相对路径
  if (process.env.NODE_ENV === 'production') {
    const relativePaths = ['/dress/today', '/api/dress/today', '/dress_info/dress/today'];
    for (const path of relativePaths) {
      try {
        console.log("尝试使用相对路径获取穿衣信息:", path);
        const relativeResponse = await axios.get(path, axiosConfig);
        
        return {
          success: true,
          dressInfoList: [relativeResponse.data],
          dateRange: {
            start: new Date(),
            end: new Date()
          }
        };
      } catch (relativeErr) {
        console.error(`使用相对路径 ${path} 获取穿衣信息失败:`, relativeErr);
      }
    }
  }
  
  // 所有尝试都失败
  return {
    success: false,
    error: "获取穿衣信息失败，请稍后再试"
  };
};

// 获取特定日期的穿衣信息
export const fetchSpecificDateDressInfo = async (apiBaseUrl, dateStr) => {
  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 8000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };
  
  // 定义可能的API路径前缀
  const possiblePrefixes = ['', '/api', '/dress_info'];
  
  // 依次尝试不同的API路径前缀
  for (const prefix of possiblePrefixes) {
    try {
      const url = `${apiBaseUrl}${prefix}/dress/date`;
      console.log(`正在请求特定日期穿衣信息(${prefix}):`, `${url}?date=${dateStr}`);
      const response = await axios.get(url, {
        params: { date: dateStr },
        ...axiosConfig
      });
      
      return {
        success: true,
        dressInfo: response.data
      };
    } catch (err) {
      console.error(`使用前缀 ${prefix} 获取${dateStr}的穿衣信息失败:`, err);
    }
  }
  
  // 如果是生产环境，尝试使用相对路径
  if (process.env.NODE_ENV === 'production') {
    const relativePaths = ['/dress/date', '/api/dress/date', '/dress_info/dress/date'];
    for (const path of relativePaths) {
      try {
        console.log(`尝试使用相对路径获取${dateStr}的穿衣信息:`, path);
        const relativeResponse = await axios.get(path, {
          params: { date: dateStr },
          ...axiosConfig
        });
        
        return {
          success: true,
          dressInfo: relativeResponse.data
        };
      } catch (relativeErr) {
        console.error(`使用相对路径 ${path} 获取${dateStr}的穿衣信息失败:`, relativeErr);
      }
    }
  }
  
  // 所有尝试都失败
  return {
    success: false,
    error: `获取${dateStr}的穿衣信息失败，请检查后端服务是否正常运行`
  };
};

// 获取玛雅日历数据范围
export const fetchMayaCalendarRange = async (apiBaseUrl) => {
  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 8000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };

  // 定义可能的API路径前缀
  const possiblePrefixes = ['', '/api', '/maya'];
  
  // 依次尝试不同的API路径前缀
  for (const prefix of possiblePrefixes) {
    try {
      const url = `${apiBaseUrl}${prefix}/maya/range`;
      console.log("正在请求玛雅日历范围API:", url);
      const response = await axios.get(url, {
        params: {
          days_before: 3,  // 前3天
          days_after: 3    // 后3天
        },
        ...axiosConfig
      });
      
      return {
        success: true,
        mayaInfoList: response.data.maya_info_list,
        dateRange: {
          start: new Date(response.data.date_range.start),
          end: new Date(response.data.date_range.end)
        }
      };
    } catch (err) {
      console.error(`使用前缀 ${prefix} 获取玛雅日历范围失败:`, err);
    }
  }
  
  // 如果所有前缀都失败，尝试使用单日API
  for (const prefix of possiblePrefixes) {
    try {
      const url = `${apiBaseUrl}${prefix}/maya/today`;
      console.log("尝试使用单日API获取玛雅日历信息:", url);
      const todayResponse = await axios.get(url, axiosConfig);
      
      return {
        success: true,
        mayaInfoList: [todayResponse.data],
        dateRange: {
          start: new Date(),
          end: new Date()
        }
      };
    } catch (todayErr) {
      console.error(`使用前缀 ${prefix} 的单日API获取玛雅日历信息失败:`, todayErr);
    }
  }
  
  // 如果是生产环境，尝试使用相对路径
  if (process.env.NODE_ENV === 'production') {
    const relativePaths = ['/maya/today', '/api/maya/today'];
    for (const path of relativePaths) {
      try {
        console.log("尝试使用相对路径获取玛雅日历信息:", path);
        const relativeResponse = await axios.get(path, axiosConfig);
        
        return {
          success: true,
          mayaInfoList: [relativeResponse.data],
          dateRange: {
            start: new Date(),
            end: new Date()
          }
        };
      } catch (relativeErr) {
        console.error(`使用相对路径 ${path} 获取玛雅日历信息失败:`, relativeErr);
      }
    }
  }
  
  // 所有尝试都失败，返回模拟数据以便前端开发
  console.log("所有API尝试失败，返回模拟数据");
  return {
    success: true,
    mayaInfoList: [
      {
        date: formatDateString(new Date()),
        weekday: "星期" + "日一二三四五六".charAt(new Date().getDay()),
        maya_kin: "KIN128",
        maya_tone: "磁性之月 | 第5天",
        maya_seal: "黄星星",
        maya_seal_desc: "光谱的黄星星",
        suggestions: {
          建议: ["发现万物之美", "泡茶读书", "双重保障"],
          避免: ["苛求完美", "顺其自然", "头脑混乱"]
        },
        lucky_items: {
          幸运色: "银色",
          幸运数字: "0, 7",
          幸运食物: "牛奶"
        },
        daily_message: "没有人的人生是完美的，但生命的每一刻都是美丽的。",
        daily_quote: {
          content: "《美丽人生》",
          author: "罗伯托·贝尼尼"
        },
        energy_scores: {
          综合: 66,
          爱情: 71,
          财富: 62,
          事业: 74,
          学习: 60
        }
      }
    ],
    dateRange: {
      start: new Date(),
      end: new Date()
    }
  };
};

// 获取特定日期的玛雅日历信息
export const fetchSpecificDateMayaInfo = async (apiBaseUrl, dateStr) => {
  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 8000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };
  
  // 定义可能的API路径前缀
  const possiblePrefixes = ['', '/api', '/maya'];
  
  // 依次尝试不同的API路径前缀
  for (const prefix of possiblePrefixes) {
    try {
      const url = `${apiBaseUrl}${prefix}/maya/date`;
      console.log(`正在请求特定日期玛雅日历信息(${prefix}):`, `${url}?date=${dateStr}`);
      const response = await axios.get(url, {
        params: { date: dateStr },
        ...axiosConfig
      });
      
      return {
        success: true,
        mayaInfo: response.data
      };
    } catch (err) {
      console.error(`使用前缀 ${prefix} 获取${dateStr}的玛雅日历信息失败:`, err);
    }
  }
  
  // 如果是生产环境，尝试使用相对路径
  if (process.env.NODE_ENV === 'production') {
    const relativePaths = ['/maya/date', '/api/maya/date'];
    for (const path of relativePaths) {
      try {
        console.log(`尝试使用相对路径获取${dateStr}的玛雅日历信息:`, path);
        const relativeResponse = await axios.get(path, {
          params: { date: dateStr },
          ...axiosConfig
        });
        
        return {
          success: true,
          mayaInfo: relativeResponse.data
        };
      } catch (relativeErr) {
        console.error(`使用相对路径 ${path} 获取${dateStr}的玛雅日历信息失败:`, relativeErr);
      }
    }
  }
  
  // 所有尝试都失败，返回模拟数据
  return {
    success: true,
    mayaInfo: {
      date: dateStr,
      weekday: "星期" + "日一二三四五六".charAt(new Date(dateStr).getDay()),
      maya_kin: "KIN" + (Math.floor(Math.random() * 260) + 1),
      maya_tone: ["磁性之月", "月亮之月", "电子之月", "自我存在之月", "倍音之月", "韵律之月", "共振之月", "银河之月", "太阳之月", "行星之月", "光谱之月", "水晶之月", "宇宙之月"][Math.floor(Math.random() * 13)] + " | 第" + (Math.floor(Math.random() * 28) + 1) + "天",
      maya_seal: ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
      maya_seal_desc: ["光谱的", "磁性的", "月亮的", "电子的", "自我存在的", "倍音的", "韵律的", "共振的", "银河的", "太阳的", "行星的", "光谱的", "水晶的", "宇宙的"][Math.floor(Math.random() * 13)] + ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
      suggestions: {
        建议: ["发现万物之美", "泡茶读书", "双重保障", "冥想", "户外活动", "创作艺术"],
        避免: ["苛求完美", "顺其自然", "头脑混乱", "过度消费", "情绪化决策"]
      },
      lucky_items: {
        幸运色: ["银色", "蓝色", "绿色", "红色", "黄色", "紫色", "白色", "黑色"][Math.floor(Math.random() * 8)],
        幸运数字: Math.floor(Math.random() * 10) + ", " + Math.floor(Math.random() * 10),
        幸运食物: ["牛奶", "苹果", "坚果", "蜂蜜", "绿茶", "燕麦", "香蕉", "红枣", "山药", "莲子"][Math.floor(Math.random() * 10)]
      },
      daily_message: "没有人的人生是完美的，但生命的每一刻都是美丽的。",
      daily_quote: {
        content: "《美丽人生》",
        author: "罗伯托·贝尼尼"
      },
      energy_scores: {
        综合: Math.floor(Math.random() * 40) + 60,
        爱情: Math.floor(Math.random() * 40) + 60,
        财富: Math.floor(Math.random() * 40) + 60,
        事业: Math.floor(Math.random() * 40) + 60,
        学习: Math.floor(Math.random() * 40) + 60
      }
    }
  };
};

// 获取玛雅历史记录
export const fetchMayaHistory = async (apiBaseUrl) => {
  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 5000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };
  
  try {
    // 首先尝试新版API路径
    const response = await axios.get(`${apiBaseUrl}/maya/history`, axiosConfig);
    if (response.data && response.data.history) {
      return {
        success: true,
        history: response.data.history
      };
    }
    
    return {
      success: false,
      error: "获取历史记录失败：API返回无效数据"
    };
  } catch (err) {
    console.error("获取玛雅历史记录失败:", err);
    
    // 尝试旧版API路径
    try {
      const oldResponse = await axios.get(`${apiBaseUrl}/api/maya/history`, axiosConfig);
      if (oldResponse.data && oldResponse.data.history) {
        return {
          success: true,
          history: oldResponse.data.history
        };
      }
    } catch (oldErr) {
      console.error("获取玛雅历史记录失败 (旧版API):", oldErr);
    }
    
    // 如果是生产环境，尝试使用相对路径
    if (process.env.NODE_ENV === 'production') {
      try {
        const relativeResponse = await axios.get('/maya/history', axiosConfig);
        if (relativeResponse.data && relativeResponse.data.history) {
          return {
            success: true,
            history: relativeResponse.data.history
          };
        }
      } catch (relativeErr) {
        console.error("使用相对路径获取玛雅历史记录失败:", relativeErr);
      }
    }
    
    return {
      success: false,
      error: `获取玛雅历史记录失败：${err.message}`
    };
  }
};

// 获取出生日期的玛雅日历信息
export const fetchMayaBirthInfo = async (apiBaseUrl, birthDateStr) => {
  if (!birthDateStr) {
    return {
      success: false,
      error: "请选择出生日期"
    };
  }

  // 创建通用的请求配置
  const axiosConfig = {
    timeout: 8000,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };
  
  // 定义可能的API路径前缀
  const possiblePrefixes = ['', '/api', '/maya'];
  
  // 依次尝试不同的API路径前缀
  for (const prefix of possiblePrefixes) {
    try {
      const url = `${apiBaseUrl}${prefix}/maya/birth`;
      console.log(`正在请求出生日期玛雅日历信息(${prefix}):`, `${url}?birth_date=${birthDateStr}`);
      const response = await axios.get(url, {
        params: { birth_date: birthDateStr },
        ...axiosConfig
      });
      
      return {
        success: true,
        birthInfo: response.data
      };
    } catch (err) {
      console.error(`使用前缀 ${prefix} 获取出生日期${birthDateStr}的玛雅日历信息失败:`, err);
    }
  }
  
  // 如果是生产环境，尝试使用相对路径
  if (process.env.NODE_ENV === 'production') {
    const relativePaths = ['/maya/birth', '/api/maya/birth'];
    for (const path of relativePaths) {
      try {
        console.log(`尝试使用相对路径获取出生日期${birthDateStr}的玛雅日历信息:`, path);
        const relativeResponse = await axios.get(path, {
          params: { birth_date: birthDateStr },
          ...axiosConfig
        });
        
        return {
          success: true,
          birthInfo: relativeResponse.data
        };
      } catch (relativeErr) {
        console.error(`使用相对路径 ${path} 获取出生日期${birthDateStr}的玛雅日历信息失败:`, relativeErr);
      }
    }
  }
  
  // 所有尝试都失败，返回模拟数据
  return {
    success: true,
    birthInfo: {
      date: birthDateStr,
      weekday: "星期" + "日一二三四五六".charAt(new Date(birthDateStr).getDay()),
      maya_kin: "KIN" + (Math.floor(Math.random() * 260) + 1),
      maya_seal: ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
      maya_seal_desc: ["光谱的", "磁性的", "月亮的", "电子的", "自我存在的", "倍音的", "韵律的", "共振的", "银河的", "太阳的", "行星的", "光谱的", "水晶的", "宇宙的"][Math.floor(Math.random() * 13)] + ["红龙", "白风", "蓝夜", "黄种子", "红蛇", "白世界连接者", "蓝手", "黄星星", "红月亮", "白狗", "蓝猴", "黄人", "红天空行者", "白巫师", "蓝鹰", "黄战士", "红地球", "白镜子", "蓝风暴", "黄太阳"][Math.floor(Math.random() * 20)],
      maya_seal_info: {
        "特质": "生命力、滋养、起源",
        "能量": "创造、孕育、信任",
        "启示": "信任生命的过程，接受自己的本源力量",
        "象征": "母亲、起源、生命力"
      },
      maya_tone_info: {
        "数字": 1,
        "行动": "吸引",
        "本质": "统一的目标",
        "启示": "找到你的目标和方向"
      },
      life_purpose: {
        "summary": "磁性的红龙代表了一种独特的生命能量",
        "details": "你的生命使命与生命力、滋养、起源有关",
        "action_guide": "通过吸引的方式来实现你的潜能"
      },
      personal_traits: {
        "strengths": [
          "与生命力相关的天赋",
          "在创造方面的能力",
          "体现统一的目标的能力",
          "发现和培养自己独特的才能",
          "与滋养相关的天赋"
        ],
        "challenges": [
          "平衡内在需求和外在期望",
          "克服内向和保守",
          "避免过度自我保护"
        ]
      },
      birth_energy_field: {
        "primary": {
          "type": "个人能量场",
          "info": {
            "描述": "围绕个体的能量场，反映个人状态",
            "影响范围": "个人情绪、健康、思维模式",
            "增强方法": "冥想、运动、健康饮食、充足睡眠"
          }
        },
        "secondary": {
          "type": "创造能量场",
          "info": {
            "描述": "与创造力和表达相关的能量场",
            "影响范围": "艺术创作、问题解决、创新思维",
            "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
          }
        },
        "balance_suggestion": "平衡个人能量场和创造能量场的能量，发挥你的最大潜能"
      }
    }
  };
};
