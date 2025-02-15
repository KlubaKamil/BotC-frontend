import { Component } from '@angular/core';
import { Script } from '../shared/interfaces'
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-scripts',
  imports: [CommonModule],
  templateUrl: './scripts.component.html',
  styleUrl: './scripts.component.css'
})
export class ScriptsComponent {
  scripts: Script[] | null = null;
  error: string = '';
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.fetchAllScripts();
  }
  
  fetchAllScripts(){
    this.http.get<Script[]>(this.apiUrl + '/script/all').subscribe({
      next: (data) => {
        this.scripts = data;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to fetch scripts data.';
        this.scripts = null;
      }
    });
  }
}
