/* CAMPUSLINK — Interview Service */

function evaluateAnswer(answer = '', question = '') {
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const hasStructure = /situation|task|action|result|challenge|approach|outcome/i.test(answer);
  const hasMetrics = /\d+%|\d+ percent|reduced|increased|improved|saved|built|created|led/i.test(answer);
  const hasSpecifics = /project|team|company|tool|technology|database|api|server/i.test(answer);

  let score = 30 + Math.min(30, wordCount * 0.7);
  if (hasStructure) score += 15;
  if (hasMetrics) score += 12;
  if (hasSpecifics) score += 8;
  score = Math.min(95, Math.round(score));

  const feedback = [];
  const strengths = [];
  const improvements = [];

  if (wordCount < 20) {
    improvements.push('Your response is too brief. Aim for 80–150 words with specific details.');
  } else if (wordCount >= 40) {
    strengths.push('Good level of detail in your response.');
  }

  if (!hasStructure) {
    improvements.push('Structure your answer using the STAR method (Situation, Task, Action, Result).');
  } else {
    strengths.push('Good use of structured response format.');
  }

  if (!hasMetrics) {
    improvements.push('Include measurable outcomes — numbers, percentages, or concrete results.');
  } else {
    strengths.push('Includes quantifiable results.');
  }

  if (hasSpecifics) {
    strengths.push('References specific technologies or contexts.');
  }

  if (score >= 70) {
    feedback.push('Strong answer overall. Consider adding a brief reflection on what you learned from this experience.');
  } else if (score >= 50) {
    feedback.push('Decent foundation. Add more specific technical details and measurable outcomes to strengthen your answer.');
  } else {
    feedback.push('This answer needs more depth. Use a real example from your experience and follow the STAR format.');
  }

  return {
    score,
    feedback: feedback.join(' '),
    strengths,
    improvements,
    tip: 'Remember STAR: Situation → Task → Action → Result. Aim for 90–120 seconds when spoken aloud.',
    engineVersion: 'interview-v1',
    timestamp: new Date().toISOString(),
  };
}

module.exports = { evaluateAnswer };
