'use client';

import { predictRiskLevel, AIFeatures, AIPrediction, MODEL_METRICS } from '@/lib/ai-engine';
import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';

interface AIInsightsPanelProps {
  features: AIFeatures;
  showDetails?: boolean;
}

export default function AIInsightsPanel({ features, showDetails = false }: AIInsightsPanelProps) {
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);

  useEffect(() => {
    const result = predictRiskLevel(features);
    setPrediction(result);
  }, [features]);

  if (!prediction) return null;

  const classificationColors = {
    productive: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle },
    average: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: TrendingUp },
    suspicious: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: AlertTriangle },
    high_risk: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle },
  };

  const classificationLabels = {
    productive: 'Productive',
    average: 'Average',
    suspicious: 'Suspicious',
    high_risk: 'High Risk',
  };

  const colors = classificationColors[prediction.classification];
  const Icon = colors.icon;

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Analysis</h3>
            <p className="text-xs text-slate-600">Model: {MODEL_METRICS.algorithm} v{prediction.modelVersion}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600">Confidence</p>
          <p className="text-2xl font-bold">{prediction.confidence}%</p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg} border ${colors.border} mb-4`}>
        <Icon className={`w-5 h-5 ${colors.text}`} />
        <span className={`font-bold ${colors.text}`}>{classificationLabels[prediction.classification]}</span>
        <span className="text-sm text-slate-600">• Risk Score: {prediction.riskScore}/100</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-600 mb-1">Active Hours</p>
          <p className="font-semibold flex items-center gap-1">
            <Activity className="w-4 h-4 text-green-600" />
            {prediction.featuresUsed.activeHours.toFixed(1)}h
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Idle Hours</p>
          <p className="font-semibold flex items-center gap-1">
            <Zap className="w-4 h-4 text-orange-600" />
            {prediction.featuresUsed.idleHours.toFixed(1)}h
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Tasks Completed</p>
          <p className="font-semibold">
            {prediction.featuresUsed.tasksCompleted}/{prediction.featuresUsed.tasksAssigned}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Evidence</p>
          <p className="font-semibold">{prediction.featuresUsed.evidenceUploaded} uploads</p>
        </div>
      </div>

      <div className="bg-white/60 rounded-lg p-3 mb-3">
        <p className="text-xs font-semibold text-slate-700 mb-2">🎯 Risk Factors Detected:</p>
        <ul className="space-y-1">
          {prediction.riskFactors.map((factor, idx) => (
            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white/60 rounded-lg p-3">
        <p className="text-xs font-semibold text-slate-700 mb-2">💡 AI Recommendations:</p>
        <ul className="space-y-1">
          {prediction.recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2">📊 Input Features Used:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(prediction.featuresUsed).map(([key, value]) => (
              <div key={key} className="flex justify-between bg-white/40 px-2 py-1 rounded">
                <span className="text-slate-600">{key}:</span>
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
