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
import { AnalysisResponse } from '@/lib/openai';

type RecommendationType = {
  id: string;
  title: string;
  detail: string;
  reasons: string[];
};

type BiasType = {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
};

type AlternativeType = {
  id: string;
  explanation: string;
  likelihood: number;
};

export default function AnalysisReport() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
  // State for document synthesis
  const [documentSynthesis, setDocumentSynthesis] = useState({
    title: "Software Architecture Review",
    subtitle: "Critical evaluation of the proposed system design with security and scalability considerations",
    summary: "This document presents a comprehensive review of the current software architecture. It identifies several critical vulnerabilities in the security model and suggests improvements for better scalability and maintainability.",
    source: {
      type: "document" as const, // or "link"
      url: "https://example.com/architecture-review.pdf",
      name: "architecture-review.pdf",
      date: "June 15, 2023"
    }
  });

  // State for recommendations, biases, and alternatives
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([
    {
      id: '1',
      title: 'Implement data validation framework',
      detail: 'Current system lacks robust input validation, leading to potential security vulnerabilities.',
      reasons: [
        'Multiple XSS vulnerabilities detected in form inputs',
        'SQL injection risks in database queries',
        'No sanitization for file uploads creating potential attack vectors',
        'Lack of input boundary validation could lead to buffer overflows'
      ]
    },
    {
      id: '2',
      title: 'Enhance error handling mechanisms',
      detail: 'Error handling is inconsistent across modules, affecting system reliability.',
      reasons: [
        'Exceptions are silently caught in critical paths',
        'No standardized logging for errors across services',
        'Missing fallback mechanisms for third-party service failures',
        'Inadequate user feedback when errors occur'
      ]
    },
  ]);

  const [biases, setBiases] = useState<BiasType[]>([
    {
      name: 'Confirmation Bias',
      description: 'Evidence seems cherry-picked to support the main argument',
      severity: 'medium',
    },
    {
      name: 'Authority Bias',
      description: 'Over-reliance on expert opinions without sufficient supporting data',
      severity: 'low',
    },
  ]);

  const [alternatives, setAlternatives] = useState<AlternativeType[]>([
    {
      id: '1',
      explanation: 'Consider cloud-native alternatives for better scalability',
      likelihood: 75,
    },
    {
      id: '2',
      explanation: 'Evaluate microservices architecture for improved modularity',
      likelihood: 60,
    },
  ]);

  // Load analysis data from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('analysisData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setAnalysisData(parsedData);
          
          // Initialize state with the parsed data
          setRecommendations(parsedData.recommendations || []);
          setBiases(parsedData.biases || []);
          setAlternatives(parsedData.alternatives || []);
          
          // Set document synthesis data
          setDocumentSynthesis({
            title: parsedData.title || "Analysis Report",
            subtitle: parsedData.subtitle || "Detailed breakdown of the content's reasoning and evidence",
            summary: parsedData.summary || "This analysis examines the structure, evidence, and reasoning of the provided content.",
            source: {
              type: "document" as const,
              url: "https://example.com/analyzed-content",
              name: "Analyzed Content",
              date: new Date().toLocaleDateString()
            }
          });
        } catch (error) {
          console.error('Error parsing analysis data:', error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  // Analysis metrics
  const [analysisMetrics] = useState({
    recommendations: {
      count: 2,
      label: 'Key Recommendations'
    },
    argumentStrength: {
      grade: 'B+',
      score: 85,
      label: 'Argument Strength',
      color: 'from-amber-400 to-emerald-600', // Updated gradient
      summary: "The argument structure is generally sound with clear premises leading to conclusions. Some minor logical gaps exist, but the overall reasoning flow is coherent and well-articulated."
    },
    evidenceQuality: {
      grade: 'Good',
      score: 82,
      label: 'Evidence Quality',
      color: 'from-emerald-500 to-emerald-600', // Updated gradient
      summary: "Evidence is drawn from credible sources and directly supports key claims. Some statistical data lacks context, and a few claims would benefit from additional supporting evidence."
    },
    argumentDetails: [
      { name: "Reasoning", score: 90, description: "Logical flow between premises and conclusions" },
      { name: "Fallacies", score: 88, description: "Few logical fallacies detected" }
    ],
    evidenceDetails: [
      { name: "Source Credibility", score: 85, description: "Mostly reliable and authoritative sources" },
      { name: "Data Relevance", score: 80, description: "Evidence directly supports main arguments" }
    ]
  });

  // Get severity icon and color
  const getSeverityIcon = (severity: BiasType['severity']) => {
    switch (severity) {
      case 'high':
        return <CrossCircledIcon className="h-5 w-5 text-red-400" />;
      case 'medium':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />;
      case 'low':
        return <InfoCircledIcon className="h-5 w-5 text-yellow-400" />;
      default:
        return <InfoCircledIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityBgColor = (severity: BiasType['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-400/10';
      case 'medium':
        return 'bg-orange-400/10';
      case 'low':
        return 'bg-yellow-400/10';
      default:
        return 'bg-muted/30';
    }
  };

  // Get color for grade
  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    if (score >= 60) return 'text-amber-600';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get background for grade
  const getGradeBackground = (score: number) => {
    if (score >= 90) return 'bg-emerald-600/10';
    if (score >= 80) return 'bg-emerald-500/10';
    if (score >= 70) return 'bg-amber-500/10';
    if (score >= 60) return 'bg-amber-600/10';
    if (score >= 50) return 'bg-orange-500/10';
    return 'bg-red-500/10';
  };

  // Get badge color for sub-metrics
  const getMetricBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-600/15 text-emerald-600 border-emerald-600/30';
    if (score >= 80) return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    if (score >= 70) return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    if (score >= 60) return 'bg-amber-600/15 text-amber-600 border-amber-600/30';
    if (score >= 50) return 'bg-orange-500/15 text-orange-500 border-orange-500/30';
    return 'bg-red-500/15 text-red-500 border-red-500/30';
  };

  // Get likelihood icon and color
  const getLikelihoodIcon = (likelihood: number) => {
    if (likelihood >= 80) {
      return <LightningBoltIcon className="h-5 w-5 text-emerald-600" />;
    } else if (likelihood >= 60) {
      return <LightningBoltIcon className="h-5 w-5 text-emerald-500" />;
    } else if (likelihood >= 40) {
      return <MixerHorizontalIcon className="h-5 w-5 text-amber-500" />;
    } else {
      return <MixerHorizontalIcon className="h-5 w-5 text-orange-500" />;
    }
  };

  const getLikelihoodBgColor = (likelihood: number) => {
    if (likelihood >= 80) {
      return 'bg-emerald-600/10';
    } else if (likelihood >= 60) {
      return 'bg-emerald-500/10';
    } else if (likelihood >= 40) {
      return 'bg-amber-500/10';
    } else {
      return 'bg-orange-500/10';
    }
  };

  const getLikelihoodTextColor = (likelihood: number) => {
    if (likelihood >= 80) {
      return 'text-emerald-600 border-emerald-600/30';
    } else if (likelihood >= 60) {
      return 'text-emerald-500 border-emerald-500/30';
    } else if (likelihood >= 40) {
      return 'text-amber-500 border-amber-500/30';
    } else {
      return 'text-orange-500 border-orange-500/30';
    }
  };

  // Get recommendation icon based on id or index
  const getRecommendationIcon = (id: string) => {
    // Use different icons for different recommendations
    switch (id) {
      case '1':
        return <LockClosedIcon className="h-6 w-6 text-primary" />;
      case '2':
        return <RocketIcon className="h-6 w-6 text-secondary" />;
      default:
        return <CheckCircledIcon className="h-6 w-6 text-primary" />;
    }
  };

  // Get recommendation accent color
  const getRecommendationAccent = (id: string) => {
    switch (id) {
      case '1':
        return 'from-primary/20 to-primary/5';
      case '2':
        return 'from-secondary/20 to-secondary/5';
      default:
        return 'from-primary/20 to-primary/5';
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Show loading state while fetching data
  if (isLoading) {
    return <AnalysisLoading status="complete" message="Preparing your analysis..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Document Synthesis Section - Redesigned */}
      <div className="mb-12">
        <div className="relative overflow-hidden rounded-xl border border-border/30 bg-card">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-70"></div>
          
          {/* Content */}
          <div className="relative p-8">
            {/* Source indicator with back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-sm text-muted-foreground">
                {documentSynthesis.source.type === "document" ? (
                  <>
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    <span className="mr-2">Document:</span>
                  </>
                ) : (
                  <>
                    <Link2Icon className="h-4 w-4 mr-2" />
                    <span className="mr-2">Web Page:</span>
                  </>
                )}
                <span className="font-medium text-foreground/80">{documentSynthesis.source.name}</span>
                <span className="mx-2">•</span>
                <span>{documentSynthesis.source.date}</span>
              </div>
              
              {/* Back button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleBackToHome}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            
            {/* Title and subtitle */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-3 text-foreground">
                {documentSynthesis.title}
              </h1>
              <p className="text-xl text-foreground/80 font-medium">
                {documentSynthesis.subtitle}
              </p>
            </div>
            
            {/* Summary with quote styling */}
            <div className="flex">
              <QuoteIcon className="h-8 w-8 text-primary/40 flex-shrink-0 mr-4 mt-1" />
              <div className="bg-gradient-to-r from-primary/10 to-transparent p-5 rounded-r-lg border-l-4 border-primary/30">
                <p className="text-foreground/90 leading-relaxed italic">
                  {documentSynthesis.summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Separator */}
      <div className="relative my-12">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-start">
          <span className="bg-background pl-0 pr-6 text-xl font-medium text-foreground">
            Analysis
          </span>
        </div>
      </div>

      {/* Analysis Metrics */}
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recommendations Count */}
          <div className="bg-card rounded-xl p-5 border border-border/30 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {analysisMetrics.recommendations.label}
              </h3>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircledIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-foreground">
                {analysisMetrics.recommendations.count}
              </span>
            </div>
          </div>

          {/* Argument Strength */}
          <div className="bg-card rounded-xl p-5 border border-border/30 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {analysisMetrics.argumentStrength.label}
            </h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-foreground">
                {analysisMetrics.argumentStrength.grade}
              </span>
              <span className={cn("text-lg font-medium", getGradeColor(analysisMetrics.argumentStrength.score))}>
                {analysisMetrics.argumentStrength.score}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden bg-muted/50">
              <div 
                className={cn("h-full rounded-full bg-gradient-to-r", analysisMetrics.argumentStrength.color)}
                style={{ width: `${analysisMetrics.argumentStrength.score}%` }}
              ></div>
            </div>
          </div>

          {/* Evidence Quality */}
          <div className="bg-card rounded-xl p-5 border border-border/30 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {analysisMetrics.evidenceQuality.label}
            </h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-foreground">
                {analysisMetrics.evidenceQuality.grade}
              </span>
              <span className={cn("text-lg font-medium", getGradeColor(analysisMetrics.evidenceQuality.score))}>
                {analysisMetrics.evidenceQuality.score}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden bg-muted/50">
              <div 
                className={cn("h-full rounded-full bg-gradient-to-r", analysisMetrics.evidenceQuality.color)}
                style={{ width: `${analysisMetrics.evidenceQuality.score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Recommendations Section */}
      <Card className="mb-6 bg-card border-border/50 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Key Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.id} 
                className="relative overflow-hidden rounded-xl border border-border/30"
              >
                {/* Gradient background */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${getRecommendationAccent(rec.id)} opacity-30`}
                />
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Header with number and title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
                      <span className="text-lg font-semibold text-primary">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-medium text-primary">{rec.title}</h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-foreground/80 mb-5 pl-14">{rec.detail}</p>
                  
                  {/* Supporting Evidence */}
                  <div className="pl-14 space-y-3">
                    <h4 className="text-sm font-medium text-foreground/90 flex items-center mb-3">
                      <InfoCircledIcon className="h-4 w-4 mr-1.5 text-primary/70" />
                      Supporting Evidence
                    </h4>
                    <ul className="space-y-3 border-l-2 border-primary/20 pl-4">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-foreground/80">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Argument Quality Section */}
      <Card className="mb-6 bg-card border-border/50 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Argument Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Argument Strength */}
            <div className="p-4 rounded-lg border border-border/30 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Argument Strength</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{analysisMetrics.argumentStrength.grade}</span>
                  <span className={cn("text-sm font-medium", getGradeColor(analysisMetrics.argumentStrength.score))}>
                    ({analysisMetrics.argumentStrength.score}/100)
                  </span>
                </div>
              </div>
              
              <div className="h-2 w-full rounded-full overflow-hidden bg-muted/50 mb-4">
                <div 
                  className={cn("h-full rounded-full bg-gradient-to-r", analysisMetrics.argumentStrength.color)}
                  style={{ width: `${analysisMetrics.argumentStrength.score}%` }}
                ></div>
              </div>
              
              <p className="text-foreground/80 text-sm mb-5">
                {analysisMetrics.argumentStrength.summary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisMetrics.argumentDetails.map((detail, index) => (
                  <div key={index} className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground/90">{detail.name}</span>
                      <Badge variant="outline" className={cn(getMetricBadgeColor(detail.score))}>
                        {detail.score}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{detail.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Evidence Quality */}
            <div className="p-4 rounded-lg border border-border/30 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Evidence Quality</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{analysisMetrics.evidenceQuality.grade}</span>
                  <span className={cn("text-sm font-medium", getGradeColor(analysisMetrics.evidenceQuality.score))}>
                    ({analysisMetrics.evidenceQuality.score}/100)
                  </span>
                </div>
              </div>
              
              <div className="h-2 w-full rounded-full overflow-hidden bg-muted/50 mb-4">
                <div 
                  className={cn("h-full rounded-full bg-gradient-to-r", analysisMetrics.evidenceQuality.color)}
                  style={{ width: `${analysisMetrics.evidenceQuality.score}%` }}
                ></div>
              </div>
              
              <p className="text-foreground/80 text-sm mb-5">
                {analysisMetrics.evidenceQuality.summary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisMetrics.evidenceDetails.map((detail, index) => (
                  <div key={index} className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground/90">{detail.name}</span>
                      <Badge variant="outline" className={cn(getMetricBadgeColor(detail.score))}>
                        {detail.score}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{detail.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Potential Biases Section */}
      <Card className="mb-6 bg-card border-border/50 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Potential Biases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {biases.map((bias, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  getSeverityBgColor(bias.severity)
                )}>
                  {getSeverityIcon(bias.severity)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{bias.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs capitalize',
                        bias.severity === 'high' ? 'border-red-400/30 text-red-400' : 
                        bias.severity === 'medium' ? 'border-orange-400/30 text-orange-400' : 
                        'border-yellow-400/30 text-yellow-400'
                      )}
                    >
                      {bias.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{bias.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Potential Alternatives Section */}
      <Card className="mb-6 bg-card border-border/50 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Potential Alternatives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alternatives.map((alt) => (
              <div key={alt.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 border border-border/30">
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  getLikelihoodBgColor(alt.likelihood)
                )}>
                  {getLikelihoodIcon(alt.likelihood)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">Alternative Explanation</h3>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        getLikelihoodTextColor(alt.likelihood)
                      )}
                    >
                      {alt.likelihood}% likely
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alt.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary">
            <Share2Icon className="h-4 w-4 mr-2" />
            Share Analysis
          </Button>
          <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Was this analysis helpful?</p>
          <div className="flex gap-4">
            <Button
              variant={isHelpful === true ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex items-center gap-2',
                isHelpful === true 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'
              )}
              onClick={() => setIsHelpful(true)}
            >
              <ThickArrowUpIcon className="h-4 w-4" />
              Yes
            </Button>
            <Button
              variant={isHelpful === false ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex items-center gap-2',
                isHelpful === false 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'
              )}
              onClick={() => setIsHelpful(false)}
            >
              <ThickArrowDownIcon className="h-4 w-4" />
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
