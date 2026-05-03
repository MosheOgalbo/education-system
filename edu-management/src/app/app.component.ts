/**
 * רכיב שורש: סרגל עליון (ממשק בעברית) ואזור תוכן עם router-outlet.
 */
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar class="app-toolbar gov-topbar" color="primary">
      <div class="gov-topbar__brand">
        <mat-icon class="gov-topbar__logo" aria-hidden="true">account_balance</mat-icon>
        <div class="gov-topbar__titles">
          <span class="gov-topbar__title">מערכת ניהול פנימיות ותלמידים</span>
          <span class="gov-topbar__subtitle">חינוך התיישבותי</span>
        </div>
      </div>
      <span class="toolbar-spacer"></span>
      <nav class="gov-topbar__nav" aria-label="ניווט ראשי">
        <a
          mat-button
          routerLink="/education-places"
          routerLinkActive="gov-topbar__link--active"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <mat-icon aria-hidden="true">domain</mat-icon>
          פנימיות
        </a>
      </nav>
    </mat-toolbar>

    <main class="app-main">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {}
