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
        return 'bg-yellow-100 text-yellow-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Analysis Report</h1>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary">2 Key Recommendations</Badge>
          <Badge variant="secondary">Argument Strength: B+</Badge>
          <Badge variant="secondary">Evidence Quality: Good</Badge>
        </div>
      </div>

      {/* Key Recommendations Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Key Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Collapsible key={rec.id}>
                <CollapsibleTrigger className="flex items-center w-full text-left p-2 hover:bg-gray-50 rounded-md">
                  <span className="font-medium">{rec.title}</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2 pl-4 text-gray-600">
                  {rec.detail}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Argument Quality Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Argument Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Overall Score</span>
                <span className="font-semibold">85/100</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="grid gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Reasoning</span>
                  <span>90/100</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Evidence</span>
                  <span>82/100</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Fallacies</span>
                  <span>88/100</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Identified Biases</h4>
              {biases.map((bias, index) => (
                <Alert key={index}>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{bias.name}</span>
                        <p className="text-sm text-gray-600">{bias.description}</p>
                      </div>
                      <Badge className={cn('ml-2', getSeverityColor(bias.severity))}>
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Alternative Explanations & Pitfalls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alternatives.map((alt) => (
              <div key={alt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p>{alt.explanation}</p>
                <Badge variant="outline">
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
          <Button variant="outline" className="flex items-center gap-2">
            <Share2Icon className="h-4 w-4" />
            Share Analysis
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-gray-600">Was this analysis helpful?</p>
          <div className="flex gap-4">
            <Button
              variant={isHelpful === true ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsHelpful(true)}
            >
              <ThickArrowUpIcon className="h-4 w-4" />
              Yes
            </Button>
            <Button
              variant={isHelpful === false ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
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
