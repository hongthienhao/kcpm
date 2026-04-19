const fs = require('fs');
const path = require('path');
const testDataPath = path.join(__dirname, 'test-data', 'buy-now-task3-data.json');
module.exports = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
