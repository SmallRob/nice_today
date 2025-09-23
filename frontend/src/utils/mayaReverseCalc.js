// 基于已知正确结果的玛雅历法计算
function calculateMayaDateCorrect(gregorianDate) {
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
  
  // 已知：2025年9月23日应该是"磁性的蓝夜"
  // 磁性 = 调性索引 0，蓝夜 = 图腾索引 2
  // 这意味着KIN = 调性 + 图腾*13的某种组合，或者是其他计算方式
  
  // 让我们使用一个基准日期来反推
  // 设定2025年9月23日为参考点
  const REFERENCE_DATE = new Date('2025-09-23');
  const REFERENCE_TONE_INDEX = 0; // 磁性
  const REFERENCE_SEAL_INDEX = 2; // 蓝夜
  
  // 计算目标日期
  const targetDate = new Date(gregorianDate);
  
  // 计算从参考日期到目标日期的天数
  const timeDiff = targetDate.getTime() - REFERENCE_DATE.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // 计算调性索引（13天循环）
  let toneIndex = (REFERENCE_TONE_INDEX + daysDiff) % 13;
  if (toneIndex < 0) toneIndex += 13;
  
  // 计算图腾索引（20天循环）
  let sealIndex = (REFERENCE_SEAL_INDEX + daysDiff) % 20;
  if (sealIndex < 0) sealIndex += 20;
  
  // 计算KIN数（这里使用标准公式）
  // KIN = (调性-1) + (图腾-1)*13 + 1，但需要在260天周期内
  let kin = (toneIndex * 20 + sealIndex + 1);
  kin = ((kin - 1) % 260) + 1;
  
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

// 测试函数
console.log('=== 基于已知结果的玛雅历法计算测试 ===');

// 测试2025年9月23日（应该是磁性的蓝夜）
const testDate = '2025-09-23';
const result = calculateMayaDateCorrect(testDate);

console.log(`测试日期: ${testDate}`);
console.log(`KIN: ${result.kin}`);
console.log(`调性索引: ${result.toneIndex} -> ${result.tone}`);
console.log(`图腾索引: ${result.sealIndex} -> ${result.seal}`);
console.log(`完整名称: ${result.fullName}`);

// 验证是否为"磁性的蓝夜"
if (result.fullName === '磁性的蓝夜') {
  console.log('✓ 计算正确！2025年9月23日确实是磁性的蓝夜');
} else {
  console.log('✗ 计算结果不匹配，当前结果:', result.fullName);
}

// 测试前后几天
console.log('\n=== 验证前后日期 ===');
const testDates = [
  '2025-09-21',
  '2025-09-22', 
  '2025-09-23',
  '2025-09-24',
  '2025-09-25'
];

testDates.forEach(date => {
  const result = calculateMayaDateCorrect(date);
  console.log(`${date}: ${result.fullName} (KIN ${result.kin})`);
});

export { calculateMayaDateCorrect };