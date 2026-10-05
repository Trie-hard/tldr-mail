import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getResourcesForCategory } from '@/lib/resources';
import { getMockAnalysisForText } from '@/lib/mock-data';

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tldr: {
      type: Type.STRING,
      description: 'One-sentence summary of the letter at a 6th-grade reading level.',
    },
    category: {
      type: Type.STRING,
      description:
        'Letter category. Must be one of: eviction, utility-shutoff, benefits-denial, medical-bill, court-summons, tax-notice, school-form, insurance, debt-collection, government, unknown.',
    },
    urgency: {
      type: Type.STRING,
      description:
        'Urgency level. Must be one of: critical, action-required, informational.',
    },
    sender: {
      type: Type.STRING,
      description: 'Name of the organization or person who sent this letter.',
    },
    whatItWants: {
      type: Type.STRING,
      description:
        'Plain-language explanation of what this letter wants the recipient to do, written at a 6th-grade reading level.',
    },
    deadline: {
      type: Type.STRING,
      description:
        'Human-readable deadline description (e.g., "October 7, 2026 — 3 days from now"). Use null if no deadline.',
    },
    deadlineDate: {
      type: Type.STRING,
      description:
        'ISO 8601 date string of the deadline (e.g., "2026-10-07"). Use null if no deadline found.',
    },
    financialAmount: {
      type: Type.STRING,
      description:
        'Total dollar amount due if any (e.g., "$1,625.00"). Use null if no amount mentioned.',
    },
    consequenceOfInaction: {
      type: Type.STRING,
      description:
        'Plain-language explanation of what will happen if the recipient ignores this letter, at a 6th-grade reading level.',
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          order: { type: Type.INTEGER, description: 'Step number starting from 1.' },
          action: {
            type: Type.STRING,
            description: 'What to do in this step, written simply.',
          },
          timeframe: {
            type: Type.STRING,
            description: 'When to do this (e.g., "Today", "Before Oct 7", "This week").',
          },
        },
        required: ['order', 'action', 'timeframe'],
      },
      description: 'Ordered list of 3-6 action steps the recipient should take.',
    },
    keyFacts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 3-5 key facts or numbers from the letter.',
    },
    isHighStakes: {
      type: Type.BOOLEAN,
      description:
        'True if this letter involves potential loss of housing, court action, loss of benefits, or medical emergency.',
    },
    originalLanguageDetected: {
      type: Type.STRING,
      description: 'The language the letter was originally written in (e.g., "English", "Spanish").',
    },
  },
  required: [
    'tldr',
    'category',
    'urgency',
    'sender',
    'whatItWants',
    'consequenceOfInaction',
    'steps',
    'keyFacts',
    'isHighStakes',
    'originalLanguageDetected',
  ],
};

const SYSTEM_PROMPT = `You are TL;DR Mail, an expert at reading official letters, legal notices, government forms, medical bills, and utility notices. Your job is to help people who are confused by official mail understand exactly what they received.

Rules:
1. Write ALL explanations at a 6th-grade reading level. Use short sentences. Avoid jargon.
2. Be accurate — extract exact dates, dollar amounts, account numbers, and names.
3. If the letter is about eviction, court, loss of benefits, or could lead to serious harm, mark isHighStakes as true.
4. For the deadline, calculate how many days from today if possible.
5. Steps should be concrete and actionable — tell them EXACTLY what to do.
6. If you cannot determine a field with confidence, use null rather than guessing.
7. Always detect the original language of the letter.
8. Be empathetic but factual. This person may be scared.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, textContent, language } = body as {
      imageBase64?: string;
      mimeType?: string;
      textContent?: string;
      language?: string;
    };

    if (!imageBase64 && !textContent) {
      return NextResponse.json(
        { error: 'Either imageBase64 or textContent is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if we can use mock data (if no API key or textContent matches a sample letter)
    if (textContent) {
      const mockResult = getMockAnalysisForText(textContent, language?.toLowerCase().slice(0, 2) || 'en');
      if (mockResult && (!apiKey || apiKey.trim() === '')) {
        const resources = getResourcesForCategory(mockResult.category);
        return NextResponse.json({
          analysis: mockResult,
          resources,
          isMock: true,
        });
      }
    }

    if (!apiKey) {
      // Fallback for image upload without an API key
      if (textContent) {
        const mockResult = getMockAnalysisForText(textContent);
        if (mockResult) {
          const resources = getResourcesForCategory(mockResult.category);
          return NextResponse.json({
            analysis: mockResult,
            resources,
            isMock: true,
          });
        }
      }
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured in .env.local. Please add your free key from https://aistudio.google.com/apikey or test one of the 4 sample letters.',
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const langInstruction =
      language && language !== 'en' && language !== 'English'
        ? `\n\nIMPORTANT: Write ALL your explanations, steps, and descriptions in ${language}. The tldr, whatItWants, consequenceOfInaction, steps, and keyFacts must ALL be in ${language}. Keep proper nouns, addresses, and dollar amounts in their original form.`
        : '';

    const userPrompt = `Analyze the following official letter/document and extract all key information. Be thorough and accurate.${langInstruction}`;

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: userPrompt },
    ];

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      });
    }

    if (textContent) {
      parts.push({ text: `\n\n--- LETTER CONTENT ---\n${textContent}\n--- END OF LETTER ---` });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseJsonSchema: ANALYSIS_SCHEMA,
        },
      });

      const analysisText = response.text;
      if (!analysisText) {
        throw new Error('No response received from Gemini model.');
      }

      const analysis = JSON.parse(analysisText);
      const resources = getResourcesForCategory(analysis.category);

      return NextResponse.json({
        analysis,
        resources,
      });
    } catch (genError) {
      console.warn('Gemini generation failed, checking mock fallback:', genError);
      if (textContent) {
        const mockFallback = getMockAnalysisForText(textContent);
        if (mockFallback) {
          const resources = getResourcesForCategory(mockFallback.category);
          return NextResponse.json({
            analysis: mockFallback,
            resources,
            isMock: true,
          });
        }
      }
      throw genError;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
