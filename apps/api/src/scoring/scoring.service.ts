import { scoreToRiskLevel, type Finding, type RiskLevel } from '@sentinel/shared';

const weights: Record<Finding['severity'], number> = {
  critical: 35,
  high: 20,
  medium: 10,
  low: 4,
  info: 1,
};

export const calculateScore = (findings: Finding[]): { score: number; riskLevel: RiskLevel } => {
  const penalty = findings.reduce((total, finding) => total + weights[finding.severity], 0);
  const score = Math.max(0, 100 - penalty);

  return {
    score,
    riskLevel: scoreToRiskLevel(score),
  };
};

