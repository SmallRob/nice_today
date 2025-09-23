// 玛雅历法计算测试
function calculateMayaDate(gregorianDate) {
  // 尝试不同的玛雅历元设定
  // 方法1: 传统设定 - 公元前3114年8月11日
  // 方法2: 调整后的设定 - 可能需要偏移
  
  // 先尝试几种不同的历元设定
  const MAYA_EPOCHS = [
    584283,  // 传统设定
    584284,  // +1天
    584282,  // -1天
    584285,  // +2天
    584281   // -2天
  ];
  
  // 使用传统设定作为基础
  const MAYA_EPOCH_JD = 584283;
  
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
  
  // 将格里高利日期转换为儒略日数
  const date = new Date(gregorianDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 儒略日数计算公式
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // 计算从玛雅历法起始点到当前日期的天数
  const daysSinceEpoch = jd - MAYA_EPOCH_JD;
  
  // 计算KIN数（1-260的循环）
  const kin = ((daysSinceEpoch % 260) + 260) % 260;
  const kinNumber = kin === 0 ? 260 : kin;
  
  // 计算调性（1-13的循环）
  const toneIndex = ((daysSinceEpoch % 13) + 13) % 13;
  const tone = TONES[toneIndex];
  
  // 计算图腾（1-20的循环）
  const sealIndex = ((daysSinceEpoch % 20) + 20) % 20;
  const seal = SEALS[sealIndex];
  
  return {
    kin: kinNumber,
    tone: tone,
    seal: seal,
    fullName: `${tone}的${seal}`,
    daysSinceEpoch: daysSinceEpoch,
    julianDay: jd,
    toneIndex: toneIndex,
    sealIndex: sealIndex
  };
}

// 测试2025年9月23日
console.log('=== 玛雅历法计算测试 ===');
const testDate = '2025-09-23';
const result = calculateMayaDate(testDate);

console.log(`测试日期: ${testDate}`);
console.log(`儒略日数: ${result.julianDay}`);
console.log(`距离玛雅历元天数: ${result.daysSinceEpoch}`);
console.log(`KIN: ${result.kin}`);
console.log(`调性索引: ${result.toneIndex} -> ${result.tone}`);
console.log(`图腾索引: ${result.sealIndex} -> ${result.seal}`);
console.log(`完整名称: ${result.fullName}`);

// 验证是否为"磁性的蓝夜"
if (result.fullName === '磁性的蓝夜') {
  console.log('✓ 计算正确！2025年9月23日确实是磁性的蓝夜');
} else {
  console.log('✗ 计算结果不匹配，需要调整算法');
}

// 测试几个已知的日期来验证算法
console.log('\n=== 验证其他日期 ===');
const testDates = [
  '2025-09-22',
  '2025-09-24',
  '2025-09-25'
];

testDates.forEach(date => {
  const result = calculateMayaDate(date);
  console.log(`${date}: ${result.fullName} (KIN ${result.kin})`);
});

export { calculateMayaDate };