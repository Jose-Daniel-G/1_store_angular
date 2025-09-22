import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap, catchError, throwError } from 'rxjs'; // Asegúrate de importar todos estos operadores
import { LoginRequest, AuthUser, UsuarioLoginResponse } from '../models/login.model'; // Asumo AuthUser para el tipo de usuario devuelto
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.URL_SERVICIOS; // Ejemplo: http://127.0.0.1:8000/api
  private csrfUrl = `${this.baseUrl.replace('/api', '')}/sanctum/csrf-cookie`;

  private loginUrl = `${this.baseUrl}/login`;
  private logoutUrl = `${this.baseUrl}/logout`;
  private userUrl = `${this.baseUrl}/user`; // Endpoint para obtener los datos del usuario autenticado

  constructor(private http: HttpClient) { }

  /**
   * Realiza el login usando Laravel Sanctum.
   * Flujo completo:
   * 1. Petición GET para obtener la cookie CSRF. 2. Envía las credenciales al endpoint de login (POST /api/login).
   * Laravel devuelve el access_token si las credenciales son válidas.
   * 3. Guarda el access_token y los datos del usuario en localStorage.
   * 4. Realiza una petición GET a /api/user para obtener los datos completos del usuario (protegida por el token).
   * @param credentials Las credenciales de login (email y password).
   * @returns Un Observable que emite los datos del usuario autenticado.
   */
  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.get(this.csrfUrl, { withCredentials: true }).pipe(
      switchMap(() => this.http.post<UsuarioLoginResponse>(this.loginUrl, credentials, { withCredentials: true })),
      tap(response => {
        if (response.access_token && response.user) {
          localStorage.setItem('access_token', response.access_token);
          // Aquí pasamos los roles del backend al guardar el usuario
          this.setCurrentUser(response.user, response.roles || []);
        } else {
          throw new Error('Invalid login response from server: access_token or user data missing.');
        }
      }),
      switchMap(() => this.http.get<AuthUser & { roles?: string[] }>(this.userUrl, { withCredentials: true })),
      tap(user => {
        // Actualizamos usuario con roles si vienen del /user
        const existingRoles = this.getUserRoles();
        this.setCurrentUser(user, existingRoles);
      }),
      catchError(error => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra sesión en el backend de Laravel y limpia el almacenamiento local.
   * @returns Un Observable que emite la respuesta de la petición de logout.
   */
  logout(): Observable<any> {
    console.log('AuthService - Initiating logout.');
    // La petición de logout. El interceptor debe adjuntar el token aquí.
    return this.http.post(this.logoutUrl, {}, { withCredentials: true }).pipe(
      tap(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token'); // ¡Limpiar también el token de acceso!
        console.log('AuthService - Logout successful. Token and user cleared from localStorage.');
      }),
      catchError(error => {
        console.error('AuthService - Error during logout:', error);
        // Limpiar localmente incluso si el backend falla, para asegurar un estado limpio en el frontend
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        return throwError(() => error);
      })
    );
  }

  /**
   * Guarda los datos del usuario autenticado en localStorage.
   * @param user El objeto AuthUser (o UsuarioLoginResponse si contiene los mismos campos principales).
   */
  setCurrentUser(user: AuthUser, roles: string[] = []): void {
    const userWithRoles = { ...user, roles }; // añadimos roles al objeto usuario
    localStorage.setItem('user', JSON.stringify(userWithRoles));
  }

  /**
   * Recupera los datos del usuario actual desde localStorage.
   * @returns El objeto AuthUser si está presente, o null si no hay usuario guardado.
   */
  getCurrentUser(): AuthUser & { roles?: string[] } | null {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      localStorage.removeItem('user');
      return null;
    }
  }

  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }
  /**
   * Recupera el token de acceso (Bearer Token) del localStorage.
   * Este método es crucial para que el interceptor pueda adjuntar el token a las solicitudes.
   * @returns El token de acceso como string, o null si no está presente.
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verifica si el usuario está actualmente autenticado.
   * Considera que un usuario está autenticado si hay datos de usuario Y un token de acceso guardados.
   * @returns True si el usuario está autenticado, false en caso contrario.
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!this.getToken(); // ¡CRÍTICO! Verifica ambos.
  }
  hasPermission(permissionToCheck: string): boolean {
    const user = this.getCurrentUser();
    console.log('[AuthService] Usuario actual:', user);

    // Si el usuario no está logueado o no tiene la propiedad 'permissions' o está vacía,
    // entonces no tiene el permiso.
    if (!user || !user.permissions || user.permissions.length === 0) {
      console.log(`[AuthService] hasPermission('${permissionToCheck}'): Usuario no logueado o no tiene permisos en el objeto de usuario. Resultado: false`);
      return false;
    }

    // Verifica directamente si el 'permissionToCheck' está incluido en el array 'user.permissions'.
    const hasPerm = user.permissions.includes(permissionToCheck);
    console.log(`[AuthService] hasPermission('${permissionToCheck}'): El permiso ${hasPerm ? 'FUE ENCONTRADO' : 'NO FUE ENCONTRADO'}. Resultado: ${hasPerm}`);
    return hasPerm;
  }
  hasRole(roleToCheck: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(roleToCheck);
  }

}
