import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnalysisLoadingProps {
  status: 'extracting' | 'detecting' | 'detected' | 'analyzing' | 'complete';
  message?: string;
  contentType?: 'story' | 'argument';
  confidence?: number;
  reasoning?: string;
}

export function AnalysisLoading({ 
  status, 
  message, 
  contentType, 
  confidence, 
  reasoning 
}: AnalysisLoadingProps) {
  const getStatusText = () => {
    switch (status) {
      case 'extracting':
        return 'Extracting content...';
      case 'detecting':
        return 'Detecting content type...';
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
      case 'analyzing':
        return 75;
      case 'complete':
        return 100;
      default:
        return 0;
    }
  };

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
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Card className="p-8 bg-card border-border/30 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {/* Shimmering brain icon */}
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse delay-300" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full p-4 text-primary"
            >
              <path
                d="M12 3C7.58172 3 4 6.58172 4 11C4 13.7547 5.33945 16.1901 7.5 17.5M12 3C16.4183 3 20 6.58172 20 11C20 13.7547 18.6605 16.1901 16.5 17.5M12 3V7M7.5 17.5C8.71692 18.3954 10.2723 18.9372 12 18.9921M7.5 17.5L6 21M16.5 17.5C15.2831 18.3954 13.7277 18.9372 12 18.9921M16.5 17.5L18 21M12 18.9921V21M12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13M12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13M12 13V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Status text */}
          <h2 className="text-2xl font-bold mb-3 text-foreground">{getStatusText()}</h2>
          <p className="text-foreground/70 mb-4 max-w-md">
            {message || "We're analyzing your content to provide the most insightful breakdown. This should only take a moment."}
          </p>

          {/* Content type badge */}
          {getContentTypeBadge()}

          {/* Reasoning (if available) */}
          {reasoning && status === 'detected' && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30 max-w-md">
              <p className="text-sm text-foreground/80 text-left">
                <span className="font-medium">Why we think this is a {contentType}:</span><br />
                {reasoning}
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full max-w-md h-2 bg-muted/50 rounded-full overflow-hidden mb-6 mt-6">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-in-out"
              style={{ width: `${getProgress()}%` }}
            />
          </div>

          {/* Shimmering dots */}
          <div className="flex space-x-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full bg-primary/80",
                  "animate-pulse",
                  i === 1 && "animation-delay-200",
                  i === 2 && "animation-delay-400"
                )}
                style={{
                  animationDelay: `${i * 200}ms`
                }}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 