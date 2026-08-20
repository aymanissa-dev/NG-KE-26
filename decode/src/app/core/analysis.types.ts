export interface CodeIssue {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface QualityScore {
  maintainability: number; // 0-100
  overallGrade: string; // e.g. "B-", "A", "C+"
  complexity: 'Low' | 'Medium' | 'High';
  readability: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface CodeAnalysis {
  language: string;
  summary: string;
  explanation: string;
  steps: string[];
  issues: CodeIssue[];
  suggestions: string;
  refactorBefore: string;
  refactorAfter: string;
  score: QualityScore;
  followUps: string[];
}
