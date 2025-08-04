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
    return <div className="text-center py-4">没有可用的图表数据</div>;
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
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // 生成今日节律总结
  const renderTodaySummary = () => {
    if (todayIndex < 0) return null;
    
    // 计算整体状态
    const overallScore = (todayPhysical + todayEmotional + todayIntellectual) / 3;
    const isExcellent = overallScore > 50;
    const isPoor = overallScore < -50;
    
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-lg">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 transform translate-x-8 -translate-y-8"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isExcellent ? 'bg-green-100' : isPoor ? 'bg-red-100' : 'bg-blue-100'}`}>
                <svg className={`w-6 h-6 ${isExcellent ? 'text-green-600' : isPoor ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900">今日节律状态</h3>
              <p className="text-sm text-gray-600">基于您的生物节律分析</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="font-semibold text-gray-900">体力节律</span>
                </div>
                <span className={`text-lg font-bold ${todayPhysical > 0 ? 'text-green-600' : todayPhysical < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {todayPhysical}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                todayPhysical > 0 ? 'bg-green-100 text-green-800' : 
                todayPhysical < 0 ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {getRhythmStatus(todayPhysical)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="font-semibold text-gray-900">情绪节律</span>
                </div>
                <span className={`text-lg font-bold ${todayEmotional > 0 ? 'text-green-600' : todayEmotional < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {todayEmotional}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                todayEmotional > 0 ? 'bg-green-100 text-green-800' : 
                todayEmotional < 0 ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {getRhythmStatus(todayEmotional)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-semibold text-gray-900">智力节律</span>
                </div>
                <span className={`text-lg font-bold ${todayIntellectual > 0 ? 'text-green-600' : todayIntellectual < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {todayIntellectual}
                </span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                todayIntellectual > 0 ? 'bg-green-100 text-green-800' : 
                todayIntellectual < 0 ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {getRhythmStatus(todayIntellectual)}
              </div>
            </div>
          </div>
          
          {/* 今日建议 */}
          <div className={`rounded-lg p-4 border-l-4 ${
            todayPhysical > 50 && todayEmotional > 50 && todayIntellectual > 50 ? 
              'bg-green-50 border-green-500' : 
            todayPhysical < -50 && todayEmotional < -50 && todayIntellectual < -50 ? 
              'bg-red-50 border-red-500' : 
              'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className={`w-5 h-5 ${
                  todayPhysical > 50 && todayEmotional > 50 && todayIntellectual > 50 ? 'text-green-600' : 
                  todayPhysical < -50 && todayEmotional < -50 && todayIntellectual < -50 ? 'text-red-600' : 
                  'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">今日建议</h4>
                {todayPhysical > 50 && todayEmotional > 50 && todayIntellectual > 50 ? (
                  <p className="text-sm text-green-700 font-medium">
                    🌟 今天是您的黄金日！体力、情绪和智力都处于高峰期，适合进行重要决策和创造性工作。
                  </p>
                ) : todayPhysical < -50 && todayEmotional < -50 && todayIntellectual < -50 ? (
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ 今天各项指标较低，建议适当休息，避免重要决策，保持心情平静。
                  </p>
                ) : (
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className={todayPhysical > 0 ? "text-green-700" : "text-red-700"}>
                      💪 {todayPhysical > 0 ? "体力状态良好，适合体育活动。" : "体力状态较低，注意休息。"}
                    </p>
                    <p className={todayEmotional > 0 ? "text-green-700" : "text-red-700"}>
                      😊 {todayEmotional > 0 ? "情绪稳定积极，人际交往顺利。" : "情绪波动可能较大，保持平静。"}
                    </p>
                    <p className={todayIntellectual > 0 ? "text-green-700" : "text-red-700"}>
                      🧠 {todayIntellectual > 0 ? "思维敏捷，适合学习和创造性工作。" : "思维效率可能降低，避免复杂决策。"}
                    </p>
                  </div>
                )}
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