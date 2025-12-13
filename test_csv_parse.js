const { parseCSV } = require('./frontend/src/services/dataService.js');

// 模拟包含引号的CSV内容
const csvContent = `时间段,部位,说明,建议活动,健康提示
01:00-03:00,肝胆,"肝胆经当令，解毒代谢最活跃的时间","保证充足睡眠，避免熬夜","熬夜会加重肝胆负担，影响第二天精神状态"
03:00-05:00,肺,"肺经当令，气血循环活跃，适合呼吸系统调理","深度睡眠中自然呼吸","早起后深呼吸练习，有益肺部健康"`;

console.log('原始CSV内容:');
console.log(csvContent);
console.log('\n解析后的数据:');
const parsedData = parseCSV(csvContent);
console.log(JSON.stringify(parsedData, null, 2));