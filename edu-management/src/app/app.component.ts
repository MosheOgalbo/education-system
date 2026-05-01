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
    <mat-toolbar class="app-toolbar" color="primary">
      <mat-icon class="toolbar-logo">school</mat-icon>
      <span class="toolbar-title">EduManagement</span>
      <span class="toolbar-spacer"></span>
      <a mat-button routerLink="/education-places" routerLinkActive="active-link">
        <mat-icon>business</mat-icon> Institutions
      </a>
    </mat-toolbar>

    <main class="app-main">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {}
