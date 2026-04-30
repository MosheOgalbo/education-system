import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'education-places' },
  {
    path: 'education-places',
    loadChildren: () =>
      import('./features/education-places/education-places.routes').then(
        (m) => m.EDUCATION_PLACES_ROUTES
      ),
  },
  {
    path: 'students',
    loadChildren: () =>
      import('./features/students/students.routes').then((m) => m.STUDENTS_ROUTES),
  },
  { path: '**', redirectTo: 'education-places' },
];
