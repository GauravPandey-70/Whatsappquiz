const { Analytics } = require('../database/schema');

async function logEvent(phone, event, questionNum = null, answers = {}) {
  const log = new Analytics({ phone, event, questionNum, answers: Object.fromEntries(answers) });
  await log.save();
  console.log(`Logged: ${event} for ${phone}`);
}

// Optional: Export function for log export (e.g., for sample logs deliverable)
async function exportLogs() {
  const logs = await Analytics.find({}).sort({ timestamp: -1 }).limit(100);
  
  return JSON.stringify(logs, null, 2);
}

module.exports = { logEvent, exportLogs };