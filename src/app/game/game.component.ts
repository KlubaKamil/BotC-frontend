import { Component } from '@angular/core';
import { Alignment, Assignment, Character, DialogType, Game, Place, Player, ResponseId, Script, Transformation } from '../shared/interfaces'
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { DtoMapperService } from '../shared/service/dtoMapper.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectModule } from 'primeng/select'
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-game',
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, ButtonModule,
    MatInputModule, MatNativeDateModule, ToggleSwitchModule, ToggleButtonModule, SelectModule, DatePickerModule
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  apiUrl = environment.apiUrl;
  games: Game[] = [];
  scripts: Script[] = [];
  characters: Character[] = [];
  players: Player[] = [];
  places: Place[] = [];
  selectedGame: Game | null = null;
  tempGame: Game | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  availableTravellers: Character[] = [];
  availableFables: Character[] = [];
  alignmentOrder: { [key in Alignment]: number } = {
    [Alignment.TOWNSFOLK]: 1000,
    [Alignment.OUTSIDER]: 2000,
    [Alignment.MINION]: 3000,
    [Alignment.DEMON]: 4000,
    [Alignment.TRAVELLER]: 5000,
    [Alignment.FABLED]: 6000
  };

  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService) {
  }

  ngOnInit() {
    this.sharedService.players$.subscribe((players) => {
      this.players = players!;
    })
    this.sharedService.places$.subscribe((places) => {
      this.places = places!;
    })
    this.sharedService.characters$.subscribe((characters) => {
      this.characters = characters!;
      this.availableTravellers = this.characters?.filter(c => c.alignment === Alignment.TRAVELLER);
      this.availableFables = this.characters?.filter(c => c.alignment === Alignment.FABLED )
    })
    this.sharedService.games$.subscribe((games) => {
      this.games = games!;
    })
    this.sharedService.scripts$.subscribe((scripts) => {
      this.scripts = scripts!;
    })
    this.sharedService.selectedGame$.subscribe((game) => {
      this.cancel();
      this.selectedGame = game;
    })
  }

  createNewGame() {
    this.selectedGame = null;
    this.tempGame = {} as Game;
    this.tempGame.goodWon = true;
    this.tempGame.assignments = [];
    this.isEditing = false;
    this.isCreating = true;
  }

  toggleEdit() {
    if (!this.isEditing && !this.isCreating){
      this.tempGame = JSON.parse(JSON.stringify(this.selectedGame));
      this.tempGame!.script = this.scripts.find(s => s.id === this.selectedGame!.script!.id);
      this.tempGame!.fabled = this.characters.find(c => c.id === this.selectedGame!.fabled?.id);
      this.tempGame!.storyteller = this.players.find(p => p.id === this.selectedGame!.storyteller!.id);
      this.tempGame!.date = this.selectedGame?.date;
      this.tempGame!.assignments!.forEach(assignment => {
        assignment.character = this.tempGame!.script!.characters!.find(c => c.id === assignment.character!.id) || assignment.character;
        assignment.player = this.players.find(p => p.id === assignment.player!.id) || assignment.player;
      });
      this.isEditing = true;
    } else if (this.isEditing) {
      this.tempGame?.assignments!.filter(a => this.tempGame?.script!.characters!.find(c => c === a.character))
      if(this.validate(this.tempGame!)){
        let dto = this.mapper.mapGameToDto(this.tempGame!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/game`, dto, { observe: 'response' }));
      }
    } else if(this.isCreating && this.tempGame) {
      if(this.validate(this.tempGame!)){
        let dto = this.mapper.mapGameToDto(this.tempGame!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/game`, dto, { observe: 'response' }));
      }
    } 
  }

  cancel() {
    this.tempGame = null;
    this.isCreating = false;
    if(this.isEditing){
      this.isEditing = false;
    } else {
      this.selectedGame = null;
    }
  }

  deleteGame() {
    const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tę rozgrywkę?")

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.handleResponse(this.http.delete<any>(`${this.apiUrl}/game/${this.selectedGame!.id}`, { observe: 'response' }));
      } 
    });
  }

  getAssignment(character: Character, index: number): Assignment | undefined {
    return this.tempGame!.assignments!.find(a => a.character!.id === character.id && a.index === index);
  }
  
  updateAssignment(character: Character, player: Player | null, index: number) {
    //usunięcie assigmnemtu, jesli player zostal wyczyszczony
    if (!player) {
      this.tempGame!.assignments = this.tempGame!.assignments!.filter(a => 
        !(a.character!.id === character.id && a.index === index));
      return;
    }
    //usuniecie poprzedniego assignmentu wlasnie przypisanego gracza
    this.tempGame!.assignments = this.tempGame!.assignments!.filter(a => 
      a.player!.id !== player.id
    );
    //usuniecie storytellera jesli gracz zostal przypisany gdzie indziej
    if(this.tempGame?.storyteller?.id == player.id){
      this.tempGame!.storyteller = undefined;
    }
    let existingAssignment = this.getAssignment(character, index);
    if (existingAssignment) {
      existingAssignment.player = player;
    } else {
      this.tempGame!.assignments.push({character: character, player: player, index: index,
        good: [Alignment.TOWNSFOLK, Alignment.OUTSIDER].includes(character.alignment!)});
      this.tempGame!.assignments.sort((a, b) => 
        this.alignmentOrder[a.character!.alignment!] + a.character!.id! - 
        this.alignmentOrder[b.character!.alignment!] - b.character!.id!
      );
    }
  }

  updateAssignmentGood(character: Character, good: boolean, index: number){
    let existingAssignment = this.getAssignment(character, index);
    existingAssignment!.good = good;
  }

  updateStoryteller(player: Player){
    this.tempGame!.assignments = this.tempGame!.assignments!.filter(a => a.player!.id != player.id);
    this.tempGame!.storyteller = player;
  }

  newTransformation(character: Character, index: number){
    let assignment = this.getAssignment(character, index);
    if(!assignment!.transformations){
      assignment!.transformations = [];
    }
    assignment!.transformations?.push({});
  }

  removeTransformation(assignment: Assignment | undefined, transformation: Transformation){
    assignment!.transformations = assignment!.transformations?.filter(t => t !== transformation);
  }

  clearAssignments(){
    this.tempGame!.assignments = [];
  }

  datebe: Date = new Date();

  private validate(game: Game){
    if(!game.script){
      this.sharedService.showDialog(DialogType.INFORMATION, "Skrypt jest wymagany!");
      return false;
    } else if(!game.storyteller) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Narrator jest wymagany!");
      return false;
    } else if(game.goodWon === undefined){
      this.sharedService.showDialog(DialogType.INFORMATION, "Zwycięzcy są wymagani!");
      return false;
    } else if(game.assignments!.length < 5){
      this.sharedService.showDialog(DialogType.INFORMATION, "Do gry potrzeba przynajmniej 5 graczy!");
      return false;
    } else if(this.anyTransformationIncomplete(game.assignments!)){
      this.sharedService.showDialog(DialogType.INFORMATION, "Co najmniej z transformacji postaci jest niekompletna!");
      return false;
    }
    return true;
  }

  private anyTransformationIncomplete(assignments: Assignment[]) : boolean{
    let anyFailed = false;
    assignments.forEach(a =>
      a.transformations?.forEach(t => {
        if(!t.character){
          anyFailed = true;
        }
      })
    )
    return anyFailed;
  }

  private handleResponse(httpResponse: Observable<HttpResponse<ResponseId>>){
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        if(status === HttpStatusCode.Ok){
          this.selectedGame!.script = this.tempGame?.script;
          this.selectedGame!.storyteller = this.tempGame?.storyteller;
          this.selectedGame!.assignments = this.tempGame?.assignments;
          this.selectedGame!.fabled = this.tempGame?.fabled;
          this.selectedGame!.goodWon = this.tempGame?.goodWon;
          this.selectedGame!.notes = this.tempGame?.notes;
          this.selectedGame!.place = this.tempGame?.place;
          this.sharedService.showDialog(DialogType.INFORMATION, "Edycja zakończona pomyślnie!")
          this.cancel();
        } else if(status === HttpStatusCode.Created){
          this.tempGame!.id = response.body!.id;
          this.games.push(this.tempGame!);
          this.sharedService.showDialog(DialogType.INFORMATION, "Dodano nową rozgrywkę!")
          this.cancel();
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchAllGames();
      },
      error: (error: HttpErrorResponse) => {
        this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
      }
    })
  }
}
