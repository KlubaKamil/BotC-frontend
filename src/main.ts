import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, HttpXhrBackend, HttpBackend  } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './assets/mytheme';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/authinterceptor/auth.interceptor';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    { provide: HttpBackend, useClass: HttpXhrBackend },
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(MatDialogModule),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    })
  ]
}).catch(err => console.error(err));