import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: any): boolean {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredRoles: string[] = route.data?.['roles']; // Ej: ['admin']
    const userRoles: string[] = this.authService.getUserRoles(); // Ej: ['funcionario']

    if (requiredRoles && !userRoles.some(r => requiredRoles.includes(r))) {
      // No tiene los roles necesarios
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true; // Tiene permisos
  }

}
