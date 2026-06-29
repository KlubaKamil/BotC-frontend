import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Alignment, Assignment, Character, DialogType, Game, Group, NotificationMode, NotificationType, Place, Player, PlayerDto, ResponseId, Script, ScriptCharacter, Transformation, TransformationType } from '../../shared/interfaces'
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/service/shared.service';
import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse, HttpStatusCode, HttpUploadProgressEvent } from '@angular/common/http';
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
import { Select, SelectModule } from 'primeng/select'
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../authservice/auth.service';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { TableModule } from 'primeng/table';
import { SliderModule } from 'primeng/slider';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialog } from '@angular/material/dialog';
import { PlaceComponent } from '../../place/place.component';
import { ProgressbarComponent } from '../../progressbar/progressbar.component';
import { SelectBackCloseDirective } from '../../select-back-close-directive/select-back-close.directive';
import { DropdownModule } from 'primeng/dropdown';
import { PhotoDialogComponent } from '../../photo-dialog/photo-dialog.component';
import { PlayerService } from '../../playerspage/playerService/player.service';

@Component({
  selector: 'app-game',
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, ButtonModule, DividerModule,
    MatInputModule, MatNativeDateModule, ToggleSwitchModule, ToggleButtonModule, SelectModule, DatePickerModule, RouterModule,
    TableModule, SliderModule, MatSliderModule, SelectBackCloseDirective, DropdownModule
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  apiUrl = environment.apiUrl;
  group: Group = { id: 0, name: 'brak' };
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
  formData: FormData | null = null;
  isPhotoUploaded: boolean = false;
  imagesToDelete: string[] = [];
  balanceSliderValue = 0;
  averageBalanceMark = 0;
  imageSize = 100;
  isMobile = false;
  snackBarRef!: MatSnackBarRef<ProgressbarComponent>;
  selectedFable: Character | null = null;
  selectedStoryteller: Player | null = null;
  transformationTypes = Object.values(TransformationType);

  constructor(private sharedService: SharedService, private mapper: DtoMapperService, private route: ActivatedRoute, 
    private authService: AuthService, private snackBar: MatSnackBar, private cd: ChangeDetectorRef, 
    private dialog: MatDialog, private playerService: PlayerService) {
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    this.sharedService.group$.subscribe((group) => {
      this.group = group;
    })
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
      this.calculateBalance();
    })
    this.route.paramMap.subscribe(params => {
      let id = params.get('id');
      if(id){
        this.sharedService.fetchGameAndSelect(id!)
      }
    });
    window.addEventListener('resize', () => this.imageSize = window.innerWidth >= 992 ? 30 : 100);
  }

  async createNewGame() {
    if(await this.authService.isModTokenValid()){
      this.selectedGame = null;
      this.tempGame = {} as Game;
      this.tempGame.goodWon = true;
      this.tempGame.assignments = [];
      this.tempGame.balanceMarks = [];
      this.tempGame.storytellers = [];
      this.tempGame.fables = [];
      this.isEditing = false;
      this.isCreating = true;
      this.formData = new FormData();
      this.fetchData();
      this.sharedService.changeLocation('games');
    }
  }

  async duplicate(){
    if(await this.authService.isModTokenValid()){
      this.fetchData();
      this.tempGame = JSON.parse(JSON.stringify(this.selectedGame));
      this.selectedGame = null;
      this.tempGame!.id = undefined;
      this.tempGame!.assignments = [];
      this.tempGame!.notes = "";
      this.formData = new FormData();
      this.isCreating = true;
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      this.tempGame?.assignments!.filter(a => this.tempGame?.script!.scriptCharacters!.find(sc => sc.character === a.character))
      if(this.validate(this.tempGame!)){
        let dto = this.mapper.mapGameToDto(this.tempGame!);
        this.handleHttpEvent(this.sharedService.postEntity(dto, 'game'));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempGame!)){
        let dto = this.mapper.mapGameToDto(this.tempGame!);
        this.handleHttpEvent(this.sharedService.putEntity(dto, 'game'));
      }
    } else {
      if(await this.authService.isModTokenValid()){
        this.fetchData();
        this.tempGame = JSON.parse(JSON.stringify(this.selectedGame));
        this.isEditing = true;
        this.formData = new FormData();
      }
    }
  }

  cancel() {
    this.tempGame = null;
    this.isCreating = false;
    this.isPhotoUploaded = false;
    if(this.isEditing){
      this.isEditing = false;
    } else {
      this.selectedGame = null;
    }
  }

  async deleteGame() {
    if(await this.authService.isModTokenValid()){
      const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tę rozgrywkę?")

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.handleHttpEvent(this.sharedService.deleteEntity(this.selectedGame!.id, 'game'));
        } 
      });
    }
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
    this.tempGame!.storytellers = this.tempGame?.storytellers?.filter(s => s.id != player.id);
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

  updateStoryteller(i: number, event: any){
    let storyteller = event.value;
    if(!storyteller){
      this.tempGame!.storytellers = this.tempGame?.storytellers?.filter((s, index) => i !== index)
    } else {
      this.tempGame!.storytellers = this.tempGame?.storytellers?.filter((s, index) => i === index || s !== storyteller)
      this.tempGame!.assignments = this.tempGame?.assignments?.filter(a => a.player?.id != storyteller.id)
    }
  }
  
  async addStoryteller(event: any){
    let storyteller = event.value;
    let alreadyAdded = this.tempGame?.storytellers?.some(s => s === storyteller)
    if(storyteller && !alreadyAdded){
      this.tempGame?.storytellers?.push(storyteller);
      this.tempGame!.assignments = this.tempGame?.assignments?.filter(a => a.player?.id != storyteller.id)
    }
    //chuj wie czemu event.originalEvent.target.blur() tutaj nie dziala
    setTimeout(() => {
      this.selectedStoryteller = null;
    });
  }

  updateFable(i: number, event: any){
    let fable = event.value;
    if(!fable){
      this.tempGame!.fables = this.tempGame?.fables?.filter((f, index) => i !== index)
    } else {
      this.tempGame!.fables = this.tempGame?.fables?.filter((f, index) => i === index || f !== fable)
    }
  }

  async addFable(event: any){
    let fable = event.value;
    let alreadyAdded = this.tempGame?.fables?.some(f => f === fable)
    if(fable && !alreadyAdded){
      this.tempGame?.fables?.push(fable);
    }
    //chuj wie czemu event.originalEvent.target.blur() tutaj nie dziala
    setTimeout(() => {
      this.selectedFable = null;
    });
  }

  newTransformation(character: Character, index: number){
    let assignment = this.getAssignment(character, index);
    if(!assignment!.transformations){
      assignment!.transformations = [];
    }
    assignment!.transformations?.push({type: TransformationType.BECOME});
  }

  removeTransformation(assignment: Assignment | undefined, transformation: Transformation){
    assignment!.transformations = assignment!.transformations?.filter(t => t !== transformation);
  }

  clearAssignments(){
    this.tempGame!.assignments = [];
  }

  showPhotoDialog(){
    if (this.tempGame) {
      let dialogRef = this.sharedService.showPhotoDialog(this.tempGame!, this.formData!);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.isPhotoUploaded = true;
          this.formData = result.formData;
          this.imagesToDelete = result.imagesToDelete;
        }
      });
    } else {
      this.sharedService.showPhotoDialog(this.selectedGame!);
    }
  }

  // showImage(){
  //   let date = this.selectedGame?.date ? ', ' + this.selectedGame?.date : '';
  //   let place = this.selectedGame?.place ? ', ' + this.selectedGame?.place.name : '';
  //   this.sharedService.showPhotoDialog(
  //     DialogType.PHOTOGRAPHY, 
  //     `Gra ${this.selectedGame?.id}, ${this.selectedGame?.script?.name}${place}${date}`, 
  //     `${this.apiUrl}/game/${this.group.id}/${this.selectedGame?.id}/image`)
  // }

  async addBalanceMark(){
    if(await this.authService.isMemberTokenValid()){
      let message = `Na pewno chcesz dodać ocenę balansu: ${this.balanceSliderValue}?`;
      let dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, message);
      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          let username = localStorage.getItem('username')!;
          let balanceMark = {mark: this.balanceSliderValue, username: username};
          this.handleBalanceMarkResponse(this.sharedService.putEntity(balanceMark, 'game', `${this.selectedGame?.id}/balance`));
        }
        this.calculateBalance();
      })
    }
  }

  async updateBalanceMark(){
    if(await this.authService.isMemberTokenValid()){
      let message = `Na pewno chcesz zaktualizować ocenę balansu: ${this.balanceSliderValue}?`;
      let dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, message);
      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          let username = localStorage.getItem('username')!;
          let balanceMark = this.selectedGame?.balanceMarks?.find(bm => bm.username === username);
          if(balanceMark) {
            balanceMark.mark = this.balanceSliderValue;
            this.handleBalanceMarkResponse(this.sharedService.postEntity(balanceMark, 'game', `${this.selectedGame?.id}/balance`));
          }
        }
        this.calculateBalance();
      })
    }
  }

  async removeBalanceMark(){
    if(await this.authService.isMemberTokenValid()){
      let message = `Na pewno chcesz usunąć ocenę balansu: ${this.balanceSliderValue}?`;
      let dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, message);
      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          let username = localStorage.getItem('username')!;
          this.handleBalanceMarkResponse(this.sharedService.deleteEntity(`${this.selectedGame?.id}/balance/${username}`, 'game'));
        }
        this.calculateBalance();
      })
    }
  }

  getBalanceMarksAsString(): string {
    return this.selectedGame?.balanceMarks?.map(bm => `${bm.username} (${bm.mark})`).join(', ') || '';
  }

  userAlreadyAddedBalanceMark(): boolean{
    let username = localStorage.getItem('username')!;
    return this.selectedGame?.balanceMarks?.some(bm => bm.username === username) || false;
  }

  openPlaceDialog(){
    this.dialog.open(PlaceComponent, { data: {places: this.places}});
  }

  isGroupMember(): boolean{
    return this.authService.isMember();
  }

  //Niech Bóg ma mnie w swej opiece...
  addNewPlayer(playerSelect: Select, scriptCharacter: ScriptCharacter, index: number){
    playerSelect.hide();
    const dialogRef = this.sharedService.showDialog(DialogType.INSERTION, 'Podaj imię nowego gracza:');
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        const dto = {name: result, playerAchievements: []} as PlayerDto;
        this.playerService.handleHttpEvent(this.sharedService.putEntity(dto, 'player')).subscribe((id) => 
          this.sharedService.getAllPlayers().subscribe((players) => {
            if(id){
              this.sharedService.setPlayers(players);
              const player = this.players.find(p => p.id === id);
              if(player){
                this.updateAssignment(scriptCharacter.character!, player, index);
              } else {
                this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak');
              }
            }
          })
        );
      }
    })
  }

  private calculateBalance(){
    let length = this.selectedGame?.balanceMarks?.length!;
    if(length > 0){
      let sum = 0;
      this.selectedGame?.balanceMarks?.forEach(bm => sum += bm.mark!);
      this.averageBalanceMark = sum / length
      this.balanceSliderValue = Math.round(this.averageBalanceMark);
    }
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
    } else if(game.storytellers!.length == 0) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Narrator jest wymagany!");
      return false;
    } else if(game.goodWon === undefined){
      this.sharedService.showDialog(DialogType.INFORMATION, "Zwycięzcy są wymagani!");
      return false;
    // } else if(game.assignments!.length < 5){
    //   this.sharedService.showDialog(DialogType.INFORMATION, "Do gry potrzeba przynajmniej 5 graczy!");
    //   return false;
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

  private handleHttpEvent(httpResponse: Observable<HttpEvent<ResponseId>>, handlePhotoResponse?: boolean){
    httpResponse.subscribe({
      next: (event: HttpEvent<ResponseId>) => {
        const eventType = event.type;
        switch(eventType){
          case HttpEventType.UploadProgress:   
            this.handleUploadProgress(event);
            break;
          case HttpEventType.Response:
            this.handleResponse(event)
            break;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.handleErrorResponse(error, handlePhotoResponse);
      }
    })
  }

  private handleUploadProgress(event: HttpEvent<any>){
    let uploadEvent = event as HttpUploadProgressEvent;
    if(uploadEvent.total){
      let progress = Math.round(100 * uploadEvent.loaded / uploadEvent.total);
      this.snackBarRef!.instance.progress = progress;
    }
  }

  private handleResponse(response: HttpResponse<ResponseId>){
    const status = response.status;
    const id = response.body ? response.body?.id : 0;
    if(status === HttpStatusCode.Ok){
      if(this.isPhotoUploaded){
        this.isPhotoUploaded = false;
        this.openProgressBar();
        this.handleHttpEvent(this.sharedService.postGameImages(this.formData!, this.imagesToDelete, `${id}`))
      } else {
        let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Edycja zakończona pomyślnie!")
        dialogRef.afterClosed().subscribe((notifyDiscord) => {
          if(notifyDiscord) {
            this.sharedService.showDiscordDialog(NotificationMode.UPDATE, NotificationType.GAME, id);
          }
        });
        if(this.snackBarRef){
          this.snackBarRef.dismiss();
        } 
        this.sharedService.fetchGameAndSelect(id);
      }
    } else if(status === HttpStatusCode.Created){
      if(this.isPhotoUploaded){
        this.isPhotoUploaded = false;
        this.openProgressBar();
        this.handleHttpEvent(this.sharedService.postGameImages(this.formData!, this.imagesToDelete, `${id}`));
      } else {
        let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Dodano nową rozgrywkę!")
        dialogRef.afterClosed().subscribe((notifyDiscord) => {
          if(notifyDiscord) {
            this.sharedService.showDiscordDialog(NotificationMode.NEW, NotificationType.GAME, id);
          }
        });
        if(this.snackBarRef){
          this.snackBarRef.dismiss();
        }
        this.sharedService.fetchGameAndSelect(id);
      }
      this.cancel();
    } else if(status === HttpStatusCode.NoContent){
      this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
      this.cancel();
    } else {
      this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
    }
    this.sharedService.fetchGameHeaders();

  }

  private handleErrorResponse(error: HttpErrorResponse, handlePhotoResponse?: boolean){
    if(handlePhotoResponse){
      this.snackBarRef.dismiss();
      this.sharedService.showDialog(DialogType.INFORMATION, "Rozgrywka zapisana pomyślnie, natomiast przesłanie zdjęcia nie powiodło się!")
    } else {
      this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
    }
  }

  private handleBalanceMarkResponse(httpResponse: Observable<HttpResponse<any>>){
    httpResponse.subscribe({
      next: (response: HttpResponse<any>) => {
        const status = response.status;
        if(status === HttpStatusCode.Ok){
          this.sharedService.showDialog(DialogType.INFORMATION, "Zaktualizowano ocenę!");
        } else if(status === HttpStatusCode.Created){
          this.sharedService.showDialog(DialogType.INFORMATION, "Dodano ocenę!");
        } else if(status === HttpStatusCode.NoContent) {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Usunięto ocenę!');
        }
        this.sharedService.fetchGameAndSelect(this.selectedGame!.id!);
      }, 
      error: (error: HttpErrorResponse) => {
        this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
      }
    })
  }

  private openProgressBar(){
    this.snackBarRef = this.snackBar.openFromComponent(ProgressbarComponent, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['upload-snackbar'],
      data: { progress: 0 },
      duration: undefined
    });
  }
}
