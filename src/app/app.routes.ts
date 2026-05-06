import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { environment } from '../environments/environment';

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
      import('./pages/member-form/member-form-overview.page').then(
        (m) => m.MemberFormOverviewPage
      ),
  },
  {
    path: 'member-form/required-fields',
    loadComponent: () =>
      import('./pages/member-form/required-fields.page').then(
        (m) => m.RequiredFieldsPage
      ),
  },
  {
    path: 'member-form/medicalStaff',
    loadComponent: () =>
      import('./pages/member-form/staff-placeholder.page').then(
        (m) => m.StaffPlaceholderPage
      ),
    data: { staffKey: 'medicalStaff' },
  },
  {
    path: 'member-form/securityStaff',
    loadComponent: () =>
      import('./pages/member-form/staff-placeholder.page').then(
        (m) => m.StaffPlaceholderPage
      ),
    data: { staffKey: 'securityStaff' },
  },
  {
    path: 'member-form/:section',
    loadComponent: () =>
      import('./pages/member-form/member-form-section.page').then(
        (m) => m.MemberFormSectionPage
      ),
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
    path: 'qr-debug',
    loadComponent: () =>
      import('./pages/qr-debug/qr-debug.page').then((m) => m.QrDebugPage),
  },
  {
    path: '',
    redirectTo: environment.demoMode ? 'settings' : 'home',
    pathMatch: 'full',
  },
  {
    path: 'reception',
    loadComponent: () => import('./pages/reception/reception.page').then( m => m.ReceptionPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
  },
];
