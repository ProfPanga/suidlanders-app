import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
    // No AuthGuard - accessible to all users (guests + staff)
  },
  {
    path: 'member-form',
    loadComponent: () =>
      import('./components/sections/member-form/member-form.component').then(
        (m) => m.MemberFormComponent
      ),
    // No AuthGuard - members can register without login
  },
  {
    path: 'db-test',
    loadComponent: () =>
      import('./components/db-test/db-test.component').then(
        (m) => m.DbTestComponent
      ),
  },
  {
    path: 'data-viewer',
    loadComponent: () =>
      import('./components/data-viewer/data-viewer.component').then(
        (m) => m.DataViewerComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'qr-test',
    loadComponent: () =>
      import('./pages/qr-test/qr-test.page').then((m) => m.QRTestPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'reception',
    loadComponent: () => import('./pages/reception/reception.page').then( m => m.ReceptionPage)
  },
];
