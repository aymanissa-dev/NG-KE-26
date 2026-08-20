import { Injectable } from '@angular/core';
import { InferenceClient } from '@huggingface/inference';
import { HUGGINGFACE_TOKEN } from '../../environments/huggingface.secret';
import { CodeAnalysis } from './analysis.types';
import { ExplanationLevel } from './settings';

const ANALYSIS_MODEL = 'meta-llama/Llama-3.1-8B-Instruct';

function levelInstruction(level: ExplanationLevel): string {
  switch (level) {
    case 'beginner':
      return 'Write the "explanation" and "suggestions" fields for someone new to programming — avoid jargon, spell out concepts.';
    case 'advanced':
      return 'Write the "explanation" and "suggestions" fields for an experienced engineer — be technical and concise, assume familiarity with the language.';
    default:
      return 'Write the "explanation" and "suggestions" fields for a working developer with intermediate experience.';
  }
}

function buildSystemPrompt(level: ExplanationLevel): string {
  return `You are a code analysis assistant. Given a code snippet, respond with ONLY a raw JSON object (no markdown fences, no commentary) matching exactly this shape:

{
  "language": "the programming language",
  "summary": "one sentence describing what the code does",
  "explanation": "2-3 sentence plain-language explanation",
  "steps": ["step 1", "step 2", "..."],
  "issues": [{"severity": "high|medium|low", "title": "short title", "description": "1-2 sentence description"}],
  "suggestions": "1-2 sentence suggestion for improvement",
  "refactorBefore": "the original code, verbatim",
  "refactorAfter": "an improved version of the code",
  "score": {"maintainability": 0-100, "overallGrade": "A|B+|B|B-|C+|C|C-|D|F", "complexity": "Low|Medium|High", "readability": "Poor|Fair|Good|Excellent"},
  "followUps": ["short follow-up question 1", "short follow-up question 2", "short follow-up question 3"]
}

LANGUAGE DETECTION — determine "language" by actually examining the syntax present, not by assuming. Use these signals:
- HTML: presence of tags like <!DOCTYPE>, <html>, <head>, <div>, <script>, <style> as structural markup
- CSS: selectors with { } blocks, properties like "color:", "margin:", no function keywords
- JavaScript/TypeScript: "function", "const", "let", "=>", "class", optionally ": type" annotations for TypeScript
- Python: "def", "import", indentation-based blocks, no semicolons or braces for blocks
- If the input is a full HTML document with embedded <script> or <style> blocks, the language is "HTML" (not JavaScript), since HTML is the outer/primary structure.

${levelInstruction(level)}

If there are no issues, return an empty array for "issues". Respond with ONLY the JSON object, nothing else.`;
}

@Injectable({
  providedIn: 'root',
})
export class HuggingfaceService {
  private client = new InferenceClient(HUGGINGFACE_TOKEN);

  async analyzeCode(code: string, level: ExplanationLevel = 'intermediate'): Promise<CodeAnalysis> {
    const response = await this.client.chatCompletion({
      model: ANALYSIS_MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt(level) },
        { role: 'user', content: code },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const raw = response.choices[0].message.content ?? '';
    return this.parseAnalysis(raw);
  }

  async askFollowUp(code: string, analysis: CodeAnalysis, question: string): Promise<string> {
    const response = await this.client.chatCompletion({
      model: ANALYSIS_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a code analysis assistant. The user already analyzed this code:\n\n${code}\n\nYour prior summary: ${analysis.summary}\n\nAnswer their follow-up question concisely, in plain text (no JSON, no markdown).`,
        },
        { role: 'user', content: question },
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    return response.choices[0].message.content ?? '(no response)';
  }

  private parseAnalysis(raw: string): CodeAnalysis {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return parsed as CodeAnalysis;
    } catch (err) {
      throw new Error(
        `Failed to parse model response as JSON: ${(err as Error).message}\n\nRaw response: ${cleaned.slice(0, 200)}`,
      );
    }
  }
}
