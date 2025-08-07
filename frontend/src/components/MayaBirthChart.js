import React, { useState, useEffect, useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './MayaBirthChart.css';
import { fetchMayaBirthInfo, formatDateString, fetchMayaHistory } from '../services/apiService';
import { 
  MAYA_EPOCH, 
  mayaSeals, 
  mayaTones, 
  sealInfoMap, 
  toneInfoMap,
  lifePurposeDetailsOptions,
  lifePurposeActionGuideOptions,
  personalTraitsStrengthsPool,
  personalTraitsChallengesPool,
  energyFieldTypes,
  energyFieldInfoTemplates,
  energyFieldBalanceSuggestionOptions,
  dailyQuotes,
  quoteAuthors,
  DEFAULT_BIRTH_DATE,
  DEFAULT_SEAL_INFO,
  DEFAULT_TONE_INFO,
  WEEKDAYS
} from '../config/mayaConfig';

// 玛雅日历计算工具类 - 确保计算结果的一致性
class MayaCalendarCalculator {
  // 玛雅日历的基准日期 - 使用固定的基准日期确保计算一致性
  static MAYA_EPOCH = MAYA_EPOCH;
  
  // 计算两个日期之间的天数差
  static daysBetween(date1, date2) {
    // 确保使用UTC时间，避免时区问题
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }
  
  // 计算玛雅Kin数
  static calculateKin(birthDate) {
    // 将日期字符串转换为Date对象
    const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    
    // 计算与基准日期的天数差
    const dayDiff = this.daysBetween(this.MAYA_EPOCH, birthDateObj);
    
    // 计算Kin数 (1-260范围内)
    // 使用模运算确保结果在1-260范围内，并处理负数情况
    let kin = dayDiff % 260;
    if (kin <= 0) {
      kin = 260 + kin;
    }
    
    return kin;
  }
  
  // 根据Kin数计算玛雅印记
  static calculateSeal(kin) {
    // 玛雅印记是基于Kin数模20计算的
    const sealIndex = (kin - 1) % 20;
    return mayaSeals[sealIndex];
  }
  
  // 根据Kin数计算玛雅音调
  static calculateTone(kin) {
    // 玛雅音调是基于Kin数模13计算的
    const toneIndex = (kin - 1) % 13;
    return mayaTones[toneIndex];
  }
  
  // 获取完整的玛雅印记描述
  static getSealDescription(kin) {
    const tone = this.calculateTone(kin);
    const seal = this.calculateSeal(kin);
    return `${tone}的${seal}`;
  }
  
  // 生成确定性哈希值，确保同一日期总是生成相同的结果
  static generateDeterministicHash(birthDate) {
    // 将日期转换为标准格式YYYY-MM-DD
    const dateStr = typeof birthDate === 'string' ? birthDate : formatDateString(birthDate);
    
    // 使用更稳定的哈希算法
    let hash = 0;
    if (dateStr.length === 0) return hash;
    
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash);
  }
  
  // 线性同余生成器 - 确保完全确定性的伪随机数生成
  static linearCongruentialGenerator(seed) {
    // 使用标准的LCG参数
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    return (a * seed + c) % m;
  }
  
  // 使用确定性种子生成伪随机数 (0-1之间)
  static seededRandom(seed) {
    const newSeed = this.linearCongruentialGenerator(seed);
    return newSeed / Math.pow(2, 32);
  }
  
  // 使用种子生成指定范围内的随机整数
  static getRandomInt(min, max, seed) {
    const random = this.seededRandom(seed);
    return Math.floor(random * (max - min + 1)) + min;
  }
  
  // 从数组中确定性地选择一个元素，基于种子
  static getRandomElement(array, seed) {
    if (!array || array.length === 0) return null;
    const index = seed % array.length;
    return array[index];
  }
}

const MayaBirthChart = ({ apiBaseUrl }) => {
  // 默认日期设置为配置中的默认日期
  const defaultDate = DEFAULT_BIRTH_DATE;
  const [birthDate, setBirthDate] = useState(defaultDate);
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [isDefaultDate, setIsDefaultDate] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // 防止并发请求导致loading卡住
  const loadingRef = useRef(false);

  // 获取历史记录（最多6条）
  const fetchHistory = useCallback(async () => {
    if (!apiBaseUrl) return;
    try {
      const result = await fetchMayaHistory(apiBaseUrl);
      if (result.success && Array.isArray(result.history)) {
        setHistoryDates(result.history.slice(0, 6));
      }
    } catch (err) {
      console.error("获取历史记录失败:", err);
    }
  }, [apiBaseUrl]);

  // 保存历史记录到后端（假设有POST接口）
  const saveHistory = useCallback(async (dates) => {
    if (!apiBaseUrl) return;
    try {
      // 尝试不同的API路径前缀
      const possiblePrefixes = ['', '/api', '/maya'];
      let saved = false;
      
      for (const prefix of possiblePrefixes) {
        if (saved) break;
        try {
          const url = `${apiBaseUrl}${prefix}/maya/history`;
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: dates })
          });
          saved = true;
          console.log(`历史记录已保存到 ${url}`);
        } catch (prefixErr) {
          console.error(`使用前缀 ${prefix} 保存历史记录失败:`, prefixErr);
        }
      }
      
      // 如果API保存失败，尝试保存到本地存储
      if (!saved) {
        try {
          localStorage.setItem('mayaCalendarHistory', JSON.stringify(dates));
          console.log('历史记录已保存到本地存储');
        } catch (localErr) {
          console.error("保存历史记录到本地存储失败:", localErr);
        }
      }
    } catch (err) {
      // 失败不影响前端展示
      console.error("保存历史记录失败:", err);
    }
  }, [apiBaseUrl]);

  // 加载出生日期的玛雅日历信息，并处理历史记录
  const loadBirthInfo = useCallback(
    async (date, saveToHistory = false) => {
      if (!date) {
        setError("请选择出生日期");
        return;
      }
      
      if (!apiBaseUrl) {
        setError("API服务未连接，请检查网络连接");
        return;
      }
      
      if (loadingRef.current) return; // 防止并发
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      try {
        const dateStr = typeof date === 'string' ? date : formatDateString(date);
        console.log("正在请求玛雅出生图数据，日期:", dateStr, "API基础URL:", apiBaseUrl);
        
        // 首先尝试从API获取数据
        const result = await fetchMayaBirthInfo(apiBaseUrl, dateStr);
        console.log("API返回结果:", result);

        if (result && result.success && result.birthInfo) {
          // 如果API成功返回数据，使用API数据
          console.log("使用API返回的数据");
          setBirthInfo(result.birthInfo);
          setShowResults(true);

          // 如果是字符串日期，转换为Date对象并更新birthDate
          if (typeof date === 'string') {
            setBirthDate(new Date(date));
          }

          // 处理历史记录（仅在用户交互后且需要保存时）
          if (saveToHistory && userInteracted) {
            let newHistory = [dateStr, ...historyDates.filter(d => d !== dateStr)];
            if (newHistory.length > 6) newHistory = newHistory.slice(0, 6);
            setHistoryDates(newHistory);
            saveHistory(newHistory);
          }
        } else {
          console.log("API返回失败或数据格式不正确，使用本地计算方法");
          // 如果API失败，使用本地计算方法生成一致的结果
          console.log("API获取失败，使用本地计算方法");
          
          // 将日期字符串转换为Date对象
          const birthDateObj = typeof date === 'string' ? new Date(date) : date;
          
          // 计算玛雅Kin数
          const kin = MayaCalendarCalculator.calculateKin(birthDateObj);
          
          // 计算玛雅印记和音调
          const seal = MayaCalendarCalculator.calculateSeal(kin);
          const tone = MayaCalendarCalculator.calculateTone(kin);
          const sealDesc = MayaCalendarCalculator.getSealDescription(kin);
          
          // 生成确定性哈希值，用于伪随机数生成
          const seed = MayaCalendarCalculator.generateDeterministicHash(birthDateObj);
          
          // 使用种子生成一致的随机数据
          const weekday = WEEKDAYS[birthDateObj.getDay()];
          
          // 构建一致的出生图信息，确保所有字段都有默认值
          const localBirthInfo = {
            date: dateStr,
            weekday: weekday || "未知",
            maya_kin: `KIN ${kin}`,
            maya_tone: `${tone}之音 | 第${(kin % 28) || 28}天`,
            maya_seal: seal,
            maya_seal_desc: sealDesc,
            maya_seal_info: generateSealInfo(seal, seed),
            maya_tone_info: generateToneInfo(tone, seed),
            life_purpose: generateLifePurpose(sealDesc, seed),
            personal_traits: generatePersonalTraits(seal, tone, seed),
            birth_energy_field: generateEnergyField(seal, tone, seed),
            daily_quote: {
              content: generateQuote(seed) || "每一天都是新的开始",
              author: generateAuthor(seed) || "玛雅智者"
            }
          };
          
          console.log("本地生成的出生图信息:", localBirthInfo);
          
          // 确保daily_quote对象存在
          const processedLocalBirthInfo = ensureQuoteExists(localBirthInfo);
          setBirthInfo(processedLocalBirthInfo);
          setShowResults(true);
          
          // 如果是字符串日期，转换为Date对象并更新birthDate
          if (typeof date === 'string') {
            setBirthDate(new Date(date));
          }
          
          // 处理历史记录（仅在用户交互后且需要保存时）
          if (saveToHistory && userInteracted) {
            let newHistory = [dateStr, ...historyDates.filter(d => d !== dateStr)];
            if (newHistory.length > 6) newHistory = newHistory.slice(0, 6);
            setHistoryDates(newHistory);
            saveHistory(newHistory);
          }
        }
      } catch (error) {
        console.error("获取玛雅出生图信息失败:", error);
        setError("获取数据失败，请稍后再试");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [apiBaseUrl, userInteracted, historyDates, saveHistory]
  );

  // 生成印记信息 - 基于种子确保一致性
  const generateSealInfo = (seal, seed) => {
    // 从配置文件中获取印记信息
    if (!seal || !sealInfoMap[seal]) {
      console.warn(`印记 "${seal}" 不存在于配置中，使用默认值`);
      return DEFAULT_SEAL_INFO;
    }
    return sealInfoMap[seal];
  };

  // 生成音调信息 - 基于种子确保一致性
  const generateToneInfo = (tone, seed) => {
    // 从配置文件中获取音调信息
    if (!tone || !toneInfoMap[tone]) {
      console.warn(`音调 "${tone}" 不存在于配置中，使用默认值`);
      return DEFAULT_TONE_INFO;
    }
    return toneInfoMap[tone];
  };

  // 生成生命使命信息 - 基于种子确保一致性
  const generateLifePurpose = (sealDesc, seed) => {
    // 基于印记描述生成一致的生命使命
    const baseSummary = `${sealDesc || "玛雅印记"}代表了一种独特的生命能量`;
    
    // 使用种子选择一个详细信息
    const seedForDetails = seed + 1; // 使用不同的种子值
    const details = MayaCalendarCalculator.getRandomElement(lifePurposeDetailsOptions, seedForDetails) || 
      "你的生命使命与创造和表达有关，通过你独特的方式分享你的天赋和见解。";
    
    // 使用种子选择一个行动指南
    const seedForActionGuide = seed + 2; // 使用不同的种子值
    const actionGuide = MayaCalendarCalculator.getRandomElement(lifePurposeActionGuideOptions, seedForActionGuide) || 
      "通过日常的小行动逐步实现你的潜能。";
    
    return {
      summary: baseSummary,
      details: details,
      action_guide: actionGuide
    };
  };

  // 生成个人特质信息 - 基于种子确保一致性
  const generatePersonalTraits = (seal, tone, seed) => {
    // 确保个性特质池不为空
    if (!personalTraitsStrengthsPool || personalTraitsStrengthsPool.length === 0) {
      console.warn("优势特质池为空，使用默认值");
      return {
        strengths: ["创造性思维", "适应能力强", "直觉敏锐", "表达能力强", "学习能力强"],
        challenges: ["过度分析", "情绪波动", "完美主义"]
      };
    }
    
    if (!personalTraitsChallengesPool || personalTraitsChallengesPool.length === 0) {
      console.warn("挑战特质池为空，使用默认值");
      return {
        strengths: ["创造性思维", "适应能力强", "直觉敏锐", "表达能力强", "学习能力强"],
        challenges: ["过度分析", "情绪波动", "完美主义"]
      };
    }
    
    // 使用种子选择5个优势
    const strengths = [];
    let strengthSeed = seed;
    for (let i = 0; i < 5 && strengths.length < 5; i++) {
      try {
        const strength = MayaCalendarCalculator.getRandomElement(personalTraitsStrengthsPool, strengthSeed);
        if (strength && !strengths.includes(strength)) {
          strengths.push(strength);
        }
      } catch (error) {
        console.error("生成优势特质时出错:", error);
      }
      strengthSeed += 1;
    }
    
    // 如果没有成功生成足够的优势，添加默认值
    while (strengths.length < 5) {
      strengths.push("适应能力强");
    }
    
    // 使用种子选择3个挑战
    const challenges = [];
    let challengeSeed = seed + 100; // 使用不同的种子基数
    for (let i = 0; i < 3 && challenges.length < 3; i++) {
      try {
        const challenge = MayaCalendarCalculator.getRandomElement(personalTraitsChallengesPool, challengeSeed);
        if (challenge && !challenges.includes(challenge)) {
          challenges.push(challenge);
        }
      } catch (error) {
        console.error("生成挑战特质时出错:", error);
      }
      challengeSeed += 1;
    }
    
    // 如果没有成功生成足够的挑战，添加默认值
    while (challenges.length < 3) {
      challenges.push("平衡工作与生活");
    }
    
    return {
      strengths: strengths,
      challenges: challenges
    };
  };

  // 生成能量场信息 - 基于种子确保一致性
  const generateEnergyField = (seal, tone, seed) => {
    try {
      // 检查能量场类型配置是否存在
      if (!energyFieldTypes || !energyFieldTypes.primary || !energyFieldTypes.secondary || 
          !energyFieldTypes.primary.length || !energyFieldTypes.secondary.length) {
        console.warn("能量场类型配置不完整，使用默认值");
        return {
          primary: {
            type: "个人能量场",
            info: {
              "描述": "围绕个体的能量场，反映个人状态",
              "影响范围": "个人情绪、健康、思维模式",
              "增强方法": "冥想、运动、健康饮食、充足睡眠"
            }
          },
          secondary: {
            type: "创造能量场",
            info: {
              "描述": "与创造力和表达相关的能量场",
              "影响范围": "艺术创作、问题解决、创新思维",
              "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
            }
          },
          balance_suggestion: "平衡个人能量场和创造能量场的能量，发挥你的最大潜能"
        };
      }
      
      // 使用种子选择主要和次要能量场类型
      const primaryType = MayaCalendarCalculator.getRandomElement(energyFieldTypes.primary, seed) || "个人能量场";
      const secondaryType = MayaCalendarCalculator.getRandomElement(energyFieldTypes.secondary, seed + 50) || "创造能量场";
      
      // 检查能量场信息模板是否存在
      if (!energyFieldInfoTemplates) {
        console.warn("能量场信息模板不存在，使用默认值");
        return {
          primary: {
            type: primaryType,
            info: {
              "描述": "围绕个体的能量场，反映个人状态",
              "影响范围": "个人情绪、健康、思维模式",
              "增强方法": "冥想、运动、健康饮食、充足睡眠"
            }
          },
          secondary: {
            type: secondaryType,
            info: {
              "描述": "与创造力和表达相关的能量场",
              "影响范围": "艺术创作、问题解决、创新思维",
              "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
            }
          },
          balance_suggestion: `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`
        };
      }
      
      // 获取主要和次要能量场的信息
      const primaryInfo = energyFieldInfoTemplates[primaryType] || energyFieldInfoTemplates["个人能量场"] || {
        "描述": "围绕个体的能量场，反映个人状态",
        "影响范围": "个人情绪、健康、思维模式",
        "增强方法": "冥想、运动、健康饮食、充足睡眠"
      };
      
      const secondaryInfo = energyFieldInfoTemplates[secondaryType] || energyFieldInfoTemplates["创造能量场"] || {
        "描述": "与创造力和表达相关的能量场",
        "影响范围": "艺术创作、问题解决、创新思维",
        "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
      };
      
      // 检查平衡建议选项是否存在
      let balanceSuggestion;
      if (!energyFieldBalanceSuggestionOptions || energyFieldBalanceSuggestionOptions.length === 0) {
        console.warn("平衡建议选项不存在，使用默认值");
        balanceSuggestion = `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`;
      } else {
        // 生成平衡建议
        balanceSuggestion = MayaCalendarCalculator.getRandomElement(energyFieldBalanceSuggestionOptions, seed + 150) || 
          `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`;
        
        // 替换模板中的占位符
        balanceSuggestion = balanceSuggestion.replace('{primary}', primaryType).replace('{secondary}', secondaryType);
      }
      
      return {
        primary: {
          type: primaryType,
          info: primaryInfo
        },
        secondary: {
          type: secondaryType,
          info: secondaryInfo
        },
        balance_suggestion: balanceSuggestion
      };
    } catch (error) {
      console.error("生成能量场信息时出错:", error);
      // 返回默认值
      return {
        primary: {
          type: "个人能量场",
          info: {
            "描述": "围绕个体的能量场，反映个人状态",
            "影响范围": "个人情绪、健康、思维模式",
            "增强方法": "冥想、运动、健康饮食、充足睡眠"
          }
        },
        secondary: {
          type: "创造能量场",
          info: {
            "描述": "与创造力和表达相关的能量场",
            "影响范围": "艺术创作、问题解决、创新思维",
            "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
          }
        },
        balance_suggestion: "平衡个人能量场和创造能量场的能量，发挥你的最大潜能"
      };
    }
  };
  
  // 生成名言 - 基于种子确保一致性
  const generateQuote = (seed) => {
    try {
      if (!dailyQuotes || dailyQuotes.length === 0) {
        console.warn("每日名言配置为空，使用默认值");
        return "生命不是等待风暴过去，而是学会在雨中跳舞。";
      }
      return MayaCalendarCalculator.getRandomElement(dailyQuotes, seed + 200) || "生命不是等待风暴过去，而是学会在雨中跳舞。";
    } catch (error) {
      console.error("生成名言时出错:", error);
      return "生命不是等待风暴过去，而是学会在雨中跳舞。";
    }
  };
  
  // 生成作者 - 基于种子确保一致性
  const generateAuthor = (seed) => {
    try {
      if (!quoteAuthors || quoteAuthors.length === 0) {
        console.warn("名言作者配置为空，使用默认值");
        return "玛雅智者";
      }
      return MayaCalendarCalculator.getRandomElement(quoteAuthors, seed + 300) || "玛雅智者";
    } catch (error) {
      console.error("生成作者时出错:", error);
      return "玛雅智者";
    }
  };

  // 确保daily_quote对象存在
  const ensureQuoteExists = (birthInfo) => {
    if (!birthInfo.daily_quote) {
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote = {
        content: generateQuote(seed),
        author: generateAuthor(seed)
      };
    } else if (typeof birthInfo.daily_quote === 'string') {
      // 处理daily_quote是字符串的情况
      const quoteContent = birthInfo.daily_quote;
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote = {
        content: quoteContent,
        author: generateAuthor(seed)
      };
    } else if (!birthInfo.daily_quote.author) {
      // 处理缺少author的情况
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote.author = generateAuthor(seed);
    } else if (!birthInfo.daily_quote.content) {
      // 处理缺少content的情况
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote.content = generateQuote(seed);
    }
    return birthInfo;
  };

  // 初始化时加载历史记录
  useEffect(() => {
    if (apiBaseUrl) {
      console.log("初始化玛雅出生图，API基础URL:", apiBaseUrl);
      fetchHistory();
    } else {
      console.error("apiBaseUrl未定义，无法加载玛雅出生图数据");
    }
  }, [fetchHistory, apiBaseUrl]);

  // 处理日期变更
  const handleDateChange = (date) => {
    setBirthDate(date);
    setIsDefaultDate(false);
    setUserInteracted(true);
  };

  // 处理查询按钮点击
  const handleSubmit = () => {
    loadBirthInfo(birthDate, true);
  };

  // 处理历史记录点击
  const handleHistoryClick = (dateStr) => {
    loadBirthInfo(dateStr, true);
  };

  return (
    <div className="maya-birth-chart">
      <h2>玛雅出生图</h2>
  <div className="date-picker-container">
    <div className="flex w-full items-center">
      <DatePicker
        selected={birthDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        className="date-picker flex-grow md:flex-grow-0"
        placeholderText="选择出生日期"
      />
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="submit-button whitespace-nowrap ml-2 flex-shrink-0"
      >
        {loading ? "加载中..." : "查看出生图"}
      </button>
    </div>
  </div>

      {historyDates.length > 0 && (
        <div className="history-container">
          <h3>历史记录</h3>
          <div className="history-dates">
            {historyDates.map((date, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(date)}
                className="history-date-button"
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {showResults && birthInfo && (
        <div className="birth-chart-results">
          <h3 className="text-xl font-bold text-center text-gray-700 mb-6">玛雅出生图结果</h3>
          <div className="birth-info">
            {/* 基本信息卡片 - 增强色块显示 */}
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-xl shadow-lg border border-blue-200 mb-6 hover:shadow-xl transition-all duration-300">
              {/* 玛雅Kin数大色块显示 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-full shadow-xl border-4 border-white mb-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold">{birthInfo.maya_kin}</div>
                    <div className="text-sm opacity-90">KIN</div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{birthInfo.maya_seal_desc}</h2>
                <div className="flex justify-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm">
                    {birthInfo.maya_seal}
                  </span>
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium shadow-sm">
                    {birthInfo.maya_tone_info?.数字 || '1'}号音
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 基本日期信息 - 增强色块 */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h4 className="text-blue-700 font-bold mb-3 flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    基本日期信息
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-white rounded-lg border border-blue-100">
                      <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">日</span>
                      <span className="text-gray-700"><strong>日期:</strong> {birthInfo.date}</span>
                    </div>
                    <div className="flex items-center p-2 bg-white rounded-lg border border-blue-100">
                      <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">周</span>
                      <span className="text-gray-700"><strong>星期:</strong> {birthInfo.weekday}</span>
                    </div>
                  </div>
                </div>
                
                {/* 玛雅日历信息 - 增强色块 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h4 className="text-purple-700 font-bold mb-3 flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"></path>
                      </svg>
                    </div>
                    玛雅日历信息
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-white rounded-lg border border-purple-100">
                      <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">K</span>
                      <span className="text-gray-700"><strong>玛雅Kin:</strong> {birthInfo.maya_kin}</span>
                    </div>
                    <div className="flex items-center p-2 bg-white rounded-lg border border-purple-100">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">音</span>
                      <span className="text-gray-700"><strong>玛雅音调:</strong> {birthInfo.maya_tone}</span>
                    </div>
                    <div className="flex items-center p-2 bg-white rounded-lg border border-purple-100">
                      <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">印</span>
                      <span className="text-gray-700"><strong>玛雅印记:</strong> {birthInfo.maya_seal}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 每日启示 */}
              {birthInfo.daily_quote && (
                <div className="mt-4 p-5 bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm">
                  <h4 className="text-lg font-medium text-blue-700 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
                    </svg>
                    今日启示
                  </h4>
                  <blockquote className="italic text-gray-700 bg-white bg-opacity-70 p-4 rounded-lg border-l-4 border-blue-300">
                    "{birthInfo.daily_quote.content}"
                    <footer className="text-right mt-3 text-gray-600 font-medium">— {birthInfo.daily_quote.author}</footer>
                  </blockquote>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 印记信息 - 增强色块显示 */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* 印记标题区域 */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg mb-3 transform hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-blue-700 mb-1">印记信息</h4>
                  <div className="inline-block px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm">
                    {birthInfo.maya_seal}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                        </svg>
                      </div>
                      <strong className="text-blue-800 text-lg">特质</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">{birthInfo.maya_seal_info.特质}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-100 to-teal-100 p-4 rounded-xl border-2 border-cyan-200 hover:border-cyan-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <strong className="text-cyan-800 text-lg">能量</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">{birthInfo.maya_seal_info.能量}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-100 to-green-100 p-4 rounded-xl border-2 border-teal-200 hover:border-teal-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <strong className="text-teal-800 text-lg">启示</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">{birthInfo.maya_seal_info.启示}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <strong className="text-green-800 text-lg">象征</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">{birthInfo.maya_seal_info.象征}</p>
                  </div>
                </div>
              </div>

              {/* 音调信息 - 增强色块显示 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* 音调标题区域 */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg mb-3 transform hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-bold text-white">{birthInfo.maya_tone_info.数字}</div>
                  </div>
                  <h4 className="text-xl font-bold text-purple-700 mb-1">音调信息</h4>
                  <div className="inline-block px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-medium shadow-sm">
                    {birthInfo.maya_tone_info.数字}号音
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gradient-to-r from-purple-100 to-violet-100 p-4 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm font-bold">
                        {birthInfo.maya_tone_info.数字}
                      </div>
                      <strong className="text-purple-800 text-lg">数字能量</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">第{birthInfo.maya_tone_info.数字}号音调代表着独特的宇宙振动频率</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 p-4 rounded-xl border-2 border-violet-200 hover:border-violet-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <strong className="text-violet-800 text-lg">行动</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">{birthInfo.maya_tone_info.行动}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-fuchsia-100 to-pink-100 p-4 rounded-xl border-2 border-fuchsia-200 hover:border-fuchsia-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-fuchsia-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <strong className="text-fuchsia-800 text-lg">本质</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">{birthInfo.maya_tone_info.本质}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-4 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
                        </svg>
                      </div>
                      <strong className="text-pink-800 text-lg">启示</strong>
                    </div>
                    <p className="text-gray-700 ml-11 leading-relaxed">{birthInfo.maya_tone_info.启示}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 生命使命 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl shadow-md border border-purple-200 mt-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <h4 className="text-lg font-medium text-purple-700 mb-4 border-b border-purple-100 pb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"></path>
                </svg>
                生命使命
              </h4>
              
              <div className="bg-white bg-opacity-50 p-4 rounded-lg border border-purple-100 mb-4 shadow-sm">
                <p className="text-gray-700 mb-2 font-medium text-lg">{birthInfo.life_purpose.summary}</p>
                <p className="text-gray-600 leading-relaxed">{birthInfo.life_purpose.details}</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg border border-purple-200 shadow-inner">
                <div className="flex items-start">
                  <div className="bg-white rounded-full p-2 mr-3 shadow-sm border border-purple-200">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-medium text-purple-700 mb-1">行动指南</h5>
                    <p className="text-gray-700">{birthInfo.life_purpose.action_guide}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 个人特质 - 增强色块显示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* 个人优势 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* 优势标题区域 */}
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg mb-3 transform hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-green-700 mb-1">个人优势</h4>
                  <p className="text-sm text-gray-600">天赋与潜能的体现</p>
                </div>
                
                <ul className="space-y-3">
                  {birthInfo.personal_traits.strengths.map((strength, index) => {
                    const colors = [
                      { bg: 'from-green-100 to-emerald-100', border: 'border-green-200', icon: 'bg-green-500', text: 'text-green-700' },
                      { bg: 'from-emerald-100 to-teal-100', border: 'border-emerald-200', icon: 'bg-emerald-500', text: 'text-emerald-700' },
                      { bg: 'from-teal-100 to-cyan-100', border: 'border-teal-200', icon: 'bg-teal-500', text: 'text-teal-700' },
                      { bg: 'from-cyan-100 to-sky-100', border: 'border-cyan-200', icon: 'bg-cyan-500', text: 'text-cyan-700' },
                      { bg: 'from-sky-100 to-blue-100', border: 'border-sky-200', icon: 'bg-sky-500', text: 'text-sky-700' }
                    ];
                    const colorScheme = colors[index % colors.length];
                    
                    return (
                      <li key={index} className={`bg-gradient-to-r ${colorScheme.bg} p-4 rounded-xl border-2 ${colorScheme.border} hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${colorScheme.icon} rounded-lg flex items-center justify-center text-white mr-4 shadow-sm font-bold text-lg`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <span className={`${colorScheme.text} font-medium text-lg`}>{strength}</span>
                            <div className="flex items-center mt-1">
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${i < 4 ? colorScheme.icon : 'bg-gray-300'}`}></div>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 ml-2">优势指数</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {/* 个人挑战 */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl shadow-lg border-2 border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* 挑战标题区域 */}
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg mb-3 transform hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-red-700 mb-1">个人挑战</h4>
                  <p className="text-sm text-gray-600">成长与突破的机会</p>
                </div>
                
                <ul className="space-y-3">
                  {birthInfo.personal_traits.challenges.map((challenge, index) => {
                    const colors = [
                      { bg: 'from-red-100 to-pink-100', border: 'border-red-200', icon: 'bg-red-500', text: 'text-red-700' },
                      { bg: 'from-pink-100 to-rose-100', border: 'border-pink-200', icon: 'bg-pink-500', text: 'text-pink-700' },
                      { bg: 'from-orange-100 to-amber-100', border: 'border-orange-200', icon: 'bg-orange-500', text: 'text-orange-700' }
                    ];
                    const colorScheme = colors[index % colors.length];
                    
                    return (
                      <li key={index} className={`bg-gradient-to-r ${colorScheme.bg} p-4 rounded-xl border-2 ${colorScheme.border} hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${colorScheme.icon} rounded-lg flex items-center justify-center text-white mr-4 shadow-sm`}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <span className={`${colorScheme.text} font-medium text-lg`}>{challenge}</span>
                            <div className="flex items-center mt-1">
                              <div className="flex space-x-1">
                                {[...Array(3)].map((_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${i < 2 ? colorScheme.icon : 'bg-gray-300'}`}></div>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 ml-2">挑战程度</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* 能量场信息 - 增强色块显示 */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-indigo-200 mt-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* 能量场标题区域 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg mb-3 transform hover:scale-105 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-indigo-700 mb-1">出生能量场</h4>
                <p className="text-sm text-gray-600">双重能量场的和谐共振</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 主要能量场 */}
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-5 rounded-xl shadow-md border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-md mb-2">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h5 className="font-bold text-indigo-700 text-lg">主要能量场</h5>
                    <div className="inline-block px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-medium shadow-sm mt-1">
                      {birthInfo.birth_energy_field.primary.type}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-indigo-100">
                      <div className="flex items-center mb-1">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                        <strong className="text-indigo-700 text-sm">描述</strong>
                      </div>
                      <p className="text-gray-700 text-sm ml-4">{birthInfo.birth_energy_field.primary.info.描述}</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-indigo-100">
                      <div className="flex items-center mb-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        <strong className="text-purple-700 text-sm">影响范围</strong>
                      </div>
                      <p className="text-gray-700 text-sm ml-4">{birthInfo.birth_energy_field.primary.info.影响范围}</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-indigo-100">
                      <div className="flex items-center mb-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <strong className="text-blue-700 text-sm">增强方法</strong>
                      </div>
                      <p className="text-gray-700 text-sm ml-4">{birthInfo.birth_energy_field.primary.info.增强方法}</p>
                    </div>
                  </div>
                </div>
                
                {/* 次要能量场 */}
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-5 rounded-xl shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md mb-2">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                      </svg>
                    </div>
                    <h5 className="font-bold text-blue-700 text-lg">次要能量场</h5>
                    <div className="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm mt-1">
                      {birthInfo.birth_energy_field.secondary.type}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <strong className="text-blue-700 text-sm">描述</strong>
                      </div>
                      <p className="text-gray-700 text-sm ml-4">{birthInfo.birth_energy_field.secondary.info.描述}</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                        <strong className="text-cyan-700 text-sm">影响范围</strong>
                      </div>
                      <p className="text-gray-700 text-sm ml-4">{birthInfo.birth_energy_field.secondary.info.影响范围}</p>
                    </div>
                    
                    <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-1">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                        <strong className="text-teal-700 text-sm">增强方法</strong>
                      </div>
                      <p className="text-gray-700 text-sm ml-4">{birthInfo.birth_energy_field.secondary.info.增强方法}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 平衡建议 */}
              <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-blue-100 p-5 rounded-xl border-2 border-indigo-200 shadow-inner">
                <div className="flex items-start">
                  <div className="bg-white rounded-full p-3 mr-4 shadow-md border border-indigo-200">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-indigo-700 text-lg mb-2">能量平衡建议</h5>
                    <p className="text-gray-700 leading-relaxed">{birthInfo.birth_energy_field.balance_suggestion}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-xs font-medium">主要能量</span>
                      <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">次要能量</span>
                      <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">和谐共振</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MayaBirthChart;
