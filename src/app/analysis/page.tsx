'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Share2Icon, 
  DownloadIcon, 
  ThickArrowUpIcon, 
  ThickArrowDownIcon, 
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  LightningBoltIcon,
  MixerHorizontalIcon,
  RocketIcon,
  LockClosedIcon,
  FileTextIcon,
  Link2Icon,
  QuoteIcon,
  ArrowLeftIcon
} from '@radix-ui/react-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AnalysisLoading } from '@/components/AnalysisLoading';

// Define interfaces for progressive analysis data
interface InitialAssessment {
  title: string;
  subtitle: string;
  summary: string;
  contentType: 'argument' | 'story';
  confidence: number;
}

interface CoreAnalysis {
  structure: {
    mainClaim: string;
    supportingPoints: string[];
    evidenceTypes: string[];
    logicalFlow: string;
  };
  quality: {
    argumentStrength: {
      score: number;
      grade: string;
      reasoning: string;
      strongPoints: string[];
      weakPoints: string[];
    };
    evidenceQuality: {
      score: number;
      grade: string;
      analysis: string;
      credibility: string;
      relevance: string;
    };
  };
}

interface Recommendation {
  id: string;
  title: string;
  detail: string;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

interface Bias {
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
  mitigation: string;
}

interface Alternative {
  id: string;
  explanation: string;
  likelihood: number;
  supportingEvidence: string[];
  counterEvidence: string[];
}

interface FinalInsights {
  keyTakeaways: string[];
  actionableSteps: string[];
  furtherConsiderations: string[];
}

interface ProgressiveAnalysis {
  initialAssessment?: InitialAssessment;
  coreAnalysis?: CoreAnalysis;
  recommendations?: Recommendation[];
  biases?: Bias[];
  alternatives?: Alternative[];
  finalInsights?: FinalInsights;
}

export default function AnalysisReport() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<ProgressiveAnalysis>({});
  const [currentSection, setCurrentSection] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  // Load analysis data from sessionStorage and handle progressive updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Listen for server-sent events
      const eventSource = new EventSource('/api/analyze');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Update progress based on status
          switch (data.status) {
            case 'initializing':
              setProgress(0);
              setCurrentSection('Initial Assessment');
              break;
            case 'initial_assessment_complete':
              setProgress(20);
              setAnalysisData(prev => ({ ...prev, initialAssessment: data.data }));
              break;
            case 'analyzing_core':
              setProgress(30);
              setCurrentSection('Core Analysis');
              break;
            case 'core_analysis_complete':
              setProgress(50);
              setAnalysisData(prev => ({ ...prev, coreAnalysis: data.data }));
              break;
            case 'analyzing_recommendations':
              setProgress(60);
              setCurrentSection('Recommendations');
              break;
            case 'recommendations_complete':
              setProgress(70);
              setAnalysisData(prev => ({ ...prev, recommendations: data.data.recommendations }));
              break;
            case 'analyzing_critical':
              setProgress(80);
              setCurrentSection('Critical Analysis');
              break;
            case 'critical_analysis_complete':
              setProgress(90);
              setAnalysisData(prev => ({
                ...prev,
                biases: data.data.biases,
                alternatives: data.data.alternatives
              }));
              break;
            case 'finalizing':
              setProgress(95);
              setCurrentSection('Final Insights');
              break;
            case 'final_insights_complete':
              setProgress(100);
              setAnalysisData(prev => ({ ...prev, finalInsights: data.data }));
              setIsLoading(false);
              break;
            case 'error':
              console.error('Analysis error:', data.error);
              // Handle error appropriately
              break;
          }
        } catch (error) {
          console.error('Error processing server event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, []);

  const handleBackToHome = () => {
    router.push('/');
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <AnalysisLoading 
        status={currentSection} 
        message={`Analyzing ${currentSection.toLowerCase()}...`}
        progress={progress}
      />
    );
  }

  // Rest of the component remains the same, but uses the new analysisData structure
  // ... existing JSX code ...
}
