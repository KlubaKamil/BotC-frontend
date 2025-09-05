import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogType } from '../shared/interfaces';
import { MatButtonModule } from '@angular/material/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { SelectModule } from 'primeng/select';
import { SelectBackCloseDirective } from '../select-back-close-directive/select-back-close.directive';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatButtonModule, InputTextModule, FormsModule, TableModule, CheckboxModule, 
    MatIconModule, SelectModule, SelectBackCloseDirective],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  types = DialogType;
  text: string = '';
  selectedOption: any;
  timestamp: number = Date.now();
  apiUrl = environment.apiUrl;

  constructor(private dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  close() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }

  confirmInsert() {
    this.dialogRef.close(this.text);
  }

  confirmSelection(){
    this.dialogRef.close(this.selectedOption.name);
  }
}
