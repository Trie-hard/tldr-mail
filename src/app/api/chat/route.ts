import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getMockChatResponse } from '@/lib/mock-data';

const CHAT_SYSTEM_PROMPT = `You are TL;DR Mail's letter assistant. The user has received an official letter and has already seen a plain-language breakdown. Now they have follow-up questions.

Rules:
1. Answer at a 6th-grade reading level. Keep sentences short and clear.
2. Be helpful and empathetic — the user may be stressed or scared.
3. You are NOT a lawyer. If the user asks for specific legal advice, remind them to contact a legal aid organization.
4. Always clarify that your answers are informational, not legal or financial advice.
5. Focus on practical next steps the user can take.
6. If the user asks in a language other than English, respond in that same language.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, letterContext, language } = body as {
      question: string;
      letterContext: string;
      language?: string;
    };

    if (!question) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const headerApiKey = request.headers.get('x-gemini-api-key');
    const rawApiKey = headerApiKey || (body as { apiKey?: string }).apiKey || process.env.GEMINI_API_KEY;
    const apiKey = rawApiKey && rawApiKey.trim() !== '' ? rawApiKey.trim() : undefined;

    if (!apiKey) {
      const mockAnswer = getMockChatResponse(question, letterContext || '');
      return NextResponse.json({ answer: mockAnswer, isMock: true });
    }

    const ai = new GoogleGenAI({ apiKey });

    const langInstruction =
      language && language !== 'en' && language !== 'English'
        ? `\nRespond in ${language}.`
        : '';

    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    let lastGenError: unknown;
    let answerText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `The user received this letter:\n\n${letterContext}\n\nTheir question: ${question}${langInstruction}`,
          config: {
            systemInstruction: CHAT_SYSTEM_PROMPT,
          },
        });

        if (response.text) {
          answerText = response.text;
          break;
        }
      } catch (err) {
        lastGenError = err;
        console.warn(`Gemini model ${modelName} failed, attempting next available model:`, err instanceof Error ? err.message : err);
      }
    }

    if (answerText) {
      return NextResponse.json({ answer: answerText });
    }

    const mockAnswer = getMockChatResponse(question, letterContext || '');
    if (mockAnswer) {
      return NextResponse.json({ answer: mockAnswer, isMock: true });
    }

    throw lastGenError || new Error('No response received from Gemini model.');
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
