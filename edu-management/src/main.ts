/**
 * נקודת כניסה לאפליקציית Angular — טוען Zone ומפעיל את רכיב השורש עם ההגדרות הגלובליות.
 */
import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
