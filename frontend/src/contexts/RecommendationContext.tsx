import React, { createContext, useState, useContext } from 'react';

// --- Type Definitions (should match the ones in the form/report pages) ---
type SubjectGradePoints = { subject: string; grade: string; points: number };
type RecommendationItem = {
  id?: number; // Add id field
  name: string;
  course_type?: string;
  similarity_score: number;
  description: string;
  reasoning: string;
  job_applicability: string;
  future_trends: string;
  automation_risk: string;
};
type RecommendationsResponse = {
  average_points: number;
  profile_rating: string;
  model_accuracy: number;
  subject_grades_points: SubjectGradePoints[];
  courses: RecommendationItem[];
  careers: RecommendationItem[];
};

interface IRecommendationContext {
  recommendations: RecommendationsResponse | null;
  setRecommendations: (recommendations: RecommendationsResponse | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RecommendationContext = createContext<IRecommendationContext | undefined>(undefined);

export const RecommendationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <RecommendationContext.Provider value={{ recommendations, setRecommendations, isLoading, setIsLoading }}>
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
};
