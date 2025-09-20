const questions = [
  { id: 1, text: 'What is your home size? (small/medium/large)' },
  { id: 2, text: 'Budget range? (low <100, medium 100-300, high >300)' },
  { id: 3, text: 'Comfort with smart tech? (low/medium/high)' },
  { id: 4, text: 'Main concern? (burglary/fire/outdoor)' },
  { id: 5, text: 'Number of entry points? (1-2/3-5/many)' },
  { id: 6, text: 'Any pets? (yes/no)' }
];

const getNextQuestion = (currentQuestion) => questions[currentQuestion - 1]?.text || null;

const isValidAnswer = (qId, answer) => {
  // Simple validation; expand as needed
  const validators = {
    1: ['small', 'medium', 'large'],
    2: ['low', 'medium', 'high'],
    // Add for others...
  };
  return validators[qId]?.includes(answer.toLowerCase()) || true; // Lenient for open answers
};

module.exports = { questions, getNextQuestion, isValidAnswer };