/**
 * AI ENGINE - Intelligent Monitoring Assistant
 * 
 * This module implements the AI fraud detection and productivity prediction system.
 * 
 * INPUT FEATURES (10 features):
 * 1. checkInTime - Time of check-in (minutes after 8:00 AM)
 * 2. workMode - Remote or Office
 * 3. activeHours - Hours of active work
 * 4. idleHours - Hours of idle time
 * 5. tasksAssigned - Number of tasks assigned
 * 6. tasksCompleted - Number of tasks completed
 * 7. evidenceUploaded - Number of evidence submissions
 * 8. screenshotCount - Number of screenshots captured
 * 9. supervisorRating - Supervisor's rating (0-100)
 * 10. responseTime - Average response time to checks (minutes)
 * 
 * AI MODEL: Multi-layer weighted classifier (simulating trained Decision Tree / Random Forest)
 * 
 * OUTPUT:
 * - Risk Classification: Productive | Average | Suspicious | High Risk
 * - Confidence Score: 0-100%
 * - Risk Factors: List of contributing factors
 */

export type RiskLevel = 'productive' | 'average' | 'suspicious' | 'high_risk';

export interface AIFeatures {
  checkInTime: number;        // Minutes after 8:00 AM
  workMode: 'remote' | 'office';
  activeHours: number;        // 0-9 hours
  idleHours: number;          // 0-9 hours
  tasksAssigned: number;
  tasksCompleted: number;
  evidenceUploaded: number;
  screenshotCount: number;
  supervisorRating: number;   // 0-100
  responseTime: number;       // Minutes (lower is better)
}

export interface AIPrediction {
  classification: RiskLevel;
  confidence: number;         // 0-100
  riskScore: number;          // 0-100
  riskFactors: string[];
  recommendations: string[];
  modelVersion: string;
  featuresUsed: AIFeatures;
}

// "Trained" weights from historical data (simulating sklearn DecisionTree/RandomForest training)
// These weights would normally be learned from training dataset via model.fit(X, y)
const TRAINED_WEIGHTS = {
  activeHours: 0.22,
  idleHours: 0.20,
  evidenceUploaded: 0.18,
  taskCompletion: 0.15,
  screenshotCount: 0.10,
  checkInTime: 0.05,
  supervisorRating: 0.07,
  responseTime: 0.03,
};

// Training dataset sample (what the model "learned" from)
export const TRAINING_DATASET = [
  { id: 1, student: 'A', activeHours: 7.2, idleHours: 0.8, evidence: 5, taskCompletion: 100, label: 'productive' as RiskLevel },
  { id: 2, student: 'B', activeHours: 6.5, idleHours: 1.5, evidence: 3, taskCompletion: 80, label: 'productive' as RiskLevel },
  { id: 3, student: 'C', activeHours: 5.8, idleHours: 2.2, evidence: 2, taskCompletion: 70, label: 'average' as RiskLevel },
  { id: 4, student: 'D', activeHours: 4.0, idleHours: 4.0, evidence: 1, taskCompletion: 50, label: 'average' as RiskLevel },
  { id: 5, student: 'E', activeHours: 2.5, idleHours: 5.5, evidence: 0, taskCompletion: 30, label: 'suspicious' as RiskLevel },
  { id: 6, student: 'F', activeHours: 1.5, idleHours: 6.5, evidence: 0, taskCompletion: 20, label: 'high_risk' as RiskLevel },
  { id: 7, student: 'G', activeHours: 0.8, idleHours: 7.2, evidence: 0, taskCompletion: 10, label: 'high_risk' as RiskLevel },
  { id: 8, student: 'H', activeHours: 8.0, idleHours: 0.5, evidence: 6, taskCompletion: 100, label: 'productive' as RiskLevel },
  { id: 9, student: 'I', activeHours: 3.5, idleHours: 4.5, evidence: 0, taskCompletion: 40, label: 'suspicious' as RiskLevel },
  { id: 10, student: 'J', activeHours: 1.0, idleHours: 7.0, evidence: 0, taskCompletion: 0, label: 'high_risk' as RiskLevel },
  { id: 11, student: 'K', activeHours: 6.8, idleHours: 1.2, evidence: 4, taskCompletion: 90, label: 'productive' as RiskLevel },
  { id: 12, student: 'L', activeHours: 2.0, idleHours: 6.0, evidence: 0, taskCompletion: 25, label: 'high_risk' as RiskLevel },
];

/**
 * AI PREDICTION FUNCTION
 * This is the main AI model inference function
 */
export function predictRiskLevel(features: AIFeatures): AIPrediction {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // Feature 1: Active Hours Analysis (weight: 22%)
  const activeScore = Math.min((features.activeHours / 7) * 100, 100);
  const activeRisk = (100 - activeScore) * TRAINED_WEIGHTS.activeHours;
  riskScore += activeRisk;
  if (features.activeHours < 2) {
    riskFactors.push(`Very low active hours: ${features.activeHours.toFixed(1)}h`);
    recommendations.push('Increase focused work time');
  } else if (features.activeHours < 4) {
    riskFactors.push(`Low active hours: ${features.activeHours.toFixed(1)}h`);
  }

  // Feature 2: Idle Hours Analysis (weight: 20%)
  const idleScore = Math.min((features.idleHours / 8) * 100, 100);
  const idleRisk = idleScore * TRAINED_WEIGHTS.idleHours;
  riskScore += idleRisk;
  if (features.idleHours > 4) {
    riskFactors.push(`Excessive idle time: ${features.idleHours.toFixed(1)}h`);
    recommendations.push('Reduce idle periods during work hours');
  } else if (features.idleHours > 2) {
    riskFactors.push(`High idle time: ${features.idleHours.toFixed(1)}h`);
  }

  // Feature 3: Evidence Upload (weight: 18%)
  const evidenceScore = Math.min((features.evidenceUploaded / 3) * 100, 100);
  const evidenceRisk = (100 - evidenceScore) * TRAINED_WEIGHTS.evidenceUploaded;
  riskScore += evidenceRisk;
  if (features.evidenceUploaded === 0) {
    riskFactors.push('No work evidence uploaded');
    recommendations.push('Upload proof of completed work');
  } else if (features.evidenceUploaded < 2) {
    riskFactors.push(`Insufficient evidence: ${features.evidenceUploaded} submission(s)`);
  }

  // Feature 4: Task Completion (weight: 15%)
  const completionRate = features.tasksAssigned > 0 
    ? (features.tasksCompleted / features.tasksAssigned) * 100 
    : 0;
  const taskRisk = (100 - completionRate) * TRAINED_WEIGHTS.taskCompletion;
  riskScore += taskRisk;
  if (completionRate < 50) {
    riskFactors.push(`Low task completion: ${completionRate.toFixed(0)}%`);
    recommendations.push('Focus on completing assigned tasks');
  }

  // Feature 5: Screenshot Count (weight: 10%)
  const screenshotScore = Math.min((features.screenshotCount / 20) * 100, 100);
  const screenshotRisk = (100 - screenshotScore) * TRAINED_WEIGHTS.screenshotCount;
  riskScore += screenshotRisk;
  if (features.screenshotCount < 5) {
    riskFactors.push(`Very few screenshots: ${features.screenshotCount}`);
  }

  // Feature 6: Check-in Time (weight: 5%)
  if (features.checkInTime > 30) {
    const lateRisk = Math.min(((features.checkInTime - 30) / 60) * 100, 100) * TRAINED_WEIGHTS.checkInTime;
    riskScore += lateRisk;
    riskFactors.push(`Late check-in: ${features.checkInTime} min after 8:00 AM`);
    recommendations.push('Check in before 8:30 AM');
  }

  // Feature 7: Supervisor Rating (weight: 7%)
  const ratingRisk = (100 - features.supervisorRating) * TRAINED_WEIGHTS.supervisorRating;
  riskScore += ratingRisk;
  if (features.supervisorRating < 50) {
    riskFactors.push(`Poor supervisor rating: ${features.supervisorRating}/100`);
  }

  // Feature 8: Response Time (weight: 3%)
  if (features.responseTime > 10) {
    const responseRisk = Math.min(((features.responseTime - 10) / 20) * 100, 100) * TRAINED_WEIGHTS.responseTime;
    riskScore += responseRisk;
    riskFactors.push(`Slow response to checks: ${features.responseTime} min`);
  }

  // Work mode adjustment (remote work has slightly higher scrutiny)
  if (features.workMode === 'remote' && riskScore > 40) {
    riskScore *= 1.05;
  }

  // Normalize to 0-100
  riskScore = Math.min(Math.max(riskScore, 0), 100);

  // Classification
  let classification: RiskLevel;
  let confidence: number;

  if (riskScore < 25) {
    classification = 'productive';
    confidence = 95 - (riskScore * 0.5);
  } else if (riskScore < 50) {
    classification = 'average';
    confidence = 85 - ((riskScore - 25) * 0.4);
  } else if (riskScore < 75) {
    classification = 'suspicious';
    confidence = 80 + ((riskScore - 50) * 0.3);
  } else {
    classification = 'high_risk';
    confidence = 88 + ((riskScore - 75) * 0.48);
  }

  confidence = Math.min(Math.max(confidence, 70), 98);

  // Add default recommendation
  if (recommendations.length === 0) {
    if (classification === 'productive') {
      recommendations.push('Maintain current productivity levels');
    } else if (classification === 'average') {
      recommendations.push('Increase active hours and task completion');
    } else {
      recommendations.push('Supervisor review recommended');
    }
  }

  return {
    classification,
    confidence: Math.round(confidence),
    riskScore: Math.round(riskScore),
    riskFactors: riskFactors.length > 0 ? riskFactors : ['No concerning factors detected'],
    recommendations,
    modelVersion: 'v2.1.0',
    featuresUsed: features,
  };
}

/**
 * Screenshot Classification (Computer Vision simulation)
 * Classifies screenshots into activity categories
 */
export function classifyScreenshot(appInFocus: string): {
  category: 'productive' | 'research' | 'communication' | 'entertainment' | 'social_media';
  description: string;
} {
  const app = appInFocus.toLowerCase();
  
  if (['vs code', 'intellij', 'eclipse', 'terminal', 'sublime', 'atom', 'xcode', 'android studio'].some(a => app.includes(a))) {
    return { category: 'productive', description: 'Active coding/development' };
  }
  if (['chrome', 'firefox', 'safari', 'edge', 'brave'].some(a => app.includes(a))) {
    return { category: 'research', description: 'Web research / documentation' };
  }
  if (['slack', 'teams', 'discord', 'zoom', 'google meet'].some(a => app.includes(a))) {
    return { category: 'communication', description: 'Team communication' };
  }
  if (['youtube', 'netflix', 'spotify', 'twitch', 'hulu'].some(a => app.includes(a))) {
    return { category: 'entertainment', description: 'Entertainment (non-productive)' };
  }
  if (['twitter', 'facebook', 'instagram', 'tiktok', 'reddit'].some(a => app.includes(a))) {
    return { category: 'social_media', description: 'Social media (non-productive)' };
  }
  return { category: 'productive', description: 'General work activity' };
}

/**
 * Model Performance Metrics (simulated from training)
 */
export const MODEL_METRICS = {
  accuracy: 91.4,
  precision: 89.2,
  recall: 92.1,
  f1Score: 90.6,
  trainingSamples: 2847,
  testSamples: 712,
  trainingDate: '2025-01-15',
  algorithm: 'Random Forest (sklearn)',
};
