import { Component } from '@angular/core';
import { Achievement, AchievementHeader, DialogType, Group, NotificationMode, NotificationType, Player, PlayerAchievement, PlayerHeader, ResponseId } from '../../shared/interfaces';
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
import { DatePickerModule } from 'primeng/datepicker';
import { SelectBackCloseDirective } from '../../select-back-close-directive/select-back-close.directive';
import { PlayerService } from '../playerService/player.service';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule, MatButtonModule, TableModule, RouterModule, MatIconModule, SelectModule, 
    DatePickerModule, SelectBackCloseDirective],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent {
  apiUrl = environment.apiUrl;
  group: Group = { id: 0, name: 'brak' };
  selectedPlayer: Player | null = null;
  tempPlayer: Player | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  achievementHeaders: AchievementHeader[] | null = [];
  imageSize = '100';

  constructor(private sharedService: SharedService, private mapper: DtoMapperService, private route: ActivatedRoute,
    private authService: AuthService, private playerService: PlayerService){}

  ngOnInit() {
    this.sharedService.group$.subscribe((group) => {
      this.group = group;
    })
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
    if(await this.authService.isModTokenValid()){
      this.selectedPlayer = null;
      this.tempPlayer = {} as Player;
      this.isEditing = false;
      this.isCreating = true;
      this.fetchData();
      this.sharedService.changeLocation('players');
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      if(this.playerService.validate(this.tempPlayer!)){
        let dto = this.mapper.mapPlayerToDto(this.tempPlayer!);
        this.playerService.handleHttpEvent(this.sharedService.postEntity(dto, 'player'));
        this.sharedService.fetchPlayerAndSelect(this.selectedPlayer!.id!)
      }
    } else if(this.isCreating) {
      if(this.playerService.validate(this.tempPlayer!)){
        let dto = this.mapper.mapPlayerToDto(this.tempPlayer!);
        this.playerService.handleHttpEvent(this.sharedService.putEntity(dto, 'player'));
        this.cancel();
      }
    } else {
      if(await this.authService.isModTokenValid()){
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
    if(await this.authService.isModTokenValid()){
      const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tego gracza?")

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.playerService.handleHttpEvent(this.sharedService.deleteEntity(this.selectedPlayer?.id, 'player'));
          this.cancel();
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
}
