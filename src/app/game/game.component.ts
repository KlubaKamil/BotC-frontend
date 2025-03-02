import { Component } from '@angular/core';
import { Alignment, Assignment, Character, DialogType, Game, Player, ResponseId, Script } from '../shared/interfaces'
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { DtoMapperService } from '../shared/service/dtoMapper.service';

@Component({
  selector: 'app-game',
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatFormFieldModule,
    MatInputModule, MatNativeDateModule
  ],
  providers: [
    MatDatepickerModule
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
  selectedGame: Game | null = null;
  tempGame: Game | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  availableTravellers: Character[] = [];
  availableFables: Character[] = [];
  places: string[] = ['W Cesarskiej', 'U Pitera', 'W Czeladzi', 'Online', 'W Mediatece'];
  alignmentOrder: { [key in Alignment]: number } = {
    [Alignment.TOWNSFOLK]: 1000,
    [Alignment.OUTSIDER]: 2000,
    [Alignment.MINION]: 3000,
    [Alignment.DEMON]: 4000,
    [Alignment.TRAVELLER]: 5000,
    [Alignment.FABLED]: 6000
  };

  constructor(private sharedService: SharedService, private http: HttpClient, private dateAdapter: DateAdapter<Date>, private mapper: DtoMapperService) {
    this.dateAdapter.setLocale('en-GB');
  }

  ngOnInit() {
    this.sharedService.players$.subscribe((players) => {
      this.players = players!;
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
    this.tempGame.assignments = [];
    this.isEditing = false;
    this.isCreating = true;
  }

  toggleEdit() {
    console.log(this.isEditing);
    console.log(this.isCreating)
    if (!this.isEditing && !this.isCreating){
      this.tempGame = JSON.parse(JSON.stringify(this.selectedGame));
      this.tempGame!.script = this.scripts.find(s => s.id === this.selectedGame!.script!.id);
      this.tempGame!.fabled = this.characters.find(c => c.id === this.selectedGame!.fabled?.id);
      this.tempGame!.storyteller = this.players.find(p => p.id === this.selectedGame!.storyteller!.id);
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
      console.log("halo1")
      if(this.validate(this.tempGame!)){
        console.log('halo2')
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

  getAssignment(character: Character): Assignment | undefined {
    return this.tempGame!.assignments!.find(a => a.character!.id === character.id);
  }
  
  updateAssignment(character: Character, player: Player | null) {
    if (!player) {
      this.tempGame!.assignments = this.tempGame!.assignments!.filter(a => a.character!.id !== character.id);
      return;
    }
    this.tempGame!.assignments = this.tempGame!.assignments!.filter(assignment => 
      assignment.player!.id != player.id
    );
    if(this.tempGame?.storyteller?.id == player.id){
      this.tempGame!.storyteller = {} as Player;
    }
    let existingAssignment = this.getAssignment(character);
    if (existingAssignment) {
      existingAssignment.player = player;
    } else {
      this.tempGame!.assignments.push({character: character, player: player, 
        good: [Alignment.TOWNSFOLK, Alignment.OUTSIDER].includes(character.alignment!)});
      this.tempGame!.assignments.sort((a, b) => 
        this.alignmentOrder[a.character!.alignment!] + a.character!.id! - 
        this.alignmentOrder[b.character!.alignment!] - b.character!.id!
      );
    }
  }

  updateAssignmentGood(character: Character, good: boolean){
    let existingAssignment = this.getAssignment(character);
    existingAssignment!.good = good;
  }

  updateStoryteller(player: Player){
    this.tempGame!.assignments = this.tempGame!.assignments!.filter(a => a.player!.id != player.id);
    this.tempGame!.storyteller = player;
  }

  clearAssignments(){
    this.tempGame!.assignments = [];
  }

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
    }else if(game.assignments!.length < 5){
      this.sharedService.showDialog(DialogType.INFORMATION, "Do gry potrzeba przynajmniej 5 graczy!");
      return false;
    }
    return true;
  }


  private handleResponse(httpResponse: Observable<HttpResponse<ResponseId>>): boolean{
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        if(status === HttpStatusCode.Ok){
          this.sharedService.showDialog(DialogType.INFORMATION, "Edycja zakończona pomyślnie!")
          this.selectedGame!.script = this.tempGame!.script;
          this.selectedGame!.fabled = this.tempGame!.fabled;
          this.selectedGame!.storyteller = this.tempGame!.storyteller;
          this.selectedGame!.assignments = this.tempGame!.assignments;
          this.selectedGame!.goodWon = this.tempGame!.goodWon;
          this.selectedGame!.date = this.tempGame!.date;
          this.cancel();
        } else if(status === HttpStatusCode.Created){
          this.sharedService.showDialog(DialogType.INFORMATION, "Dodano nową rozgrywkę!")
          this.tempGame!.id = response.body!.id;
          this.games.push(this.tempGame!);
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        return true;
      },
      error: (error: HttpErrorResponse) => {
        this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
        return false;
      }
    })
    return false;
  }
}
