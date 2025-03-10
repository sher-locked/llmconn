import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Content type detection prompt
export const CONTENT_TYPE_PROMPT = `
You are an expert at analyzing text content. Your task is to determine if the provided content is primarily:
1. A story/narrative (fiction, personal experience, anecdote, etc.)
2. An argument/analysis (opinion piece, research, analysis, etc.)

Analyze the text carefully and respond ONLY with a JSON object in this exact format:
{
  "contentType": "story" or "argument",
  "confidence": a number between 0 and 100 representing your confidence level,
  "reasoning": "A brief explanation of why you classified it this way"
}

Do not include any other text in your response, only the JSON object.
`;

// Analysis prompt
export const ANALYSIS_PROMPT = `
You are an expert at analyzing arguments and reasoning. Your task is to analyze the provided content and extract:

1. Title: A concise 3-5 word title that captures the essence of the content
2. Subtitle: A 10-15 word subtitle that elaborates on the title
3. Summary: A 2-3 sentence summary of the content
4. Recommendations: 2-3 key recommendations based on the content, each with:
   - Title: A concise recommendation title
   - Detail: A brief explanation of the recommendation
   - Reasons: 3-4 specific supporting points for this recommendation
5. Biases: 1-2 potential biases in the argument, each with:
   - Name: The type of bias
   - Description: A brief explanation of how this bias manifests
   - Severity: "low", "medium", or "high"
6. Alternatives: 1-2 alternative explanations or perspectives, each with:
   - Explanation: A brief description of the alternative view
   - Likelihood: A percentage (0-100) indicating how likely this alternative is
7. Metrics:
   - Argument Strength: A score (0-100) and grade (A+, A, B+, etc.)
   - Evidence Quality: A score (0-100) and grade (Excellent, Good, Fair, etc.)

Respond in JSON format with these fields.
`;

// Story prompt
export const STORY_PROMPT = `
You are an expert at analyzing narrative content. Your task is to analyze the provided story and extract:

1. Title: A concise, engaging title that captures the essence of the story
2. Subtitle: A 10-15 word subtitle that elaborates on the title
3. Summary: A 2-3 sentence summary of the story
4. Mood: The primary mood of the story (whimsical, dramatic, reflective, or adventurous)
5. Reading Time: Estimated reading time in minutes based on the content length

Respond in JSON format with these fields.
`;

// Type definitions for API responses
export interface ContentTypeResponse {
  contentType: 'story' | 'argument';
  confidence: number;
  reasoning: string;
}

export interface AnalysisResponse {
  title: string;
  subtitle: string;
  summary: string;
  recommendations: {
    id: string;
    title: string;
    detail: string;
    reasons: string[];
  }[];
  biases: {
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  alternatives: {
    id: string;
    explanation: string;
    likelihood: number;
  }[];
  metrics: {
    argumentStrength: {
      score: number;
      grade: string;
    };
    evidenceQuality: {
      score: number;
      grade: string;
    };
  };
}

export interface StoryResponse {
  title: string;
  subtitle: string;
  summary: string;
  mood: 'whimsical' | 'dramatic' | 'reflective' | 'adventurous';
  readingTime: string;
}

// Helper function to detect content type
export async function detectContentType(content: string): Promise<ContentTypeResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CONTENT_TYPE_PROMPT },
      { role: 'user', content }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      contentType: result.contentType === 'story' ? 'story' : 'argument',
      confidence: result.confidence || 0,
      reasoning: result.reasoning || 'No reasoning provided'
    };
  } catch (error) {
    console.error('Error parsing content type response:', error);
    // Default to argument if parsing fails
    return {
      contentType: 'argument',
      confidence: 0,
      reasoning: 'Failed to determine content type'
    };
  }
}

// Helper function to analyze argument content
export async function analyzeContent(content: string): Promise<AnalysisResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: ANALYSIS_PROMPT },
      { role: 'user', content }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result as AnalysisResponse;
}

// Helper function to analyze story content
export async function analyzeStory(content: string): Promise<StoryResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: STORY_PROMPT },
      { role: 'user', content }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result as StoryResponse;
}

// Helper function to extract text from a URL
export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    // In a real implementation, you would use a service to extract text from URLs
    // For now, we'll simulate this with a placeholder
    return `Extracted content from ${url}. This would be the actual text content in a real implementation.`;
  } catch (error) {
    console.error('Error extracting text from URL:', error);
    throw new Error('Failed to extract text from URL');
  }
} 