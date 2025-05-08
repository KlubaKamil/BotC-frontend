import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { DialogType } from '../shared/interfaces';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private sharedService: SharedService){}

  isLoggedIn(): Promise<boolean> {
    let token = this.getToken();
    if(!token){
      return this.showLoginDialog("Aby wykonać tę akcję, musisz się zalogować. Podać hasło:");
    }
    let expired = this.isExpired(token);
    if(expired){
      localStorage.removeItem('jwt');
      return this.showLoginDialog("Token dostępu wygasł, zaloguj się ponownie:");
    }
    return Promise.resolve(true);
  }

  showLoginDialog(message: string): Promise<boolean>{
    const dialogRef = this.sharedService.showDialog(DialogType.PASSWORD, message);

    return new Promise<boolean>((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          resolve(this.login(result));
        }
        resolve(false);
      })
    })
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

  private isExpired(token: string){
    try {
      let decoded = jwtDecode<JwtPayload>(token);
      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);
      return  now > exp!;
    } catch (e) {
      return true;
    }
  }
}