import { NextRequest, NextResponse } from 'next/server';
import { callClaudeText, callClaudeVision } from '@/utils/claude';
import { callGeminiCli, extractJsonFromCliOutput } from '@/utils/geminiCli';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, currentContext, recentEvents, customClaudeKey } = await req.json();

    const claudeKey = customClaudeKey || process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const prompt = `
You are the Vision & Action Brain of "The AI Apprentice".
An expert is performing actions on an Accounts Payable ERP screen.

Recent Events:
${JSON.stringify(recentEvents || []).slice(0, 500)}

Current Context:
${JSON.stringify(currentContext || {})}

Analyze what the expert did.
If they made a significant judgment call or unwritten rule (e.g. changing cost center on high value item, holding seasonal invoice):
Suggest a natural spoken question the AI apprentice should ask at a pause to uncover the hidden reason or guardrail.

Respond ONLY with valid JSON:
{
  "hasMeaningfulAction": true,
  "action": "string",
  "targetField": "string",
  "oldValue": "string",
  "newValue": "string",
  "description": "string",
  "isGuardrailTrigger": true,
  "guardrailNote": "string",
  "suggestedQuestion": "string"
}
`;

    // 1. Try Claude on Vercel
    if (claudeKey && (imageBase64 || currentContext)) {
      try {
        let claudeOutput = '';
        if (imageBase64) {
          claudeOutput = await callClaudeVision(prompt, imageBase64, claudeKey);
        } else {
          claudeOutput = await callClaudeText(prompt, claudeKey);
        }

        const parsed = extractJsonFromCliOutput(claudeOutput);
        if (parsed && parsed.action) {
          return NextResponse.json(parsed);
        }
      } catch (claudeErr: any) {
        console.warn('Claude vision analysis notice:', claudeErr.message);
      }
    }

    // 2. Try Gemini API on Vercel
    if (geminiKey && (imageBase64 || currentContext)) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let content: any = [prompt];
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          content.push({
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          });
        }

        const result = await model.generateContent(content);
        const parsed = extractJsonFromCliOutput(result.response.text());
        if (parsed && parsed.action) {
          return NextResponse.json(parsed);
        }
      } catch (geminiErr: any) {
        console.warn('Gemini vision API notice:', geminiErr.message);
      }
    }

    // 3. Try Gemini CLI if running locally
    if (currentContext || recentEvents) {
      try {
        const cliOutput = await callGeminiCli(prompt, 6000);
        const parsed = extractJsonFromCliOutput(cliOutput);
        if (parsed && parsed.action) {
          return NextResponse.json(parsed);
        }
      } catch (err: any) {
        // Local CLI not present on Vercel lambda - proceed to fast contextual response
      }
    }

    // 4. Fast contextual response (guaranteed 0ms latency on Vercel)
    if (currentContext && currentContext.lastAction) {
      const { action, field, oldValue, newValue, invoiceNumber, amount } = currentContext.lastAction;
      const isCapex = newValue?.includes('0400') || (amount && amount > 5000);
      const isHold = action?.toLowerCase().includes('hold') || newValue?.toLowerCase().includes('held');

      let suggestedQuestion = '';
      let isGuardrailTrigger = false;
      let guardrailNote = '';

      if (isCapex) {
        isGuardrailTrigger = true;
        guardrailNote = '5k capex cutoff rule';
        suggestedQuestion = "Quick question Sabine — why'd you flip this invoice over to 0400?";
      } else if (isHold) {
        isGuardrailTrigger = true;
        guardrailNote = 'Seasonal vendor billing risk';
        suggestedQuestion = "Saw you put Delta Logistik on hold instead of approving it. What's the story with them?";
      } else if (action?.includes('Approve')) {
        suggestedQuestion = 'What did you double-check before approving this invoice?';
      }

      return NextResponse.json({
        hasMeaningfulAction: true,
        action: action || 'Screen interaction',
        targetField: field || 'ERP Field',
        oldValue: oldValue || '',
        newValue: newValue || '',
        description: `Action on ${invoiceNumber || 'invoice'}: ${action}`,
        isGuardrailTrigger,
        guardrailNote,
        suggestedQuestion,
      });
    }

    return NextResponse.json({
      hasMeaningfulAction: false,
      action: 'Monitoring screen',
      targetField: '',
      oldValue: '',
      newValue: '',
      description: 'Screen active; no critical decision point detected.',
      isGuardrailTrigger: false,
      guardrailNote: '',
      suggestedQuestion: '',
    });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    return NextResponse.json({ error: error.message || 'Vision analysis failed' }, { status: 500 });
  }
}
