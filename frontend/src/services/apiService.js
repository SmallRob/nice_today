import axios from 'axios';

// 格式化日期为YYYY-MM-DD，确保时区一致

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
      const alternativePorts = [5000, 5020, 8000, 8080];
      for (const port of alternativePorts) {
        const altUrl = `http://localhost:${port}`;
        if (altUrl !== baseUrl) {
          try {
            console.log(`尝试备用端口 ${port}...`);
            const timestamp = new Date().getTime();
            const altResponse = await axios.get(`${altUrl}/?_=${timestamp}`, {
              timeout: 3000
            });
            console.log(`备用端口 ${port} 连接成功:`, altResponse.data);
            
            return {
              success: true,
              url: altUrl,
              message: `使用备用端口 ${port} 连接成功`
            };
          } catch (altErr) {
            console.error(`备用端口 ${port} 连接失败:`, altErr);
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
  } catch (err) {
    console.error("获取数据失败:", err);
    
    // 如果是404错误或网络错误，可能是API路径问题，尝试旧版API路径
    if ((err.response && err.response.status === 404) || !err.response) {
      try {
        console.log("尝试使用旧版API路径...");
        
        // 尝试使用旧版API路径获取数据
        const birthDateStr = typeof birthDate === 'string' 
          ? birthDate 
          : formatDateString(birthDate);
        
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
        return {
          success: false,
          error: `获取数据失败，新旧API路径均无法访问。请检查后端服务是否正常运行。错误详情: ${oldApiErr.message}`
        };
      }
    }
    
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

  try {
    console.log("正在请求穿衣信息范围API:", `${apiBaseUrl}/dress/range`);
    const response = await axios.get(`${apiBaseUrl}/dress/range`, {
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
    console.error("获取穿衣信息范围失败:", err);
    
    // 尝试使用单日API
    try {
      console.log("尝试使用单日API获取穿衣信息...");
      const todayResponse = await axios.get(`${apiBaseUrl}/dress/today`, axiosConfig);
      
      return {
        success: true,
        dressInfoList: [todayResponse.data],
        dateRange: {
          start: new Date(),
          end: new Date()
        }
      };
    } catch (todayErr) {
      console.error("使用单日API获取穿衣信息也失败:", todayErr);
      
      // 如果是生产环境，尝试使用不同的路径
      if (process.env.NODE_ENV === 'production') {
        try {
          // 尝试使用相对路径
          console.log("尝试使用相对路径获取穿衣信息...");
          const relativeResponse = await axios.get(`/dress/today`, axiosConfig);
          
          return {
            success: true,
            dressInfoList: [relativeResponse.data],
            dateRange: {
              start: new Date(),
              end: new Date()
            }
          };
        } catch (relativeErr) {
          console.error("使用相对路径获取穿衣信息失败:", relativeErr);
        }
      }
      
      return {
        success: false,
        error: "获取穿衣信息失败，请稍后再试"
      };
    }
  }
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
  
  try {
    console.log("正在请求特定日期穿衣信息:", `${apiBaseUrl}/dress/date?date=${dateStr}`);
    const response = await axios.get(`${apiBaseUrl}/dress/date`, {
      params: { date: dateStr },
      ...axiosConfig
    });
    
    return {
      success: true,
      dressInfo: response.data
    };
  } catch (err) {
    console.error(`获取${dateStr}的穿衣信息失败:`, err);
    
    // 如果是生产环境，尝试使用相对路径
    if (process.env.NODE_ENV === 'production') {
      try {
        console.log(`尝试使用相对路径获取${dateStr}的穿衣信息...`);
        const relativeResponse = await axios.get(`/dress/date`, {
          params: { date: dateStr },
          ...axiosConfig
        });
        
        return {
          success: true,
          dressInfo: relativeResponse.data
        };
      } catch (relativeErr) {
        console.error(`使用相对路径获取${dateStr}的穿衣信息失败:`, relativeErr);
      }
    }
    
    return {
      success: false,
      error: `获取${dateStr}的穿衣信息失败，请稍后再试`
    };
  }
};
