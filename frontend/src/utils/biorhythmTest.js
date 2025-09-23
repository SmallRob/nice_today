// 生物节律计算测试工具
// 用于验证节律计算的准确性

// 计算生物节律值的核心函数
const calculateRhythmValue = (cycle, daysSinceBirth) => {
  return Math.round(100 * Math.sin(2 * Math.PI * daysSinceBirth / cycle));
};

// 计算指定日期的生物节律
const calculateBiorhythmForDate = (birthDate, targetDate) => {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  const daysSinceBirth = Math.floor((target - birth) / (1000 * 60 * 60 * 24));
  
  return {
    daysSinceBirth,
    physical: calculateRhythmValue(23, daysSinceBirth),
    emotional: calculateRhythmValue(28, daysSinceBirth),
    intellectual: calculateRhythmValue(33, daysSinceBirth)
  };
};

// 找到指定月份的节律高低点
const findMonthlyHighLowPoints = (birthDate, year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let highPoint = { date: null, value: -101, physical: -101, emotional: -101, intellectual: -101 };
  let lowPoint = { date: null, value: 101, physical: 101, emotional: 101, intellectual: 101 };
  
  // 遍历该月每一天
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const rhythm = calculateBiorhythmForDate(birthDate, currentDate);
    
    // 计算综合节律值（加权平均）
    const combinedValue = Math.round(
      (rhythm.physical * 0.33 + rhythm.emotional * 0.33 + rhythm.intellectual * 0.34)
    );
    
    // 更新高点
    if (combinedValue > highPoint.value) {
      highPoint = {
        date: currentDate,
        value: combinedValue,
        physical: rhythm.physical,
        emotional: rhythm.emotional,
        intellectual: rhythm.intellectual
      };
    }
    
    // 更新低点
    if (combinedValue < lowPoint.value) {
      lowPoint = {
        date: currentDate,
        value: combinedValue,
        physical: rhythm.physical,
        emotional: rhythm.emotional,
        intellectual: rhythm.intellectual
      };
    }
  }
  
  return { highPoint, lowPoint };
};

// 测试函数
export const testBiorhythm = () => {
  console.log("=== 生物节律计算测试 ===");
  
  const testBirthDate = "1991-04-21";
  const testDate = new Date(); //获取当前日期;
  
  // 测试单日计算
  const result = calculateBiorhythmForDate(testBirthDate, testDate);
  console.log(`出生日期: ${testBirthDate}`);
  console.log(`目标日期: ${testDate}`);
  console.log(`出生天数: ${result.daysSinceBirth}`);
  console.log(`体力节律: ${result.physical}`);
  console.log(`情绪节律: ${result.emotional}`);
  console.log(`智力节律: ${result.intellectual}`);
  
  // 测试月度高低点
  console.log("\n=== 2025年9月高低点测试 ===");
  const monthlyPoints = findMonthlyHighLowPoints(testBirthDate, 2025, 8); // 9月是索引8
  
  console.log("最高点:");
  console.log(`日期: ${monthlyPoints.highPoint.date?.toISOString().split('T')[0]}`);
  console.log(`综合值: ${monthlyPoints.highPoint.value}`);
  console.log(`体力: ${monthlyPoints.highPoint.physical}, 情绪: ${monthlyPoints.highPoint.emotional}, 智力: ${monthlyPoints.highPoint.intellectual}`);
  
  console.log("\n最低点:");
  console.log(`日期: ${monthlyPoints.lowPoint.date?.toISOString().split('T')[0]}`);
  console.log(`综合值: ${monthlyPoints.lowPoint.value}`);
  console.log(`体力: ${monthlyPoints.lowPoint.physical}, 情绪: ${monthlyPoints.lowPoint.emotional}, 智力: ${monthlyPoints.lowPoint.intellectual}`);
  
  return {
    singleDay: result,
    monthlyPoints
  };
};

// 验证计算公式的正确性
export const validateFormula = () => {
  console.log("\n=== 公式验证 ===");
  
  // 测试已知的生物节律理论
  // 在出生日期，所有节律都应该是0（起始点）
  const birthResult = calculateBiorhythmForDate("1991-01-01", "1991-01-01");
  console.log("出生当日节律值（应该都接近0）:");
  console.log(`体力: ${birthResult.physical}, 情绪: ${birthResult.emotional}, 智力: ${birthResult.intellectual}`);
  
  // 测试半周期点（应该接近-100或100）
  const halfCyclePhysical = calculateBiorhythmForDate("1991-01-01", "1991-01-12"); // 11.5天后，接近体力半周期
  console.log(`\n体力半周期测试（11.5天后，应该接近极值）: ${halfCyclePhysical.physical}`);
  
  return true;
};

export default {
  testBiorhythm,
  validateFormula,
  calculateBiorhythmForDate,
  findMonthlyHighLowPoints
};

// 测试命令
// node -e "
// const { testBiorhythm, validateFormula } = require('./src/utils/biorhythmTest.js');
// testBiorhythm();
// validateFormula();
// "