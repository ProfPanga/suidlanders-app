import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'member-form',
    loadComponent: () => import('./components/sections/member-form/member-form.component').then(m => m.MemberFormComponent)
  },
  {
    path: 'db-test',
    loadComponent: () => import('./components/db-test/db-test.component').then(m => m.DbTestComponent)
  },
  {
    path: 'data-viewer',
    loadComponent: () => import('./components/data-viewer/data-viewer.component').then(m => m.DataViewerComponent)
  },
  {
    path: 'qr-test',
    loadComponent: () => import('./pages/qr-test/qr-test.page').then(m => m.QRTestPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
]; 