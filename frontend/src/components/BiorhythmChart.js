import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin  // 注册注解插件
);

// 节律状态评估函数
const getRhythmStatus = (value) => {
  const absValue = Math.abs(value);
  
  if (absValue >= 90) {
    return value > 0 ? '极佳' : '极差';
  } else if (absValue >= 70) {
    return value > 0 ? '很好' : '很差';
  } else if (absValue >= 50) {
    return value > 0 ? '良好' : '较差';
  } else if (absValue >= 30) {
    return value > 0 ? '一般' : '一般偏低';
  } else {
    return '平稳期';
  }
};

const BiorhythmChart = ({ data }) => {
  if (!data || !data.dates || !data.physical || !data.emotional || !data.intellectual) {
    return <div className="text-center py-4 text-gray-900 dark:text-white">没有可用的图表数据</div>;
  }

  // 找到今天的索引
  const todayIndex = data.dates.findIndex(date => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  });

  // 获取今天的节律值
  const todayPhysical = todayIndex >= 0 ? data.physical[todayIndex] : null;
  const todayEmotional = todayIndex >= 0 ? data.emotional[todayIndex] : null;
  const todayIntellectual = todayIndex >= 0 ? data.intellectual[todayIndex] : null;

  // 准备图表数据
  const chartData = {
    labels: data.dates.map(date => {
      // 将日期格式化为 MM-DD
      const dateObj = new Date(date);
      return `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    }),
    datasets: [
      {
        label: '体力节律',
        data: data.physical,
        borderColor: '#3b82f6', // 蓝色
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: '情绪节律',
        data: data.emotional,
        borderColor: '#ef4444', // 红色
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: '智力节律',
        data: data.intellectual,
        borderColor: '#10b981', // 绿色
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // 图表配置
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
          color: '#1f2937', // Default text color
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const index = items[0].dataIndex;
            return `日期: ${data.dates[index]}`;
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
      // 添加注解配置
      annotation: {
        annotations: todayIndex >= 0 ? {
          todayLine: {
            type: 'line',
            xMin: todayIndex,
            xMax: todayIndex,
            borderColor: 'rgba(0, 0, 0, 0.7)',
            borderWidth: 2,
            borderDash: [6, 6], // 设置为虚线
            label: {
              display: true,
              content: '今天',
              position: 'start',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              font: {
                weight: 'bold'
              },
              padding: 6
            }
          }
        } : {}
      }
    },
    scales: {
      y: {
        min: -100,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#6b7280', // Default tick color
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#6b7280', // Default tick color
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // 生成今日节律总结
  const renderTodaySummary = () => {
    if (todayIndex < 0) return null;
    
    // 计算综合累积值
    const totalScore = todayPhysical + todayEmotional + todayIntellectual;
    // 计算整体状态（平均值）
    const overallScore = totalScore / 3;
    const isExcellent = overallScore > 50;
    const isPoor = overallScore < -50;
    
    // 根据综合累积值确定状态
    const getTotalScoreStatus = (score) => {
      if (score >= 200) return { text: '极佳', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30' };
      if (score >= 100) return { text: '很好', color: 'text-green-500 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20' };
      if (score >= 50) return { text: '良好', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' };
      if (score >= 0) return { text: '一般偏好', color: 'text-blue-500 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' };
      if (score >= -50) return { text: '一般偏低', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20' };
      if (score >= -100) return { text: '较差', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20' };
      if (score >= -200) return { text: '很差', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20' };
      return { text: '极差', color: 'text-red-600 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30' };
    };
    
    const totalStatus = getTotalScoreStatus(totalScore);
    
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-lg">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full opacity-50 transform translate-x-8 -translate-y-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isExcellent ? 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30' : isPoor ? 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30' : 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30'}`}>
                <svg className={`w-6 h-6 ${isExcellent ? 'text-green-600 dark:text-green-400' : isPoor ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">今日节律状态</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">基于您的生物节律分析</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500 dark:border-blue-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">体力节律</span>
                </div>
                <span className={`text-lg font-bold ${todayPhysical > 0 ? 'text-green-600 dark:text-green-400' : todayPhysical < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {todayPhysical}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                todayPhysical > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400' : 
                todayPhysical < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getRhythmStatus(todayPhysical)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-red-500 dark:border-red-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">情绪节律</span>
                </div>
                <span className={`text-lg font-bold ${todayEmotional > 0 ? 'text-green-600 dark:text-green-400' : todayEmotional < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {todayEmotional}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                todayEmotional > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400' : 
                todayEmotional < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getRhythmStatus(todayEmotional)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-green-500 dark:border-green-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">智力节律</span>
                </div>
                <span className={`text-lg font-bold ${todayIntellectual > 0 ? 'text-green-600 dark:text-green-400' : todayIntellectual < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {todayIntellectual}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                todayIntellectual > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400' : 
                todayIntellectual < 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400' : 
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {getRhythmStatus(todayIntellectual)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-purple-500 dark:border-purple-400 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                  <span className="font-semibold text-gray-900 dark:text-white">综合累积值</span>
                </div>
                <span className={`text-lg font-bold ${totalScore > 0 ? 'text-green-600 dark:text-green-400' : totalScore < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {totalScore}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${totalStatus.bg} ${totalStatus.color}`}>
                {totalStatus.text}
              </div>
            </div>
          </div>
          
          {/* 今日建议 */}
          <div className={`rounded-lg p-4 border-l-4 ${totalStatus.bg} border-${totalStatus.color.split('-')[1]}-500 dark:border-${totalStatus.color.split('-')[1]}-400`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className={`w-5 h-5 ${totalStatus.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">今日综合状态</h4>
                {totalScore >= 200 ? (
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    🌟 今天是您的超级黄金日！综合累积值极高，体力、情绪和智力都处于巅峰状态。适合进行重要决策、创造性工作和挑战性活动。充分利用这一天，您可能会有突破性的表现！
                  </p>
                ) : totalScore >= 100 ? (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✨ 今天是您的高能日！综合状态非常好，适合处理重要事务、社交活动和创意工作。您的表现将超出平时水平，是实现目标的理想时机。
                  </p>
                ) : totalScore >= 50 ? (
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    👍 今天状态良好，各项指标处于积极水平。适合正常工作和学习，也可以适当安排一些有挑战性的任务。保持积极心态，将是充实的一天。
                  </p>
                ) : totalScore >= 0 ? (
                  <p className="text-sm text-blue-500 dark:text-blue-300 font-medium">
                    😊 今天状态平稳偏好，可以正常开展各项活动。建议合理安排工作和休息，避免过度疲劳。关注自己的情绪变化，保持平和心态。
                  </p>
                ) : totalScore >= -50 ? (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    ⚠️ 今天状态一般偏低，建议适当减少工作强度，增加休息时间。避免做重要决策，保持心情平静，注意身体状况。
                  </p>
                ) : totalScore >= -100 ? (
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    ⚠️ 今天综合状态较差，建议以休息和恢复为主。推迟重要决策和高强度活动，保持良好作息，避免情绪波动。
                  </p>
                ) : totalScore >= -200 ? (
                  <p className="text-sm text-red-500 dark:text-red-400 font-medium">
                    ⚠️ 今天综合状态很差，强烈建议减少活动量，避免压力和冲突。重视休息和放松，可以进行冥想或轻度伸展活动帮助恢复。
                  </p>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    ⚠️ 今天是低谷期，综合累积值极低。请务必注意休息，避免任何重要决策和高强度活动。保持心情平静，专注于自我照顾和恢复。
                  </p>
                )}
                
                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p className={todayPhysical > 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                    💪 {todayPhysical > 50 ? "体力充沛，适合高强度运动和体力活动。" : 
                       todayPhysical > 0 ? "体力状态良好，适合适度运动。" : 
                       todayPhysical > -50 ? "体力状态一般，注意适当休息。" : 
                       "体力状态较差，建议多休息，避免剧烈运动。"}
                  </p>
                  <p className={todayEmotional > 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                    😊 {todayEmotional > 50 ? "情绪非常积极，人际关系和沟通将特别顺利。" : 
                       todayEmotional > 0 ? "情绪稳定积极，适合社交活动。" : 
                       todayEmotional > -50 ? "情绪略有波动，保持平静心态。" : 
                       "情绪可能较低落，避免压力和冲突，关注自我情绪调节。"}
                  </p>
                  <p className={todayIntellectual > 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
                    🧠 {todayIntellectual > 50 ? "思维特别敏捷，创造力和解决问题能力处于高峰。" : 
                       todayIntellectual > 0 ? "思维清晰，适合学习和创造性工作。" : 
                       todayIntellectual > -50 ? "思维效率一般，适合处理常规任务。" : 
                       "思维效率可能降低，避免复杂决策和高难度思考任务。"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderTodaySummary()}
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BiorhythmChart;