import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';
import { ButtonModule } from 'primeng/button'

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, ButtonModule],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.css'
})
export class ButtonsComponent {
  @Output() activeComponent = new EventEmitter<string>();
  firstClick: boolean = true;

  constructor(private sharedService: SharedService){}

  changeComponent(componentName: string){
    if(this.firstClick){
      this.sharedService.fetchAll();
      this.firstClick = false;
    } else if(componentName === 'games'){
      this.sharedService.fetchAllGames();
    } else if(componentName === 'scripts'){
      this.sharedService.fetchAllScripts();
    } else if(componentName === 'characters'){
      this.sharedService.fetchAllCharacters();
    } else if(componentName === 'players'){
      this.sharedService.fetchAllPlayers();
    }
    this.activeComponent.emit(componentName);
  }

  toggleDarkMode(){
    const element = document.querySelector('html');
    if(element !== null){
      element.classList.toggle('my-app-dark');
    }
  }
}
