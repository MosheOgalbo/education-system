import { Routes } from '@angular/router';

/**
 * טבלת נתיבים ראשית: פנימיות (lazy), תלמידים לפי מזהה פנימייה, והפניות ברירת מחדל.
 *
 * טעינה עצלה (loadChildren): קוד הפיצ'ר נטען רק בכניסה למסך — חבילת first load קטנה יותר מול הכל במודול אחד ענק.
 */
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
