import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { DialogType } from '../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private sharedService: SharedService){}

  isLoggedIn(): Promise<boolean> {
    if(!this.getToken()){
      const dialogRef = this.sharedService.showDialog(DialogType.INSERTION, "Aby wykonać tę akcję, musisz podać hasło:");

      return new Promise<boolean>((resolve) => {
        dialogRef.afterClosed().subscribe((result) => {
          if(result) {
            resolve(this.login(result));
          }
          resolve(false);
        })
      })
    }
    
    return Promise.resolve(true);
  }

  private login(password: any): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.http.post<{ token: string }>(`${this.apiUrl}/user/login`, {password: password}).subscribe({
        next: (response) => {
          localStorage.setItem('jwt', response.token);
          this.sharedService.showDialog(DialogType.INFORMATION, "Logowanie pomyślne!")
          resolve(true);
        },
        error: (error) => {
          if (error.status === HttpStatusCode.Forbidden) {
            this.sharedService.showDialog(DialogType.INFORMATION, "Błędne hasło!")
          } else {
            this.sharedService.showDialog(DialogType.INFORMATION, "Coś poszło nie tak!")
          }
          resolve(false);
        }
      });
    })
  }

  private getToken(): string | null {
    return localStorage.getItem('jwt');
  }
 
  private logout() {
    localStorage.removeItem('jwt');
  }
}