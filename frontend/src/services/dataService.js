// 解析CSV内容的辅助函数
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return []; // 至少需要标题行和一行数据
  
  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => {
      // 移除字段值周围的引号
      let trimmedValue = value.trim();
      if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
        trimmedValue = trimmedValue.substring(1, trimmedValue.length - 1);
      }
      return trimmedValue;
    });
    
    if (values.length !== headers.length) continue; // 跳过格式不正确的行
    
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] || '';
    });
    
    data.push(entry);
  }
  
  return data;
};

// 获取器官节律数据
export const fetchOrganRhythmData = async () => {
  try {
    // 尝试从CSV文件获取数据
    const response = await fetch('/data/organRhythmData.csv');
    if (!response.ok) {
      throw new Error('无法加载器官节律数据');
    }
    
    const csvText = await response.text();
    const data = parseCSV(csvText);
    
    // 确保数据格式正确
    if (data.length === 0) {
      throw new Error('器官节律数据为空');
    }
    
    return {
      success: true,
      data: data.map(item => ({
        timeRange: item['时间段'],
        organ: item['部位'],
        description: item['说明'],
        activities: item['建议活动'],
        tips: item['健康提示']
      }))
    };
  } catch (error) {
    console.error('获取器官节律数据失败:', error);
    
    // 提供默认数据作为备选
    return {
      success: false,
      error: error.message,
      fallbackData: [
        {
          timeRange: "01:00-03:00",
          organ: "肝胆",
          description: "肝胆经当令，解毒代谢最活跃的时间",
          activities: "保证充足睡眠，避免熬夜",
          tips: "熬夜会加重肝胆负担，影响第二天精神状态"
        },
        {
          timeRange: "03:00-05:00",
          organ: "肺",
          description: "肺经当令，气血循环活跃，适合呼吸系统调理",
          activities: "深度睡眠中自然呼吸",
          tips: "早起后深呼吸练习，有益肺部健康"
        },
        {
          timeRange: "05:00-07:00",
          organ: "大肠",
          description: "大肠经当令，排便最佳时间",
          activities: "起床后喝温水，养成定时排便习惯",
          tips: "便秘者可顺时针按摩腹部，促进肠道蠕动"
        }
      ]
    };
  }
};