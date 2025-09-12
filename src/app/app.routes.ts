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
      path: '**',
      redirectTo: 'error/404',
    }
  ];
  
  