import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
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
You are an expert at analyzing arguments and reasoning. Your task is to analyze the provided content and extract key insights in a structured format.

Analyze the content progressively in these steps:

1. Initial Assessment (respond immediately):
{
  "title": "3-5 word essence of the content",
  "subtitle": "10-15 word elaboration",
  "summary": "2-3 sentence overview",
  "contentType": "argument" | "story",
  "confidence": 0-100
}

2. Core Analysis (respond as each section is completed):
{
  "structure": {
    "mainClaim": "The central argument being made",
    "supportingPoints": ["Array of key supporting points"],
    "evidenceTypes": ["Data", "Examples", "Expert opinions", etc],
    "logicalFlow": "Assessment of how well points connect"
  },
  "quality": {
    "argumentStrength": {
      "score": 0-100,
      "grade": "A+/A/B+/etc",
      "reasoning": "Why this grade was given",
      "strongPoints": ["What works well"],
      "weakPoints": ["Areas that could be stronger"]
    },
    "evidenceQuality": {
      "score": 0-100,
      "grade": "Excellent/Good/Fair/etc",
      "analysis": "Assessment of evidence quality",
      "credibility": "Evaluation of source credibility",
      "relevance": "How well evidence supports claims"
    }
  }
}

3. Detailed Recommendations (respond as analysis deepens):
{
  "recommendations": [
    {
      "id": "unique_id",
      "title": "Actionable recommendation",
      "detail": "Detailed explanation",
      "reasons": ["3-4 specific supporting points"],
      "priority": "high" | "medium" | "low",
      "impact": "Expected outcome if implemented"
    }
  ]
}

4. Critical Analysis (respond as patterns emerge):
{
  "biases": [
    {
      "name": "Type of bias",
      "description": "How it manifests in the argument",
      "severity": "high" | "medium" | "low",
      "impact": "How it affects the argument",
      "mitigation": "How to address this bias"
    }
  ],
  "alternatives": [
    {
      "id": "unique_id",
      "explanation": "Alternative perspective",
      "likelihood": 0-100,
      "supportingEvidence": ["Evidence for this alternative"],
      "counterEvidence": ["Evidence against this alternative"]
    }
  ]
}

5. Final Insights (respond after full analysis):
{
  "keyTakeaways": ["Most important insights"],
  "actionableSteps": ["Specific actions to improve"],
  "furtherConsiderations": ["Additional points to consider"]
}

Respond with each section as it's completed, allowing for progressive updates.
Each response should be a valid JSON object containing the completed section.
Include a "status" field indicating which section is being delivered.
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

// Helper function to detect content type
export async function detectContentType(content: string): Promise<DetectionResponse> {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('No valid content provided for content type detection');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a precise content analyzer that only responds in valid JSON format.

Analyze the following text to:
1. Determine if it's a story or an argument
2. Extract key metadata

You must respond with ONLY a JSON object in this exact format:
{
  "contentType": "story" | "argument",
  "confidence": number (0-100),
  "reasoning": "explanation of why this is a story or argument",
  "metadata": {
    "title": "extracted or generated title",
    "subtitle": "extracted or generated subtitle",
    "summary": "concise summary of the content",
    "keyPoints": ["array", "of", "main", "points"]
  }
}

Do not include any other text or explanation outside of the JSON structure.`
        },
        {
          role: 'user',
          content: content.substring(0, 2000) + (content.length > 2000 ? '...' : '')
        }
      ],
      temperature: 0.1 // Lower temperature for more consistent outputs
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI API');
    }

    try {
      return JSON.parse(responseText) as DetectionResponse;
    } catch (parseError) {
      console.error('Error parsing detection response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse content type detection response - invalid JSON format');
    }
  } catch (error) {
    console.error('Error in content type detection:', error);
    throw error;
  }
}

// Helper function to analyze argument content
export async function analyzeContent(content: string): Promise<ArgumentAnalysis> {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('No valid content provided for argument analysis');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a precise argument analyzer that only responds in valid JSON format.

Analyze the provided argument and respond with ONLY a JSON object in this exact format:
{
  "keyRecommendations": {
    "primary": ["array", "of", "primary", "recommendations"],
    "secondary": ["array", "of", "secondary", "recommendations"],
    "actionItems": ["array", "of", "specific", "actions"]
  },
  "argumentQuality": {
    "strength": number (0-100),
    "logicalStructure": "description of logical structure",
    "evidenceQuality": {
      "score": number (0-100),
      "analysis": "analysis of evidence quality",
      "sources": ["array", "of", "sources"]
    },
    "reasoning": {
      "score": number (0-100),
      "analysis": "analysis of reasoning",
      "flaws": ["array", "of", "logical", "flaws"]
    }
  },
  "potentialBiases": {
    "cognitive": ["array", "of", "cognitive", "biases"],
    "contextual": ["array", "of", "contextual", "biases"],
    "methodological": ["array", "of", "methodological", "biases"]
  },
  "potentialAlternatives": {
    "perspectives": ["array", "of", "alternative", "perspectives"],
    "counterarguments": ["array", "of", "counterarguments"],
    "considerations": ["array", "of", "additional", "considerations"]
  }
}

Do not include any other text or explanation outside of the JSON structure.`
        },
        {
          role: 'user',
          content
        }
      ],
      temperature: 0.3
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI API');
    }

    try {
      return JSON.parse(responseText) as ArgumentAnalysis;
    } catch (parseError) {
      console.error('Error parsing analysis response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse argument analysis response - invalid JSON format');
    }
  } catch (error) {
    console.error('Error in argument analysis:', error);
    throw error;
  }
}

// Helper function to analyze story content
export async function analyzeStory(content: string): Promise<StoryAnalysis> {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('No valid content provided for story analysis');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a precise story analyzer that only responds in valid JSON format.

Analyze the provided story and respond with ONLY a JSON object in this exact format:
{
  "narrative": {
    "structure": "description of narrative structure",
    "themes": ["array", "of", "themes"],
    "symbolism": ["array", "of", "symbols"]
  },
  "characters": {
    "main": [
      {
        "name": "character name",
        "role": "character role",
        "development": "character development"
      }
    ],
    "relationships": ["array", "of", "key", "relationships"]
  },
  "setting": {
    "time": "time period",
    "place": "location",
    "atmosphere": "description of atmosphere"
  },
  "literaryElements": {
    "style": "writing style description",
    "tone": "tone description",
    "devices": ["array", "of", "literary", "devices"]
  }
}

Do not include any other text or explanation outside of the JSON structure.`
        },
        {
          role: 'user',
          content
        }
      ],
      temperature: 0.3
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI API');
    }

    try {
      return JSON.parse(responseText) as StoryAnalysis;
    } catch (parseError) {
      console.error('Error parsing story analysis response:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse story analysis response - invalid JSON format');
    }
  } catch (error) {
    console.error('Error in story analysis:', error);
    throw error;
  }
}

// Helper function to extract text from a URL
export async function extractTextFromUrl(url: string): Promise<string> {
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('No valid URL provided for content extraction');
  }

  try {
    // Validate URL format
    const validUrl = new URL(url);

    // Add more headers to mimic a real browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    };

    // First try with standard fetch
    let response = await fetch(url, { headers });

    // If that fails, try with a proxy service (you would need to set this up)
    if (!response.ok && response.status === 403) {
      // For now, we'll throw a more user-friendly error
      throw new Error(`This website (${validUrl.hostname}) doesn't allow direct access to its content. Please copy and paste the text directly instead.`);
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || '';

    // If it's HTML, parse and extract text
    if (contentType.includes('text/html')) {
      const html = await response.text();
      
      // Use regex to extract text content and clean it up
      const textContent = html
        // Remove scripts, styles, and other non-content tags
        .replace(/<(script|style|iframe|noscript|head|header|footer|nav)[^>]*>[\s\S]*?<\/\1>/gi, '')
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove all remaining HTML tags but preserve line breaks
        .replace(/<br[^>]*>/gi, '\n')
        .replace(/<p[^>]*>/gi, '\n\n')
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        // Replace multiple spaces, newlines, and tabs with appropriate spacing
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Trim whitespace
        .trim();

      if (!textContent) {
        throw new Error('No readable text content found in the webpage');
      }

      return textContent;
    } 
    // If it's plain text, just return the content
    else if (contentType.includes('text/plain')) {
      return await response.text();
    }
    // For other content types, throw an error
    else {
      throw new Error(`This URL contains ${contentType} content, which is not supported. Please copy and paste the text directly instead.`);
    }
  } catch (error) {
    console.error('Error extracting text from URL:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract content from URL');
  }
} 