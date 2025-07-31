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
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">今日节律总结</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="font-medium">体力: {todayPhysical}</span>
            </div>
            <span className={`text-sm mt-1 ${todayPhysical > 0 ? 'text-green-600' : todayPhysical < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {getRhythmStatus(todayPhysical)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="font-medium">情绪: {todayEmotional}</span>
            </div>
            <span className={`text-sm mt-1 ${todayEmotional > 0 ? 'text-green-600' : todayEmotional < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {getRhythmStatus(todayEmotional)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="font-medium">智力: {todayIntellectual}</span>
            </div>
            <span className={`text-sm mt-1 ${todayIntellectual > 0 ? 'text-green-600' : todayIntellectual < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {getRhythmStatus(todayIntellectual)}
            </span>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {todayPhysical > 50 && todayEmotional > 50 && todayIntellectual > 50 ? (
            <p className="text-green-600 font-medium">今天是您的黄金日！体力、情绪和智力都处于高峰期。</p>
          ) : todayPhysical < -50 && todayEmotional < -50 && todayIntellectual < -50 ? (
            <p className="text-red-600 font-medium">今天各项指标较低，建议适当休息，避免重要决策。</p>
          ) : (
            <p>
              {todayPhysical > 0 ? "体力状态良好，适合体育活动。" : "体力状态较低，注意休息。"}
              {todayEmotional > 0 ? "情绪稳定积极，人际交往顺利。" : "情绪波动可能较大，保持平静。"}
              {todayIntellectual > 0 ? "思维敏捷，适合学习和创造性工作。" : "思维效率可能降低，避免复杂决策。"}
            </p>
          )}
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