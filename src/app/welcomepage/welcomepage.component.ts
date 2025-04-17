import { Component } from '@angular/core';
import { Welcome2Component } from "./welcome2/welcome2.component";
import { WelcomeComponent } from "./welcome/welcome.component";

@Component({
  selector: 'app-welcomepage',
  imports: [Welcome2Component, WelcomeComponent],
  templateUrl: './welcomepage.component.html',
  styleUrl: './welcomepage.component.css'
})
export class WelcomepageComponent {

}
