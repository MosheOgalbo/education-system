import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'education-places',
    pathMatch: 'full',
  },
  {
    path: 'education-places',
    loadChildren: () =>
      import('./features/education-places/education-places.routes').then(
        (m) => m.EDUCATION_PLACES_ROUTES,
      ),
  },
  {
    path: 'education-places/:id/students',
    loadChildren: () =>
      import('./features/students/students.routes').then((m) => m.STUDENTS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'education-places',
  },
];
