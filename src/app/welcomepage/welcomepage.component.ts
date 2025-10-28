import { Component } from '@angular/core';
import { Welcome2Component } from "./welcome2/welcome2.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { DialogType } from '../shared/interfaces';
import { AuthService } from '../authservice/auth.service';

@Component({
  selector: 'app-welcomepage',
  imports: [Welcome2Component, WelcomeComponent],
  templateUrl: './welcomepage.component.html',
  styleUrl: './welcomepage.component.css'
})
export class WelcomepageComponent {
  apiUrl: string = environment.apiUrl;

  constructor(private route: ActivatedRoute, private sharedService: SharedService, private authService: AuthService) {}

  ngOnInit() {
    let hasVisited = localStorage.getItem('hasVisited');
    if(!hasVisited){
      this.sharedService.showDialogWithInfoText(DialogType.INFORMATION, "Witaj w Grimlogu po raz pierwszy!", 
        "Grimlog to narzędzie pozwalające grupom graczy archiwizować rozgrywki w Blood on the Clocktower.\n " +
        "W zakładce Ustawienia (ikona koła zębatego) znajują się informacje na temat działania, \n" +
        "możliwości oraz tego jak można zacząć z niego korzystać.");
      localStorage.clear();
      localStorage.setItem('hasVisited', 'true');
    }
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.authService.loginWithDiscord(code);
      }
    });
  }
}
