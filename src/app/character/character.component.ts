import { Component } from '@angular/core';
import { Alignment, Character, DialogType, ResponseId } from '../shared/interfaces';
import { SharedService } from '../shared/service/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { DtoMapperService } from '../shared/service/dtoMapper.service';

@Component({
  selector: 'app-character',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './character.component.html',
  styleUrl: './character.component.css'
})
export class CharacterComponent {
  apiUrl = environment.apiUrl;
  characters: Character[] = [];
  selectedCharacter: Character | null = null;
  tempCharacter: Character | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  alignments = Object.values(Alignment);

  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService) {}

  ngOnInit() {
    this.sharedService.selectedCharacter$.subscribe((character) => {
      this.cancel();
      this.selectedCharacter = character;
    })
    this.sharedService.characters$.subscribe((characters) => {
      this.characters = characters!;
    })
  }

  createNewCharacter() {
    this.selectedCharacter = null;
    this.tempCharacter = {} as Character;
    this.isEditing = false;
    this.isCreating = true;
  }

  toggleEdit() {
    if (!this.isEditing && !this.isCreating){
      this.tempCharacter = JSON.parse(JSON.stringify(this.selectedCharacter));
      this.isEditing = true;
    } else if (this.isEditing) {
      if(this.validate(this.tempCharacter!)){
        let dto = this.mapper.mapCharacterToDto(this.tempCharacter!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/character`, dto, {observe: 'response'}));
      }
    } else if(this.isCreating && this.tempCharacter) {
      if(this.validate(this.tempCharacter!)){
        let dto = this.mapper.mapCharacterToDto(this.tempCharacter!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/character`, dto, {observe: 'response'}));
      }
    } 
  }

  cancel() {
    this.tempCharacter = null;
    this.isCreating = false;
    if(this.isEditing){
      this.isEditing = false;
    } else {
      this.selectedCharacter = null;
    }
  }

  deleteCharacter() {
    const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tę postać?")

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.handleResponse(this.http.delete<any>(`${this.apiUrl}/character/${this.selectedCharacter!.id}`, {observe: 'response'}));
      } 
    });
  }

  private validate(character: Character){
    if(!character.name){
      this.sharedService.showDialog(DialogType.INFORMATION, "Nazwa jest wymagana!");
      return false;
    } else if(!character.alignment) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Przynależność jest wymagana!");
      return false;
    } else if(!character.description) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Opis jest wymagany!");
      return false;
    }
    return true;
  }
  
  private handleResponse(httpResponse: Observable<HttpResponse<ResponseId>>){
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        if(status === HttpStatusCode.Ok){
          this.sharedService.showDialog(DialogType.INFORMATION, "Sukces!")
          this.selectedCharacter!.name = this.tempCharacter!.name;
          this.selectedCharacter!.alignment = this.tempCharacter!.alignment;
          this.selectedCharacter!.description = this.tempCharacter!.description;
          this.selectedCharacter!.linkToWiki = this.tempCharacter!.linkToWiki;
          this.cancel();
        } else if(status === HttpStatusCode.Created){
          this.tempCharacter!.id = response.body!.id;
          this.characters.push(this.tempCharacter!);
          this.sharedService.showDialog(DialogType.INFORMATION, "Sukces!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
      },
      error: (error: HttpErrorResponse) => {
        const status = error.status;
        if(status === HttpStatusCode.PreconditionRequired){ 
          this.sharedService.showDialog(DialogType.INFORMATION, 'Istnieje co najmniej jedna gra lub skrypt, w której ta postac bierze udział!');
        } else if (status === HttpStatusCode.Conflict){
          this.sharedService.showDialog(DialogType.INFORMATION, 'Postać z tą nazwą już istnieje!');
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
        }
      }
    })
  }
}
