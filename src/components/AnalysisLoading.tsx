import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

interface AnalysisLoadingProps {
  status: string;
  message: string;
  progress: number;
  contentType?: 'story' | 'argument';
  confidence?: number;
  reasoning?: string;
  requestData?: any;
  responseData?: any;
}

export function AnalysisLoading({ 
  status, 
  message, 
  progress,
  contentType, 
  confidence, 
  reasoning,
  requestData,
  responseData
}: AnalysisLoadingProps) {
  const getStatusText = () => {
    switch (status) {
      case 'extracting':
        return 'Extracting content...';
      case 'detecting':
        return 'Detecting content type...';
      case 'detected':
        return 'Content type detected!';
      case 'analyzing':
        return 'Analyzing content...';
      case 'complete':
        return 'Analysis complete!';
      default:
        return 'Processing...';
    }
  };

  const getProgress = () => {
    switch (status) {
      case 'extracting':
        return 25;
      case 'detecting':
        return 50;
      case 'detected':
        return 75;
      case 'analyzing':
        return 90;
      case 'complete':
        return 100;
      default:
        return 0;
    }
  };

  // Ensure we show the loading state for at least 1 second after completion
  React.useEffect(() => {
    if (status === 'complete') {
      const timer = setTimeout(() => {
        // The parent component will handle navigation
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getContentTypeBadge = () => {
    if (!contentType) return null;
    
    return (
      <Badge 
        className={cn(
          "mt-2 px-3 py-1",
          contentType === 'story' 
            ? "bg-amber-400/10 text-amber-400 border-amber-400/20" 
            : "bg-primary/10 text-primary border-primary/20"
        )}
      >
        {contentType === 'story' ? 'Story' : 'Argument'}
        {confidence !== undefined && ` (${confidence}% confidence)`}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Analyzing Content
              </h2>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-right">
                {progress}% complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 