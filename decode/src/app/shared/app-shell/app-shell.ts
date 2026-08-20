import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';
import { ThemeService } from '../../core/theme';
import { HistoryService } from '../../core/history';

@Component({
  selector: 'app-shell',
  imports: [RouterLink],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell implements OnInit {
  @Input() active: 'workspace' | 'settings' | 'profile' | null = null;
  @Output() newAnalysisRequested = new EventEmitter<void>();
  sidebarOpen = false;

  constructor(
    protected authService: AuthService,
    protected themeService: ThemeService,
    protected historyService: HistoryService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.authReady;
    await this.historyService.loadRecent();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onNewAnalysisClick(): void {
    this.historyService.clearSelection();
    if (this.active === 'workspace') {
      this.newAnalysisRequested.emit();
    } else {
      this.router.navigate(['/workspace']);
    }
  }

  onRecentClick(id: string): void {
    this.historyService.selectAnalysis(id);
    if (this.active !== 'workspace') {
      this.router.navigate(['/workspace']);
    }
  }

  async onDeleteRecentClick(event: Event, id: string): Promise<void> {
    event.stopPropagation();
    await this.historyService.deleteEntry(id);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
