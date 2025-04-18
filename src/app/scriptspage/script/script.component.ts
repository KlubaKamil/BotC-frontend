import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Alignment, Character, CharacterHeader, DialogType, ResponseId, Script, ScriptCharacterDetails, ScriptHeader } from '../../shared/interfaces';
import { SharedService } from '../../shared/service/shared.service';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';
import { map, Observable, startWith } from 'rxjs';
import { DtoMapperService } from '../../shared/service/dtoMapper.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectModule } from 'primeng/select';
import { PickListModule } from 'primeng/picklist';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { TableModule } from 'primeng/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { AuthService } from '../../authservice/auth.service';


@Component({
  selector: 'app-script',
  imports: [CommonModule, FormsModule, DragDropModule, MatMenuModule, MatButtonModule, MatIconModule, 
    MatFormFieldModule, TextFieldModule, SelectModule, PickListModule, CdkDropList, CdkDrag, TableModule,
  RouterModule],
  templateUrl: './script.component.html',
  styleUrl: './script.component.css',
})
export class ScriptComponent {
  apiUrl = environment.apiUrl;
  selectedScriptHeader: ScriptHeader | null = null;
  selectedScript: Script | null = null;
  tempScript: Script | null = null;
  allCharacters: CharacterHeader[] = [];
  availableCharacters: CharacterHeader[] = [];
  isEditing: boolean = false;
  isCreating: boolean = false;
  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<Character[]>;
  
  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService,
    private route: ActivatedRoute, private clipboard: Clipboard, private authService: AuthService, private location: Location) {
    this.filteredOptions = new Observable;
  }

  ngOnInit() {
    this.sharedService.characterHeaders$.subscribe((characterHeaders) => {
      this.allCharacters = characterHeaders!;
      this.availableCharacters = this.allCharacters?.filter(c => 
        [Alignment.TOWNSFOLK, Alignment.OUTSIDER, Alignment.MINION, Alignment.DEMON].includes(c.alignment!));
    })
    this.sharedService.selectedScript$.subscribe((selectedScript) => {
      this.cancel();
      this.selectedScript = selectedScript;
    })
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this.availableCharacters.filter(option => option.name!.toLowerCase().includes(value || ''))
    ))
    this.route.paramMap.subscribe(params => {
      let scriptId = params.get('id');
      if(scriptId){
        this.sharedService.fetchScriptAndSelect(scriptId!)
      }
    });
  }

  async createNewScript() {
    if(await this.authService.isLoggedIn()){
      this.selectedScript = null;
      this.tempScript = {} as Script;
      this.tempScript.characters = [];
      this.isEditing = false;
      this.isCreating = true;
      this.location.go('/scripts');
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      if(this.validate(this.tempScript!)){
        let dto = this.mapper.mapScriptToDto(this.tempScript!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/script`, dto, {observe: 'response'}));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempScript!)){
        let dto = this.mapper.mapScriptToDto(this.tempScript!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/script`, dto, {observe: 'response'}));
      }
    } else {
      if(await this.authService.isLoggedIn()){
        this.tempScript = { ...this.selectedScript } as Script;
        this.isEditing = true;
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

  async deleteScript() {
    if(await this.authService.isLoggedIn()){
      const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, 'Na pewno chcesz usunąć ten skrypt?')

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.handleResponse(this.http.delete<any>(`${this.apiUrl}/script/${this.selectedScript!.id}`, {observe: 'response'}));
        }
      })
    }
  }

  addCharacter(event: any){
    let character = event.value;
    if(character){
      let characters: Character[] = this.tempScript!.characters!;
      if(!characters.includes(character)){
        this.tempScript?.characters?.push(character);
      }
    }
  }

  removeCharacter(character: Character){
    this.tempScript!.characters = this.tempScript!.characters?.filter(char => character.id !== char.id)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tempScript?.characters!, event.previousIndex, event.currentIndex);
  }

  getCompleteCharacterList(): ScriptCharacterDetails[]{
    let defaultCharacters = this.selectedScript?.characters;
    let playedCharacters = this.selectedScript?.scriptDetails?.scriptCharactersDetails!;
    let completeList: ScriptCharacterDetails[] = [];
    //jako że playedCharacters jest listą tylko granych postaci, poniższy kod wrzuca postacie dostępne ale nie grane w odpowiednie miesjca
    defaultCharacters!.forEach(defaultC => {
      let foundChar = playedCharacters.find(playedC => playedC.name === defaultC.name);
      if(foundChar){
        completeList.push(foundChar);
        playedCharacters = playedCharacters.filter(c => c != foundChar)
      } else {
        completeList.push({characterId: defaultC.id, name: defaultC.name, gamesNumber: 0, occurrencePercentage: 0, wonGamesNumber: 0, winRatio: 0} as ScriptCharacterDetails);
      }
    })
    //a to dodaje potencjalnych travellerów
    completeList = [ ...completeList, ...playedCharacters];

    return completeList;
  }

  copyJson(){
    let json = `[{"id":"_meta","author":"Ktoś na pewno, ale skopiowano z blood.kerbal.space","name":"${this.selectedScript!.name}"}`;
    this.selectedScript?.characters?.forEach(c => json += `,"${c.name}"`);
    json += "]";
    this.clipboard.copy(json);
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
          this.sharedService.fetchScriptAndSelect(this.selectedScript!.id!);
        } else if(status === HttpStatusCode.Created){
          this.sharedService.showDialog(DialogType.INFORMATION, 'Dodano nowy skrypt!');
          this.cancel();
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchScriptHeaders();
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
