import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { Alignment, Character, DialogType, Game, ResponseId, Script } from '../shared/interfaces';
import { SharedService } from '../shared/service/shared.service';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { DtoMapperService } from '../shared/service/dtoMapper.service';


@Component({
  selector: 'app-script',
  imports: [CommonModule, FormsModule, DragDropModule, MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './script.component.html',
  styleUrl: './script.component.css',
})
export class ScriptComponent {
  apiUrl = environment.apiUrl;
  scripts: Script[] = [];
  games: Game[] = [];
  selectedScript: Script | null = null;
  tempScript: Script | null = null;
  allCharacters: Character[] = [];
  availableCharacters: Character[] = [];
  selectedCharacter: Character | null = null;
  scriptStats: {name: string, characterTimesPlayed: number, characterPlayedRatio: number, 
                characterTimesWon: number, characterWonRatio: number}[] = [];
  isEditing: boolean = false;
  isCreating: boolean = false;
  
  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService) {}

  ngOnInit() {
    this.sharedService.games$.subscribe((games) => {
      this.games = games!;
    })
    this.sharedService.scripts$.subscribe((scripts) => {
      this.scripts = scripts!;
    })
    this.sharedService.characters$.subscribe((characters) => {
      this.allCharacters = characters!;
      this.availableCharacters = this.allCharacters?.filter(c => 
        [Alignment.TOWNSFOLK, Alignment.OUTSIDER, Alignment.MINION, Alignment.DEMON].includes(c.alignment!));
    })
    this.sharedService.selectedScript$.subscribe((script) => {
      this.cancel();
      this.selectedScript = script;
      this.getScriptStats();
    })
  }

  createNewScript() {
    this.selectedScript = null;
    this.tempScript = {} as Script;
    this.tempScript.characters = [];
    this.isEditing = false;
    this.isCreating = true;
  }

  toggleEdit() {
    if(!this.isEditing && !this.isCreating) {
      this.tempScript = { ...this.selectedScript } as Script;
      this.isEditing = true;
    } else if (this.isEditing) {
      if(this.validate(this.tempScript!)){
        let dto = this.mapper.mapScriptToDto(this.tempScript!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/script`, dto, {observe: 'response'}));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempScript!)){
        let dto = this.mapper.mapScriptToDto(this.tempScript!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/script`, dto, {observe: 'response'}));
      }
    }
  }

  cancel() {
    this.tempScript = null;
    if(this.isEditing){
      this.isEditing = false;
    } else {
      this.selectedScript = null;
    }
    this.isCreating = false;
  }

  deleteScript() {
    const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, 'Na pewno chcesz usunąć ten skrypt?')

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.handleResponse(this.http.delete<any>(`${this.apiUrl}/script/${this.selectedScript!.id}`, {observe: 'response'}));
      }
    })
  }

  addCharacter(character: Character){
    var characters: Character[] = this.tempScript!.characters!;
    if(!characters.includes(character)){
      this.tempScript?.characters?.push(character);
    }
  }

  removeCharacter(character: Character){
    this.tempScript!.characters = this.tempScript!.characters?.filter(char => character.id !== char.id)
  }
  
  private getScriptStats(){
    this.scriptStats = [];
    let scriptTimesPlayed = this.selectedScript?.timesPlayed || 0;
    this.selectedScript?.characters?.forEach(c => {
      let charPlayed = this.games?.filter(g => 
        g.script?.id === this.selectedScript!.id && 
        g.assignments?.find(a => a.character?.id === c.id));
      let charWon = this.games?.filter(g => 
        g.script?.id === this.selectedScript!.id && 
        g.assignments?.find(a => a.character?.id === c.id && 
        g.goodWon === a.good));

      let characterTimesPlayed = charPlayed.length;
      let characterPlayedRatio = scriptTimesPlayed === 0 ? 0 : 100 * characterTimesPlayed / scriptTimesPlayed;
      let characterTimesWon = charWon.length;
      let characterWonRatio = characterTimesPlayed === 0 ? 0 : 100 * characterTimesWon / characterTimesPlayed;

      this.scriptStats.push({
        name: c.name!, 
        characterTimesPlayed: characterTimesPlayed, 
        characterPlayedRatio: characterPlayedRatio, 
        characterTimesWon: characterTimesWon, 
        characterWonRatio: characterWonRatio
      });
    })
  }

  private validate(script: Script){
    if(!script.name){
      this.sharedService.showDialog(DialogType.INFORMATION, "Nazwa jest wymagana!");
      return false;
    } else if(script.characters?.length && script.characters?.length < 5) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Skrypt musi zawierać co najmniej 5 postaci!");
      return false;
    }
    return true;
  }

  private handleResponse(httpResponse: Observable<HttpResponse<ResponseId>>){
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        if(status === HttpStatusCode.Ok){
          this.sharedService.showDialog(DialogType.INFORMATION, 'Edycja zakończona pomyślnie!');
          this.selectedScript!.name = this.tempScript!.name;
          this.selectedScript!.characters = this.tempScript!.characters;
          this.getScriptStats();
          this.cancel();
        } else if(status === HttpStatusCode.Created){
          this.tempScript!.id = response.body!.id;
          this.tempScript!.timesPlayed = 0;
          this.scripts.push(this.tempScript!);
          this.sharedService.showDialog(DialogType.INFORMATION, 'Dodano nowy skrypt!');
          this.cancel();
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchAllScripts();
      },
      error: (error: HttpErrorResponse) => {
        const status = error.status;
        if(status === HttpStatusCode.PreconditionRequired){ 
          this.sharedService.showDialog(DialogType.INFORMATION, 'Istnieje co najmniej jedna gra, w której ten skrypt jest wykorzystywany!');
        } else if(status === HttpStatusCode.Conflict){
          this.sharedService.showDialog(DialogType.INFORMATION, 'Skrypt z podaną nazwą już istnieje.');
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
        }
      }
    })
  }
}
