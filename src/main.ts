import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), 
    provideAnimationsAsync(), 
    provideAnimationsAsync(),
    importProvidersFrom(MatDialogModule), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync()]
}).catch(err => console.error(err));
