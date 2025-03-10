'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Share2Icon, DownloadIcon, ThickArrowUpIcon, ThickArrowDownIcon } from '@radix-ui/react-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type RecommendationType = {
  id: string;
  title: string;
  detail: string;
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
  const [recommendations] = useState<RecommendationType[]>([
    {
      id: '1',
      title: 'Implement data validation framework',
      detail: 'Current system lacks robust input validation, leading to potential security vulnerabilities.',
    },
    {
      id: '2',
      title: 'Enhance error handling mechanisms',
      detail: 'Error handling is inconsistent across modules, affecting system reliability.',
    },
  ]);

  const [biases] = useState<BiasType[]>([
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

  const [alternatives] = useState<AlternativeType[]>([
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

  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  const getSeverityColor = (severity: BiasType['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-900/20 text-yellow-200 border-yellow-900/50';
      case 'medium':
        return 'bg-orange-900/20 text-orange-200 border-orange-900/50';
      case 'high':
        return 'bg-red-900/20 text-red-200 border-red-900/50';
      default:
        return 'bg-gray-800/20 text-gray-200 border-gray-800/50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-secondary">Analysis Report</h1>
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="border-secondary text-secondary">2 Key Recommendations</Badge>
          <Badge variant="outline" className="border-primary text-primary">Argument Strength: B+</Badge>
          <Badge variant="outline" className="border-accent text-accent">Evidence Quality: Good</Badge>
        </div>
      </div>

      {/* Key Recommendations Section */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-secondary">Key Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Collapsible key={rec.id}>
                <CollapsibleTrigger className="flex items-center w-full text-left p-2 hover:bg-primary/5 rounded-md transition-colors">
                  <span className="font-medium text-primary">{rec.title}</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2 pl-4 text-muted-foreground">
                  {rec.detail}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Argument Quality Section */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-secondary">Argument Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Overall Score</span>
                <span className="font-semibold text-primary">85/100</span>
              </div>
              <Progress value={85} indicatorClassName="bg-primary" />
            </div>
            
            <div className="grid gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Reasoning</span>
                  <span className="text-primary">90/100</span>
                </div>
                <Progress value={90} indicatorClassName="bg-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Evidence</span>
                  <span className="text-primary">82/100</span>
                </div>
                <Progress value={82} indicatorClassName="bg-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Fallacies</span>
                  <span className="text-primary">88/100</span>
                </div>
                <Progress value={88} indicatorClassName="bg-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-secondary">Identified Biases</h4>
              {biases.map((bias, index) => (
                <Alert key={index} className="bg-card border-border">
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-primary">{bias.name}</span>
                        <p className="text-sm text-muted-foreground">{bias.description}</p>
                      </div>
                      <Badge className={cn('ml-2 border', getSeverityColor(bias.severity))}>
                        {bias.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Explanations Section */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-secondary">Alternative Explanations & Pitfalls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alternatives.map((alt) => (
              <div key={alt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                <p className="text-muted-foreground">{alt.explanation}</p>
                <Badge variant="outline" className="border-accent text-accent">
                  {alt.likelihood}% likely
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Share2Icon className="h-4 w-4 mr-2" />
            Share Analysis
          </Button>
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
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
                  : 'border-primary text-primary hover:bg-primary/10'
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
                  : 'border-primary text-primary hover:bg-primary/10'
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
