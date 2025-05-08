import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../authservice/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('jwt');
  const authReq = token && req.method !== 'GET'
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    : req;
  
  return next(authReq).pipe(
    tap(event => {
    }),
    catchError((error: HttpErrorResponse) => {
      if(error.status == HttpStatusCode.Unauthorized && error.error.message === 'JWT contains unknown signature.'){
        localStorage.removeItem('jwt');
        authService.showLoginDialog("Token dostępu wygasł lub jest nieprawidłowy. Zaloguj się jeszcze raz.");
        return EMPTY;
      }
      return throwError(() => error);
    })
  );
};
