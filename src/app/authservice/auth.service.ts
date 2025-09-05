import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { BotcJwtPayload, DialogType, Role } from '../shared/interfaces';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private sharedService: SharedService){}

  isModTokenValid(): Promise<boolean> {
    let token = localStorage.getItem('jwt');
    if(!token){
      return this.showLoginDialog("Aby wykonać tę akcję, musisz się zalogować. Podaj hasło:");
    }
    let decodedToken = jwtDecode<BotcJwtPayload>(token);
    if(this.isExpired(decodedToken)){
      localStorage.removeItem('jwt');
      return this.showLoginDialog("Token dostępu wygasł, zaloguj się ponownie:");
    }
    if(!this.hasGroupRole([Role.MODERATOR, Role.ADMIN])){
      this.sharedService.showDialog(DialogType.INFORMATION, 
        "Nie masz uprawnień, aby wykonać tę akcję. Skontaktuj się z administratorem grupy");
        return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  isMemberTokenValid(): Promise<boolean> {
    let token = localStorage.getItem('jwt');
    if(!token){
      return this.showLoginDialog("Aby wykonać tę akcję, musisz się zalogować. Podaj hasło:");
    }
    let decodedToken = jwtDecode<BotcJwtPayload>(token);
    if(this.isExpired(decodedToken)){
      localStorage.removeItem('jwt');
      return this.showLoginDialog("Token dostępu wygasł, zaloguj się ponownie:");
    }
    if(!this.hasGroupRole([Role.MEMBER, Role.MODERATOR, Role.ADMIN])){
      this.sharedService.showDialog(DialogType.INFORMATION, 
        "Nie masz uprawnień, aby wykonać tę akcję. Skontaktuj się z administratorem grupy");
        return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  isMember(): boolean {
    return this.hasGroupRole([Role.MEMBER, Role.MODERATOR, Role.ADMIN]);
  }

  isMod(): boolean {
    return this.hasGroupRole([Role.MODERATOR, Role.ADMIN]);
  }

  isAdmin(): boolean {
    return this.hasGroupRole([Role.ADMIN]);
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

  hasGroupRole(roles: Role[]): boolean{
    let token = localStorage.getItem('jwt');
    if(!token){
      return false;
    }
    let decodedToken = jwtDecode<BotcJwtPayload>(token);
    const groupRoles = decodedToken.groupRoles;
    if(groupRoles.some(gr => roles.includes(gr.role) && gr.group.id === this.sharedService.getGroup().id)){
      return true;
    }
    return false;
  }

  loginWithDiscord(code: string){
    this.http.post(`${this.apiUrl}/authentication/login/discord/${code}`, null)
      .subscribe({
        next: (response: any) => {
          let decodedToken = jwtDecode<BotcJwtPayload>(response.token);
          localStorage.setItem('jwt', response.token);
          localStorage.setItem('username', decodedToken.sub);
          if(this.hasGroupRole([Role.MODERATOR, Role.ADMIN])){
            this.sharedService.showDialog(DialogType.INFORMATION, decodedToken.sub + ", logowanie pomyślne!")
          } else {
            this.sharedService.showDialog(DialogType.INFORMATION, 
              decodedToken.sub + ", logowanie pomyślne, lecz nie posiadasz uprawnień do wykonywania akcji w tej grupie. Skontaktuj się z jej administratorem.")
          }
        },
        error: err => this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak podczas logowania.')
      });
  }

  private login(password: any): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.http.post(`${this.apiUrl}/authentication/login`, {password: password}).subscribe({
        next: (response: any) => {
          let decodedToken = jwtDecode<BotcJwtPayload>(response.token);
          localStorage.setItem('jwt', response.token);
          localStorage.setItem('username', decodedToken.sub);
          if(this.hasGroupRole([Role.MODERATOR, Role.ADMIN])){
            this.sharedService.showDialog(DialogType.INFORMATION, decodedToken.sub + ", logowanie pomyślne!")
            resolve(true);
          } else {
            this.sharedService.showDialog(DialogType.INFORMATION, 
              decodedToken.sub + ", logowanie pomyślne, lecz nie posiadasz uprawnień do wykonywania akcji w tej grupie. Skontaktuj się z jej administratorem.")
            resolve(false)
          }
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
 
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
  }

  private isExpired(decodedToken: BotcJwtPayload): boolean{
    try {
      const exp = decodedToken.exp;
      const now = Math.floor(Date.now() / 1000);
      return  now > exp!;
    } catch (e) {
      return true;
    }
  }
}