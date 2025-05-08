import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';
import { DialogType } from '../shared/interfaces';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  token = localStorage.getItem('jwt');

  constructor(private dialogRef: MatDialogRef<SettingsComponent>, private sharedService: SharedService, private router: Router){
  }

  logout(){
    localStorage.removeItem('jwt');
    this.token = null;
    this.sharedService.showDialog(DialogType.INFORMATION, "Wylogowano.");
    this.dialogRef.close();
    this.router.navigate(['/welcome']);
  }
}
