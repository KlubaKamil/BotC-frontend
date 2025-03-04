import { Component } from '@angular/core';
import { DialogType, Player, ResponseId } from '../shared/interfaces';
import { SharedService } from '../shared/service/shared.service'
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { DtoMapperService } from '../shared/service/dtoMapper.service';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent {
  apiUrl: string = environment.apiUrl;
  players: Player[] = [];
  selectedPlayer: Player | null = null;
  tempPlayer: Player | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;

  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService){}

  ngOnInit() {
    this.sharedService.selectedPlayer$.subscribe((player) => {
      this.cancel();
      this.selectedPlayer = player;
    })
    this.sharedService.players$.subscribe((players) => {
      this.players = players!;
    })
  }

  createNewPlayer() {
    this.selectedPlayer = null;
    this.tempPlayer = {} as Player;
    this.isEditing = false;
    this.isCreating = true;
  }

  toggleEdit() {
    if (this.isEditing) {
      if(this.validate(this.tempPlayer!)){
        let dto = this.mapper.mapPlayerToDto(this.tempPlayer!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/player`, dto, { observe: 'response' }));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempPlayer!)){
        let dto = this.mapper.mapPlayerToDto(this.tempPlayer!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/player`, dto, { observe: 'response' }));
      }
    } else {
      this.tempPlayer = { ...this.selectedPlayer } as Player;
      this.isEditing = true;
    }
  }

  cancel() {
    this.tempPlayer = null;
    this.isCreating = false;
    if(this.isEditing){
      this.isEditing = false;
    } else {
      this.selectedPlayer = null;
    }
  }

  deletePlayer() {
    const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tego gracza?")

    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        this.handleResponse(this.http.delete<ResponseId>(this.apiUrl + '/player/' + this.selectedPlayer?.id, { observe: 'response' }));
      } 
    });
  }

  private validate(player: Player){
    if(!player.name){
      this.sharedService.showDialog(DialogType.INFORMATION, "Imię jest wymagane!");
      return false;
    }
    return true;
  }

  private handleResponse(httpResponse: Observable<HttpResponse<ResponseId>>){
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        if(status === HttpStatusCode.Ok){
          this.sharedService.showDialog(DialogType.INFORMATION, "Edycja zakończona pomyślnie!")
          this.selectedPlayer!.name = this.tempPlayer!.name;
          this.cancel();
        } else if(status === HttpStatusCode.Created){
          this.tempPlayer!.id = response.body!.id;
          this.players.push(this.tempPlayer!);
          this.sharedService.showDialog(DialogType.INFORMATION, "Dodano nowego gracza!")
          this.tempPlayer!.gamesNumber = 0;
          this.tempPlayer!.goodPercentage = 0;
          this.tempPlayer!.winRatio = 0;
          this.cancel();
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchAllPlayers();
      },
      error: (error: HttpErrorResponse) => {
        const status = error.status;
        if(status === HttpStatusCode.PreconditionRequired){ 
          this.sharedService.showDialog(DialogType.INFORMATION, 'Istnieje co najmniej jedna gra, w której ten gracz bierze udział!');
        } else if(status === HttpStatusCode.Conflict){
          this.sharedService.showDialog(DialogType.INFORMATION, 'Gracz z podaną nazwą już istnieje.');
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
        }
      }
    })
  }
}
