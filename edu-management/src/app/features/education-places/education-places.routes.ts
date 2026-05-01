import { Routes } from '@angular/router';

export const EDUCATION_PLACES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/education-places-page/education-places-page.component').then(
        (m) => m.EducationPlacesPageComponent,
      ),
    title: 'Education Institutions',
  },
];
