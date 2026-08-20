// src/app/pages/workspace/workspace.ts
import { Component, OnInit, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppShell } from '../../shared/app-shell/app-shell';
import { HuggingfaceService } from '../../core/huggingface';
import { HistoryService } from '../../core/history';
import { SettingsService } from '../../core/settings';
import { CodeAnalysis } from '../../core/analysis.types';

type ViewState = 'input' | 'loading' | 'result';

const MAX_CODE_LENGTH = 5000;

@Component({
  selector: 'app-workspace',
  imports: [FormsModule, AppShell],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace implements OnInit {
  viewState = signal<ViewState>('input');
  codeInput = signal(
    'function getTotal(items) {\n' +
      '  let total = 0\n' +
      '  for (i = 0; i < items.length; i++) {\n' +
      '    total += items[i].price\n' +
      '  }\n' +
      '  return total\n' +
      '}',
  );
  langBadge = signal('Not analyzed yet');
  followupInput = '';

  result = signal<CodeAnalysis | null>(null);
  errorMessage = signal<string | null>(null);
  followupAnswer = signal<string | null>(null);
  isAskingFollowup = signal(false);

  readonly maxCodeLength = MAX_CODE_LENGTH;

  private examples: Record<number, string> = {
    1: 'function getTotal(items) {\n  let total = 0\n  for (i = 0; i < items.length; i++) {\n    total += items[i].price\n  }\n  return total\n}',
    2: 'async function loadUser(id) {\n  let user\n  fetchUser(id).then(u => user = u)\n  return user\n}',
    3: 'def find_duplicates(items):\n    dupes = []\n    for i in range(len(items)):\n        for j in range(len(items)):\n            if i != j and items[i] == items[j]:\n                dupes.append(items[i])\n    return dupes',
  };

  constructor(
    private huggingfaceService: HuggingfaceService,
    private historyService: HistoryService,
    protected settingsService: SettingsService,
  ) {
    effect(() => {
      const id = this.historyService.selectedAnalysisId();
      if (id) {
        this.loadHistoryEntry(id);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const id = this.historyService.selectedAnalysisId();
    if (id) {
      await this.loadHistoryEntry(id);
    }
  }

  private async loadHistoryEntry(id: string): Promise<void> {
    const entry = await this.historyService.getById(id);
    if (!entry) return;

    this.codeInput.set(entry.codeSnippet);
    this.result.set(entry.analysis);
    this.langBadge.set(`Auto-detected: ${entry.analysis.language}`);
    this.viewState.set('result');
    this.followupAnswer.set(null);
  }

  async runAnalysis(): Promise<void> {
    const code = this.codeInput().trim();
    if (!code) return;

    if (code.length > MAX_CODE_LENGTH) {
      this.errorMessage.set(
        `That snippet is ${code.length} characters — a bit long for this demo. Try something under ${MAX_CODE_LENGTH} characters.`,
      );
      return;
    }

    this.viewState.set('loading');
    this.errorMessage.set(null);
    this.followupAnswer.set(null);

    try {
      const analysis = await this.huggingfaceService.analyzeCode(
        this.codeInput(),
        this.settingsService.explanationLevel(),
      );
      this.result.set(analysis);
      this.langBadge.set(`Auto-detected: ${analysis.language}`);
      this.viewState.set('result');

      await this.historyService.save(this.codeInput(), analysis);
    } catch (err) {
      this.errorMessage.set((err as Error).message);
      this.viewState.set('input');
    }
  }

  newAnalysis(): void {
    this.historyService.clearSelection();
    this.viewState.set('input');
    this.codeInput.set('');
    this.result.set(null);
    this.followupAnswer.set(null);
    this.errorMessage.set(null);
    this.langBadge.set('Not analyzed yet');
  }

  loadExample(n: number): void {
    this.codeInput.set(this.examples[n]);
  }

  async askFollowup(preset?: string): Promise<void> {
    const question = preset ?? this.followupInput;
    if (!question.trim()) return;

    const analysis = this.result();
    if (!analysis) return;

    this.isAskingFollowup.set(true);
    this.followupAnswer.set(null);

    try {
      const answer = await this.huggingfaceService.askFollowUp(
        this.codeInput(),
        analysis,
        question,
      );
      this.followupAnswer.set(answer);
    } catch (err) {
      this.followupAnswer.set(`Sorry, something went wrong: ${(err as Error).message}`);
    } finally {
      this.isAskingFollowup.set(false);
      this.followupInput = '';
    }
  }
}
