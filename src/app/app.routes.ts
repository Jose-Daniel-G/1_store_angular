import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./modules/auth-profile/auth-profile.component').then(c => c.AuthProfileComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth-profile/login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/auth-profile/register/register.component').then(c => c.RegisterComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),

  },
  {
    path: 'procesar',
    loadChildren: () => import('./modules/procesar/procesar.module').then(m => m.ProcesarModule),
  },
  {
    path: 'permissions',
    loadChildren: () => import('./modules/permissions/permission.module').then(m => m.PermissionModule),
    // Todos pueden acceder
  },
  {
    path: 'roles',
    loadChildren: () => import('./modules/roles/roles.module').then(m => m.RolesModule),
    // Todos pueden acceder
  },
  {
    path: '**',
    redirectTo: 'error/404',
  }
];

