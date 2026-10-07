import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getMockAppealForCategory } from '@/lib/mock-data';

const APPEAL_SYSTEM_PROMPT = `You are an expert at writing formal appeal letters, dispute letters, and response letters on behalf of regular people.

Rules:
1. Write in a professional but accessible tone.
2. Be respectful and factual.
3. Cite relevant consumer protection rights when applicable (e.g., FDCPA for debt collection, EMTALA for emergency medical care, state tenant protection laws).
4. Include placeholders like [YOUR NAME], [YOUR ADDRESS], [DATE] for the user to fill in.
5. Keep the letter to one page (under 400 words).
6. Include a clear subject line.
7. End with a request for written confirmation of receipt.
8. This is NOT legal advice — it's a template the user can customize.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { letterContext, category, language } = body as {
      letterContext: string;
      category: string;
      language?: string;
    };

    const headerApiKey = request.headers.get('x-gemini-api-key');
    const rawApiKey = headerApiKey || (body as { apiKey?: string }).apiKey || process.env.GEMINI_API_KEY;
    const apiKey = rawApiKey && rawApiKey.trim() !== '' ? rawApiKey.trim() : undefined;
    const langCode = language?.toLowerCase().slice(0, 2) || 'en';

    if (!apiKey) {
      const mockAppeal = getMockAppealForCategory(category, langCode);
      if (mockAppeal) {
        return NextResponse.json({ appealLetter: mockAppeal, isMock: true });
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in .env.local.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const langInstruction =
      language && language !== 'en' && language !== 'English'
        ? `\nWrite the appeal letter in ${language}.`
        : '';

    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    let lastGenError: unknown;
    let appealLetterText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Based on this official letter the user received, write a formal response/appeal/dispute letter they can send back.\n\nLetter category: ${category}\n\nOriginal letter:\n${letterContext}${langInstruction}\n\nFormat the response as a complete, ready-to-send letter with:\n- Recipient address block\n- Date\n- Subject line\n- Body\n- Signature block with [YOUR NAME] placeholder`,
          config: {
            systemInstruction: APPEAL_SYSTEM_PROMPT,
          },
        });

        if (response.text) {
          appealLetterText = response.text;
          break;
        }
      } catch (err) {
        lastGenError = err;
        console.warn(`Gemini model ${modelName} failed, attempting next available model:`, err instanceof Error ? err.message : err);
      }
    }

    if (appealLetterText) {
      return NextResponse.json({ appealLetter: appealLetterText });
    }

    const mockAppeal = getMockAppealForCategory(category, langCode);
    if (mockAppeal) {
      return NextResponse.json({ appealLetter: mockAppeal, isMock: true });
    }

    throw lastGenError || new Error('No response received from Gemini model.');
  } catch (error) {
    console.error('Appeal letter error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
