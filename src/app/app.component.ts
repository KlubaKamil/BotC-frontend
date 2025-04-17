import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonsComponent } from './buttons/buttons.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, ButtonsComponent, RouterModule]
})
export class AppComponent {
  title = 'BotC-frontend';
  activeComponent: string = 'welcome';

  changeComponent(activeComponent: string){
    this.activeComponent = activeComponent;
  }
}
