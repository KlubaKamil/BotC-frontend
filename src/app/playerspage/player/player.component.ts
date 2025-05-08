import { Component } from '@angular/core';
import { Achievement, AchievementHeader, DialogType, NotificationType, Player, PlayerAchievement, PlayerHeader, ResponseId } from '../../shared/interfaces';
import { SharedService } from '../../shared/service/shared.service'
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { DtoMapperService } from '../../shared/service/dtoMapper.service';
import { TableModule } from 'primeng/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../authservice/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule, MatButtonModule, TableModule, RouterModule, MatIconModule, SelectModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent {
  apiUrl: string = environment.apiUrl;
  selectedPlayer: Player | null = null;
  tempPlayer: Player | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  achievementHeaders: AchievementHeader[] | null = [];
  imageSize = '100';

  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService, private route: ActivatedRoute,
    private authService: AuthService, private location: Location){}

  ngOnInit() {
    this.sharedService.selectedPlayer$.subscribe((selectedPlayer) => {
      this.cancel();
      this.selectedPlayer = selectedPlayer;
    })
    this.sharedService.achievementHeaders$.subscribe((achievementHeaders) => {
      this.achievementHeaders = achievementHeaders;
    })
    this.route.paramMap.subscribe(params => {
      let id = params.get('id');
      if(id){
        this.sharedService.fetchPlayerAndSelect(id!)
      }
    });
    window.addEventListener('resize', () => this.imageSize = window.innerWidth >= 992 ? '30': '100');
  }

  async createNewPlayer() {
    if(await this.authService.isLoggedIn()){
      this.selectedPlayer = null;
      this.tempPlayer = {} as Player;
      this.isEditing = false;
      this.isCreating = true;
      this.fetchData();
      this.location.go('/players');
    }
  }

  async toggleEdit() {
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
      if(await this.authService.isLoggedIn()){
        this.fetchData();
        this.tempPlayer = { ...this.selectedPlayer } as Player;
        this.isEditing = true;
      }
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

  async deletePlayer() {
    if(await this.authService.isLoggedIn()){
      const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tego gracza?")

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.handleResponse(this.http.delete<ResponseId>(this.apiUrl + '/player/' + this.selectedPlayer?.id, { observe: 'response' }));
        } 
      });
    }
  }

  addAchievement(event: any){
    let achievement = event.value;
    if(achievement){
      let playerAchievements: PlayerAchievement[] = this.tempPlayer!.playerAchievements!;
      if(playerAchievements.map(pa => pa.achievement).indexOf(achievement) == -1){
        this.tempPlayer?.playerAchievements?.push({achievement: achievement});
      }
    }
  }

  removeAchievement(playerAchievement: PlayerAchievement){
    this.tempPlayer!.playerAchievements = this.tempPlayer?.playerAchievements?.filter(pa => pa != playerAchievement);
  }

  private fetchData(){
    this.sharedService.fetchAchievementHeaders();
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
        const id = response.body!.id;
        if(status === HttpStatusCode.Ok){
          let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Edycja zakończona pomyślnie!")
          dialogRef.afterClosed().subscribe((notifyDiscord) => {
            if(notifyDiscord) {
              this.sharedService.notifyDiscord(NotificationType.PLAYER, id);
            }
          });
          this.sharedService.fetchPlayerAndSelect(this.selectedPlayer!.id!)
        } else if(status === HttpStatusCode.Created){
          let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Dodano nowego gracza!")
          dialogRef.afterClosed().subscribe((notifyDiscord) => {
            if(notifyDiscord) {
              this.sharedService.notifyDiscord(NotificationType.PLAYER, id);
            }
          });
          this.cancel();
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchPlayerHeaders();
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
