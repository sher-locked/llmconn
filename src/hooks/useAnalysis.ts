import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnalysisParams {
  content?: string;
  url?: string | null;
  onStatusUpdate?: (status: string, message?: string) => void;
  onContentTypeDetected?: (type: 'story' | 'argument', confidence?: number, reasoning?: string) => void;
  stopAfterDetection?: boolean;
}

interface AnalysisResult {
  contentType: 'story' | 'argument';
  data?: any;
}

export function useAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Store analysis results in sessionStorage to access them on the results pages
  const storeResults = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  };

  const analyze = async ({ 
    content, 
    url, 
    onStatusUpdate, 
    onContentTypeDetected,
    stopAfterDetection = false
  }: AnalysisParams): Promise<AnalysisResult> => {
    setIsLoading(true);
    
    try {
      // Call the analysis API with streaming response
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, url }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response reader');

      // Process the stream data
      let contentType: 'story' | 'argument' = 'argument';
      let result: any = null;
      let shouldStop = false;

      // Create a TextDecoder to decode the stream chunks
      const decoder = new TextDecoder();
      let buffer = '';

      // Read the stream
      while (true) {
        // If we should stop after detection and we've already detected the content type
        if (shouldStop) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and add it to the buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete events in the buffer
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the last incomplete event in the buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Update status if callback provided
              if (onStatusUpdate && data.status) {
                onStatusUpdate(data.status, data.message);
              }
              
              // Call content type detected callback if available
              if (data.status === 'detected' && data.contentType && onContentTypeDetected) {
                onContentTypeDetected(
                  data.contentType,
                  data.confidence,
                  data.reasoning
                );
                
                // If we should stop after detection, set the flag
                if (stopAfterDetection) {
                  contentType = data.contentType;
                  shouldStop = true;
                  break;
                }
              }
              
              // Store content type and result when complete
              if (data.contentType) {
                contentType = data.contentType;
              }
              
              if (data.status === 'complete' && data.result) {
                result = data.result;
                
                // Store the result in sessionStorage based on content type
                if (contentType === 'story') {
                  storeResults('storyData', result);
                } else {
                  storeResults('analysisData', result);
                }
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }

      setIsLoading(false);
      return { contentType, data: result };
    } catch (error) {
      console.error('Analysis error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  return { analyze, isLoading };
} 