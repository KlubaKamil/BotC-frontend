import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { BotcJwtPayload, DialogType, JwtRequest, Role } from '../shared/interfaces';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private sharedService: SharedService){}

  isMember(): boolean {
    return this.hasGroupRole([Role.MEMBER, Role.MODERATOR, Role.GROUP_ADMIN, Role.GLOBAL_ADMIN]);
  }

  isMod(): boolean {
    return this.hasGroupRole([Role.MODERATOR, Role.GROUP_ADMIN, Role.GLOBAL_ADMIN]);
  }

  isAdmin(): boolean {
    return this.hasGroupRole([Role.GROUP_ADMIN, Role.GLOBAL_ADMIN]);
  }

  isGlobalAdmin(): boolean {
    return this.hasGroupRole([Role.GLOBAL_ADMIN])
  }

  isMemberTokenValid(): Promise<boolean> {
    return this.isTokenValid([Role.MEMBER, Role.MODERATOR, Role.GROUP_ADMIN, Role.GLOBAL_ADMIN])
  }
  
  isModTokenValid(): Promise<boolean> {
    return this.isTokenValid([Role.MODERATOR, Role.GROUP_ADMIN, Role.GLOBAL_ADMIN])
  }

  isAdminTokenValid(): Promise<boolean> {
    return this.isTokenValid([Role.GROUP_ADMIN, Role.GLOBAL_ADMIN])
  }
  
  isGlobalAdminTokenValid(): Promise<boolean> {
    return this.isTokenValid([Role.GLOBAL_ADMIN])
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

  loginWithDiscord(code: string){
    this.http.post(`${this.apiUrl}/authentication/login/discord/${code}`, null)
      .subscribe({
        next: (response: any) => {
          let decodedToken = jwtDecode<BotcJwtPayload>(response.token);
          localStorage.setItem('jwt', response.token);
          localStorage.setItem('username', decodedToken.sub);
          if(this.isMember()){
            this.sharedService.showDialog(DialogType.INFORMATION, decodedToken.sub + ", logowanie pomyślne!")
          } else {
            this.sharedService.showDialog(DialogType.INFORMATION, 
              decodedToken.sub + ", logowanie pomyślne, lecz nie posiadasz uprawnień do wykonywania akcji w tej grupie. Skontaktuj się z jej administratorem.")
          }
        },
        error: err => this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak podczas logowania.')
      });
  }
  
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
  }

  private hasGroupRole(roles: Role[]): boolean{
    let token = localStorage.getItem('jwt');
    if(!token){
      return false;
    }
    let decodedToken = jwtDecode<BotcJwtPayload>(token);
    const groupRoles = decodedToken.groupRoles;
    if(groupRoles.some(gr => (roles.includes(Role.GLOBAL_ADMIN) && gr.role === Role.GLOBAL_ADMIN) ||
                            (roles.includes(gr.role) && gr.group.id === this.sharedService.getGroup().id))){
      return true;
    }
    return false;
  }

  private login(request: JwtRequest): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.http.post(`${this.apiUrl}/authentication/login`, request).subscribe({
        next: (response: any) => {
          let decodedToken = jwtDecode<BotcJwtPayload>(response.token);
          localStorage.setItem('jwt', response.token);
          localStorage.setItem('username', decodedToken.sub);
          if(this.isMember()){
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

  private isExpired(decodedToken: BotcJwtPayload): boolean{
    try {
      const exp = decodedToken.exp;
      const now = Math.floor(Date.now() / 1000);
      return  now > exp!;
    } catch (e) {
      return true;
    }
  }

  private isTokenValid(roles: Role[]): Promise<boolean> {
    let token = localStorage.getItem('jwt');
    if(!token){
      return this.showLoginDialog("Aby wykonać tę akcję, musisz się zalogować.");
    }
    let decodedToken = jwtDecode<BotcJwtPayload>(token);
    if(this.isExpired(decodedToken)){
      localStorage.removeItem('jwt');
      localStorage.removeItem('username');
      return this.showLoginDialog("Token dostępu wygasł, zaloguj się ponownie:");
    }
    if(!this.hasGroupRole(roles)){
      this.sharedService.showDialog(DialogType.INFORMATION, 
        "Nie masz uprawnień, aby wykonać tę akcję. Skontaktuj się z administratorem grupy");
        return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

}