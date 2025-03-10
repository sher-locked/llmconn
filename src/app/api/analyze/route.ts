import { NextRequest } from 'next/server';
import { detectContentType, analyzeContent, analyzeStory, extractTextFromUrl } from '@/lib/openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { content, contentType, url } = await req.json();
    
    // Process the content based on the source
    let textContent = content;
    
    // If URL is provided, extract text from it
    if (url && !content) {
      textContent = await extractTextFromUrl(url);
    }
    
    // Create a stream to send progress updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Helper function to send updates
        const sendUpdate = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };
        
        try {
          // Step 1: Extract content if needed
          if (url && !content) {
            sendUpdate({ status: 'extracting', message: 'Extracting content from URL...' });
          }
          
          // Step 2: Detect content type if not provided
          let detectedType = contentType;
          let confidence = 0;
          let reasoning = '';
          
          if (!detectedType) {
            sendUpdate({ status: 'detecting', message: 'Detecting content type...' });
            const detectionResult = await detectContentType(textContent);
            detectedType = detectionResult.contentType;
            confidence = detectionResult.confidence;
            reasoning = detectionResult.reasoning;
            
            sendUpdate({ 
              status: 'detected', 
              contentType: detectedType,
              confidence: confidence,
              reasoning: reasoning,
              message: `Detected as ${detectedType} (${confidence}% confidence)`
            });
            
            // Add a small delay to allow the UI to update
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Step 3: Analyze based on content type
          if (detectedType === 'story') {
            sendUpdate({ status: 'analyzing', message: 'Analyzing story content...' });
            const storyResult = await analyzeStory(textContent);
            sendUpdate({ 
              status: 'complete', 
              result: storyResult, 
              contentType: 'story',
              confidence: confidence,
              reasoning: reasoning
            });
          } else {
            sendUpdate({ status: 'analyzing', message: 'Analyzing argument content...' });
            const analysisResult = await analyzeContent(textContent);
            sendUpdate({ 
              status: 'complete', 
              result: analysisResult, 
              contentType: 'argument',
              confidence: confidence,
              reasoning: reasoning
            });
          }
        } catch (error) {
          console.error('Error in analysis stream:', error);
          sendUpdate({ status: 'error', message: 'An error occurred during analysis' });
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
    return new Response(JSON.stringify({ error: 'Failed to analyze content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 