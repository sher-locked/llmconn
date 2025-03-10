import { NextRequest } from 'next/server';
import { detectContentType, analyzeContent, analyzeStory, extractTextFromUrl } from '@/lib/openai';
import OpenAI from 'openai';

export const runtime = 'edge';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the expected response structure for content detection
interface DetectionResponse {
  contentType: 'story' | 'argument';
  confidence: number;
  reasoning: string;
  metadata: {
    title: string;
    subtitle: string;
    summary: string;
    keyPoints: string[];
  };
}

// Define the expected response structure for argument analysis
interface ArgumentAnalysis {
  keyRecommendations: {
    primary: string[];
    secondary: string[];
    actionItems: string[];
  };
  argumentQuality: {
    strength: number;
    logicalStructure: string;
    evidenceQuality: {
      score: number;
      analysis: string;
      sources: string[];
    };
    reasoning: {
      score: number;
      analysis: string;
      flaws: string[];
    };
  };
  potentialBiases: {
    cognitive: string[];
    contextual: string[];
    methodological: string[];
  };
  potentialAlternatives: {
    perspectives: string[];
    counterarguments: string[];
    considerations: string[];
  };
}

// Define the expected response structure for story analysis
interface StoryAnalysis {
  narrative: {
    structure: string;
    themes: string[];
    symbolism: string[];
  };
  characters: {
    main: Array<{
      name: string;
      role: string;
      development: string;
    }>;
    relationships: string[];
  };
  setting: {
    time: string;
    place: string;
    atmosphere: string;
  };
  literaryElements: {
    style: string;
    tone: string;
    devices: string[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const { content, contentType, url } = await req.json();
    
    // Create encoder for sending updates
    const encoder = new TextEncoder();
    
    // Create a stream to send progress updates
    const stream = new ReadableStream({
      async start(controller) {
        // Helper function to send updates
        const sendUpdate = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        
        try {
          // Process the content based on the source
          let textContent = content;
          
          // If URL is provided, extract text from it
          if (url) {
            try {
              sendUpdate({ status: 'extracting', message: 'Extracting content from URL...' });
              textContent = await extractTextFromUrl(url);
              if (!textContent) {
                throw new Error('No content could be extracted from the URL');
              }
              sendUpdate({ status: 'extracted', message: 'Content extracted successfully' });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to extract content from URL';
              sendUpdate({ 
                status: 'error', 
                error: errorMessage,
                suggestion: 'Try copying and pasting the text content directly instead.'
              });
              controller.close();
              return;
            }
          }

          // Validate that we have content to analyze
          if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
            sendUpdate({ 
              status: 'error', 
              error: 'No valid content provided.',
              suggestion: 'Please provide either text content or a valid URL with accessible content.'
            });
            controller.close();
            return;
          }

          // Step 1: Initial Assessment
          sendUpdate({ status: 'initializing', message: 'Starting initial assessment...' });
          const initialAssessment = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Perform an initial assessment of the content. Respond with ONLY the Initial Assessment section from the analysis prompt.'
              },
              {
                role: 'user',
                content: textContent
              }
            ],
            stream: true,
          });

          let initialAssessmentResponse = '';
          for await (const chunk of initialAssessment) {
            const content = chunk.choices[0]?.delta?.content || '';
            initialAssessmentResponse += content;
            if (content) {
              sendUpdate({ 
                status: 'initial_assessment', 
                message: 'Processing initial assessment...',
                partial: content
              });
            }
          }

          try {
            const parsedInitialAssessment = JSON.parse(initialAssessmentResponse);
            sendUpdate({ 
              status: 'initial_assessment_complete',
              data: parsedInitialAssessment
            });
          } catch (error) {
            console.error('Error parsing initial assessment:', error);
          }

          // Step 2: Core Analysis
          sendUpdate({ status: 'analyzing_core', message: 'Performing core analysis...' });
          const coreAnalysis = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Perform the core analysis of the content. Respond with ONLY the Core Analysis section from the analysis prompt.'
              },
              {
                role: 'user',
                content: textContent
              }
            ],
            stream: true,
          });

          let coreAnalysisResponse = '';
          for await (const chunk of coreAnalysis) {
            const content = chunk.choices[0]?.delta?.content || '';
            coreAnalysisResponse += content;
            if (content) {
              sendUpdate({ 
                status: 'core_analysis', 
                message: 'Processing core analysis...',
                partial: content
              });
            }
          }

          try {
            const parsedCoreAnalysis = JSON.parse(coreAnalysisResponse);
            sendUpdate({ 
              status: 'core_analysis_complete',
              data: parsedCoreAnalysis
            });
          } catch (error) {
            console.error('Error parsing core analysis:', error);
          }

          // Step 3: Detailed Recommendations
          sendUpdate({ status: 'analyzing_recommendations', message: 'Generating recommendations...' });
          const recommendations = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Generate detailed recommendations based on the content. Respond with ONLY the Detailed Recommendations section from the analysis prompt.'
              },
              {
                role: 'user',
                content: textContent
              }
            ],
            stream: true,
          });

          let recommendationsResponse = '';
          for await (const chunk of recommendations) {
            const content = chunk.choices[0]?.delta?.content || '';
            recommendationsResponse += content;
            if (content) {
              sendUpdate({ 
                status: 'recommendations', 
                message: 'Processing recommendations...',
                partial: content
              });
            }
          }

          try {
            const parsedRecommendations = JSON.parse(recommendationsResponse);
            sendUpdate({ 
              status: 'recommendations_complete',
              data: parsedRecommendations
            });
          } catch (error) {
            console.error('Error parsing recommendations:', error);
          }

          // Step 4: Critical Analysis
          sendUpdate({ status: 'analyzing_critical', message: 'Performing critical analysis...' });
          const criticalAnalysis = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Perform a critical analysis of the content. Respond with ONLY the Critical Analysis section from the analysis prompt.'
              },
              {
                role: 'user',
                content: textContent
              }
            ],
            stream: true,
          });

          let criticalAnalysisResponse = '';
          for await (const chunk of criticalAnalysis) {
            const content = chunk.choices[0]?.delta?.content || '';
            criticalAnalysisResponse += content;
            if (content) {
              sendUpdate({ 
                status: 'critical_analysis', 
                message: 'Processing critical analysis...',
                partial: content
              });
            }
          }

          try {
            const parsedCriticalAnalysis = JSON.parse(criticalAnalysisResponse);
            sendUpdate({ 
              status: 'critical_analysis_complete',
              data: parsedCriticalAnalysis
            });
          } catch (error) {
            console.error('Error parsing critical analysis:', error);
          }

          // Step 5: Final Insights
          sendUpdate({ status: 'finalizing', message: 'Generating final insights...' });
          const finalInsights = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Generate final insights from the analysis. Respond with ONLY the Final Insights section from the analysis prompt.'
              },
              {
                role: 'user',
                content: textContent
              }
            ],
            stream: true,
          });

          let finalInsightsResponse = '';
          for await (const chunk of finalInsights) {
            const content = chunk.choices[0]?.delta?.content || '';
            finalInsightsResponse += content;
            if (content) {
              sendUpdate({ 
                status: 'final_insights', 
                message: 'Processing final insights...',
                partial: content
              });
            }
          }

          try {
            const parsedFinalInsights = JSON.parse(finalInsightsResponse);
            sendUpdate({ 
              status: 'final_insights_complete',
              data: parsedFinalInsights
            });
          } catch (error) {
            console.error('Error parsing final insights:', error);
          }

          // Send completion status
          sendUpdate({ 
            status: 'complete',
            message: 'Analysis completed successfully'
          });

        } catch (error) {
          console.error('Error in analysis stream:', error);
          sendUpdate({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'An error occurred during analysis',
            error: error instanceof Error ? error.message : String(error)
          });
        } finally {
          controller.close();
        }
      }
    });
    
    // Return the stream as a response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to analyze content' 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 