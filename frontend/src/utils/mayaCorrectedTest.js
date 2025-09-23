// 修正后的玛雅历法计算（基于KIN 183）
function calculateMayaDateCorrected(gregorianDate) {
  // 13种调性（银河音调）
  const TONES = [
    '磁性', '月亮', '电力', '自我存在', '超频', '韵律', '共振',
    '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
  ];
  
  // 20种图腾（太阳印记）
  const SEALS = [
    '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', '黄星星',
    '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', '蓝鹰', '黄战士',
    '红地球', '白镜', '蓝风暴', '黄太阳'
  ];
  
  // 使用正确的参考点：2025年9月23日 = KIN 183 磁性的蓝夜
  const REFERENCE_DATE = new Date('2025-09-23');
  const REFERENCE_KIN = 183;
  
  // 计算目标日期
  const targetDate = new Date(gregorianDate);
  
  // 计算从参考日期到目标日期的天数
  const timeDiff = targetDate.getTime() - REFERENCE_DATE.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // 计算KIN数（260天循环）
  let kin = REFERENCE_KIN + daysDiff;
  kin = ((kin - 1) % 260 + 260) % 260 + 1;
  
  // 从KIN数计算调性和图腾
  const toneIndex = ((kin - 1) % 13);
  const sealIndex = ((kin - 1) % 20);
  
  const tone = TONES[toneIndex];
  const seal = SEALS[sealIndex];
  
  return {
    kin: kin,
    tone: tone,
    seal: seal,
    fullName: `${tone}的${seal}`,
    daysDiff: daysDiff,
    toneIndex: toneIndex,
    sealIndex: sealIndex
  };
}

console.log('=== 修正后的玛雅历法计算测试（基于KIN 183）===');
console.log('当前时间:', new Date().toISOString().split('T')[0]);

// 测试关键日期
const testDates = [
  '2025-09-21',
  '2025-09-22', 
  '2025-09-23', // 应该是KIN 183 磁性的蓝夜
  '2025-09-24',
  '2025-09-25',
  '2025-09-26',
  '2025-09-27'
];

console.log('\n=== 测试结果 ===');
testDates.forEach(date => {
  const result = calculateMayaDateCorrected(date);
  const isTarget = date === '2025-09-23';
  const marker = isTarget ? '🎯' : '  ';
  const status = isTarget && result.kin === 183 && result.fullName === '磁性的蓝夜' ? '✅' : '';
  
  console.log(`${marker} ${date}: ${result.fullName} (KIN ${result.kin}) ${status}`);
});

// 验证2025年9月23日
const targetResult = calculateMayaDateCorrected('2025-09-23');
console.log('\n=== 关键验证 ===');
console.log(`2025年9月23日计算结果: ${targetResult.fullName}`);
console.log(`期望结果: 磁性的蓝夜`);
console.log(`KIN: ${targetResult.kin} (期望: 183)`);
console.log(`调性: ${targetResult.tone} (索引: ${targetResult.toneIndex})`);
console.log(`图腾: ${targetResult.seal} (索引: ${targetResult.sealIndex})`);
console.log(`KIN验证: ${targetResult.kin === 183 ? '✅ 正确' : '❌ 错误'}`);
console.log(`名称验证: ${targetResult.fullName === '磁性的蓝夜' ? '✅ 正确' : '❌ 错误'}`);

// 测试今天的日期
const today = new Date().toISOString().split('T')[0];
const todayResult = calculateMayaDateCorrected(today);
console.log(`\n=== 今日计算 ===`);
console.log(`今日日期: ${today}`);
console.log(`今日玛雅历: ${todayResult.fullName} (KIN ${todayResult.kin})`);

if (today === '2025-09-23') {
  console.log('🎉 今天正好是2025年9月23日！');
  console.log(`计算结果: ${todayResult.fullName} (KIN ${todayResult.kin})`);
  console.log(`验证: ${todayResult.kin === 183 && todayResult.fullName === '磁性的蓝夜' ? '✅ 完全正确！' : '❌ 需要调整！'}`);
}

export { calculateMayaDateCorrected };