import { Component } from '@angular/core';
import { Alignment, Character, DialogType } from '../shared/interfaces';
import { SharedService } from '../shared/service/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-character',
  imports: [CommonModule, FormsModule],
  templateUrl: './character.component.html',
  styleUrl: './character.component.css'
})
export class CharacterComponent {
  selectedCharacter: Character | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  alignments = Object.values(Alignment);
  tempCharacter: Character | null = null;
  error: string = '';
  apiUrl = environment.apiUrl;

  constructor(private sharedService: SharedService, private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit() {
    this.sharedService.selectedCharacter$.subscribe((character) => {
      this.selectedCharacter = character;
      this.isCreating = false;
    })
  }

  createNewCharacter() {
    this.isEditing = false;
    this.isCreating = true;
    this.tempCharacter = {} as Character;
  }

  toggleEdit() {
    if (this.isEditing) {
      this.tempCharacter = { ...this.selectedCharacter } as Character;
      this.http.post<HttpResponse<any>>(`${this.apiUrl}/character`, this.tempCharacter)
        .subscribe({
          next: (response) => {
            this.showDialog(DialogType.INFORMATION, "Sukces!")
            if (this.selectedCharacter && this.tempCharacter) {
              this.selectedCharacter.name = this.tempCharacter.name;
              this.selectedCharacter.alignment = this.tempCharacter.alignment;
              this.selectedCharacter.good = [Alignment.TOWNSFOLK, Alignment.OUTSIDER].includes(this.tempCharacter.alignment);
              this.selectedCharacter.description = this.tempCharacter.description;
              this.selectedCharacter.linkToWiki = this.tempCharacter.linkToWiki;
            }
          },
          error: (error: HttpErrorResponse) => {
            this.showDialog(DialogType.INFORMATION, "Coś poszło nie tak!")
          }
        });
    } else if(this.isCreating && this.tempCharacter) {
      this.tempCharacter.good = [Alignment.TOWNSFOLK, Alignment.OUTSIDER].includes(this.tempCharacter.alignment);
      this.http.put<HttpResponse<any>>(`${this.apiUrl}/character`, this.tempCharacter)
        .subscribe({
          next: (response) => {
            this.showDialog(DialogType.INFORMATION, "Sukces, odśwież stronę!")
          },
          error: (error: HttpErrorResponse) => {
            this.showDialog(DialogType.INFORMATION, "Coś poszło nie tak!")
          }
        });
    }
    this.isEditing = !this.isEditing;
    this.isCreating = false;
  }

  cancelEdit() {
    this.tempCharacter = null;
    this.selectedCharacter = null;
    this.isEditing = false;
    this.isCreating = false;
  }

  deleteCharacter() {
      const dialogRef = this.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tę postać?")

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.http.delete<any>(this.apiUrl + '/character/' + this.selectedCharacter?.id)
          .subscribe({
            next: (response) => {
              this.showDialog(DialogType.INFORMATION, 'Sukces!');
            },
            error: (error) => {
              this.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
            }
          })
        } 
      });
  }

  private showDialog(type: DialogType, message: string){
    return this.dialog.open(DialogComponent, {
      data: {
        type: type,
        message: message
      }
    })
  }
}
