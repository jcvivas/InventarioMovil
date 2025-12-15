import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private toast: ToastController,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url.includes('/api/v1/auth/login')) {
      return next.handle(req).pipe(catchError(e => this.handleError(e)));
    }

    return from(this.auth.getToken()).pipe(
      switchMap((token: string | null) => {
        const clean = (token || '').trim();
        const authReq =
          clean.length > 0
            ? req.clone({ setHeaders: { Authorization: `Bearer ${clean}` } })
            : req;

        return next.handle(authReq).pipe(catchError(e => this.handleError(e)));
      })
    );
  }

  private async showToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, position: 'bottom' });
    await t.present();
  }

  private handleError(err: HttpErrorResponse) {
    if (err.status === 401) {
      this.auth.logout().then(() => this.router.navigateByUrl('/login', { replaceUrl: true }));
      this.showToast('Sesión expirada. Inicia sesión nuevamente.');
      return throwError(() => err);
    }

    if (err.status === 403) {

      this.showToast('No tienes permisos para esta operación (403).');
      return throwError(() => err);
    }

    const msg =
      err.status === 0 ? 'No hay conexión con el servidor.' :
      (err.error?.title || err.error?.message || 'Ocurrió un error inesperado.');

    this.showToast(msg);
    return throwError(() => err);
  }
}
