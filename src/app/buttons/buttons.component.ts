import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ButtonModule } from 'primeng/button'
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../authservice/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SettingsComponent } from '../settings/settings.component';
import { SharedService } from '../shared/service/shared.service';
import { DialogType, Group } from '../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, ButtonModule, MatIconModule, RouterModule],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.css'
})
export class ButtonsComponent {
   group: Group = { id: 0, name: 'brak' };
   
    apiUrl = environment.apiUrl;

  constructor(private router: Router, private auth: AuthService, private dialog: MatDialog, private sharedService: SharedService, private httpClient: HttpClient){
    this.group = localStorage.getItem('group') ? JSON.parse(localStorage.getItem('group')!) : { id: 0, name: 'brak' };
  }

  ngOnInit(){
    this.sharedService.group$.subscribe((group) => {
      this.group = group;
    })
  }

  showSettings(){
    let params: MatDialogConfig = {};
    if (window.innerWidth >= 992){
      params.minWidth = '550px';
    }

    this.dialog.open(SettingsComponent, params);
  }

  toggleDarkMode(){
    const element = document.querySelector('html');
    if(element !== null){
      element.classList.toggle('my-app-dark');
    }
  }
}
