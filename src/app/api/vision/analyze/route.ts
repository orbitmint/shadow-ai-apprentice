import { NextRequest, NextResponse } from 'next/server';
import { callClaudeText, callClaudeVision } from '@/utils/claude';
import { callGeminiCli, extractJsonFromCliOutput } from '@/utils/geminiCli';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, currentContext, recentEvents, customClaudeKey } = await req.json();

    const claudeKey = customClaudeKey || process.env.ANTHROPIC_API_KEY;

    // 1. Try Claude if key is provided
    if (claudeKey && (imageBase64 || currentContext)) {
      try {
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

    // 2. Try Gemini CLI if context is present
    if (currentContext || recentEvents) {
      try {
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

        const cliOutput = await callGeminiCli(prompt, 8000);
        const parsed = extractJsonFromCliOutput(cliOutput);
        if (parsed && parsed.action) {
          return NextResponse.json(parsed);
        }
      } catch (err: any) {
        // Fall through to immediate contextual response
      }
    }

    // 3. Fast contextual response (ideal for real-time 1.2s pause timing)
    if (currentContext && currentContext.lastAction) {
      const { action, field, oldValue, newValue, invoiceNumber, amount } = currentContext.lastAction;
      const isCapex = newValue?.includes('0400') || (amount && amount > 5000);
      const isHold = action?.toLowerCase().includes('hold') || newValue?.toLowerCase().includes('held');

      let suggestedQuestion = '';
      let isGuardrailTrigger = false;
      let guardrailNote = '';

      if (isCapex) {
        isGuardrailTrigger = true;
        guardrailNote = 'Capex capitalization threshold (€5,000 rule)';
        suggestedQuestion = 'I noticed you just switched this invoice to 0400 CAPEX. What made you do that?';
      } else if (isHold) {
        isGuardrailTrigger = true;
        guardrailNote = 'Seasonal vendor billing risk';
        suggestedQuestion = 'You just placed that invoice on hold instead of approving it. What is the reason behind that?';
      } else if (action?.includes('Approve')) {
        suggestedQuestion = 'What checks did you verify before hitting approve on this one?';
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
