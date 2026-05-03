/**
 * נתיבי תלמידים תחת `education-places/:id/students` — דף רשימה ישיר (ללא lazy של קומפוננטה נפרדת).
 */
import { Routes } from '@angular/router';

import { StudentsPageComponent } from './components/students-page/students-page.component';

export const STUDENTS_ROUTES: Routes = [{ path: '', component: StudentsPageComponent }];
