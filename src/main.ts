import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { MyPreset } from './assets/mytheme';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), 
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
