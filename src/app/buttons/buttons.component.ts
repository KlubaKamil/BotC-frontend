import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';
import { ButtonModule } from 'primeng/button'
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../authservice/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, ButtonModule, MatIconModule, RouterModule],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.css'
})
export class ButtonsComponent {
  constructor(private router: Router, private auth: AuthService, private dialog: MatDialog){}

  showSettings(){
    this.dialog.open(SettingsComponent);
  }

  toggleDarkMode(){
    const element = document.querySelector('html');
    if(element !== null){
      element.classList.toggle('my-app-dark');
    }
  }
}
