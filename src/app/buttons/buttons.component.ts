import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.css'
})
export class ButtonsComponent {
  @Output() activeComponent = new EventEmitter<string>();

  constructor(){}

  changeComponent(componentName: string){
    this.activeComponent.emit(componentName);
  }
}
