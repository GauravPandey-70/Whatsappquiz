const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true }, // WhatsApp number
  currentQuestion: { type: Number, default: 0 }, // 0 = welcome, 1-6 = questions, 7 = complete
  answers: { type: Map, of: String, default: {} }, // e.g., {budget: 'low', size: 'small'}
  startedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  droppedOff: { type: Boolean, default: false }
});

const analyticsSchema = new mongoose.Schema({
  phone: String,
  event: { type: String, required: true }, // e.g., 'quiz_started', 'question_1_answered'
  questionNum: Number, // For answered/dropped events
  timestamp: { type: Date, default: Date.now },
  answers: { type: Map, of: String } // Snapshot for context
});

module.exports = {
  UserSession: mongoose.model('UserSession', userSessionSchema),
  Analytics: mongoose.model('Analytics', analyticsSchema)
};