import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, provideAppInitializer, inject, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ConfigService } from './config/config.service';
import { authInterceptor } from './authinterceptor/auth.interceptor';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from '../assets/mytheme';
import { MatDialogModule } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    // provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor
      ])
    ),
    provideAppInitializer(() => {
      const config = inject(ConfigService);
      return config.load();
    }),
    provideRouter(routes), 
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    }),
    importProvidersFrom(MatDialogModule),
    provideAnimationsAsync(),
  ]
};