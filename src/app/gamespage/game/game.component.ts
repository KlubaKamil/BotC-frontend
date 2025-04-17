import { Component } from '@angular/core';
import { Alignment, Assignment, Character, DialogType, Game, Place, Player, ResponseId, Script, Transformation } from '../../shared/interfaces'
import { CommonModule, Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/service/shared.service';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { DtoMapperService } from '../../shared/service/dtoMapper.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectModule } from 'primeng/select'
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../authservice/auth.service';

@Component({
  selector: 'app-game',
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, ButtonModule, DividerModule,
    MatInputModule, MatNativeDateModule, ToggleSwitchModule, ToggleButtonModule, SelectModule, DatePickerModule, RouterModule
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
  
  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService,
    private route: ActivatedRoute, private authService: AuthService, private location: Location) {
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
    this.sharedService.scripts$.subscribe((scripts) => {
      this.scripts = scripts!;
    })
    this.sharedService.selectedGame$.subscribe((selectedGame) => {
      this.cancel();
      this.selectedGame = selectedGame;
    })
    this.route.paramMap.subscribe(params => {
      let id = params.get('id');
      if(id){
        this.sharedService.fetchGameAndSelect(id!)
      }
    });
  }

  async createNewGame() {
    if(await this.authService.isLoggedIn()){
      this.selectedGame = null;
      this.tempGame = {} as Game;
      this.tempGame.goodWon = true;
      this.tempGame.assignments = [];
      this.isEditing = false;
      this.isCreating = true;
      this.fetchData();
      this.location.go('/games');
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      this.tempGame?.assignments!.filter(a => this.tempGame?.script!.characters!.find(c => c === a.character))
      if(this.validate(this.tempGame!)){
        let dto = this.mapper.mapGameToDto(this.tempGame!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/game`, dto, { observe: 'response' }));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempGame!)){
        let dto = this.mapper.mapGameToDto(this.tempGame!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/game`, dto, { observe: 'response' }));
      }
    } else {
      if(await this.authService.isLoggedIn()){
        this.fetchData();
        this.tempGame = { ...this.selectedGame } as Game;
        this.isEditing = true;
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

  private fetchData(){
    this.sharedService.fetchAllScripts();
    this.sharedService.fetchAllCharacters();
    this.sharedService.fetchAllPlayers();
    this.sharedService.fetchAllPlaces();
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
          this.sharedService.showDialog(DialogType.INFORMATION, "Edycja zakończona pomyślnie!")
          this.sharedService.fetchGameAndSelect(this.selectedGame!.id!);
        } else if(status === HttpStatusCode.Created){
          this.sharedService.showDialog(DialogType.INFORMATION, "Dodano nową rozgrywkę!")
          this.cancel();
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchGameHeaders();
      },
      error: (error: HttpErrorResponse) => {
        this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
      }
    })
  }
}
