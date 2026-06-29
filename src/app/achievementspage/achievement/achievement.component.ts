import { Component } from '@angular/core';
import { Achievement, DialogType, Group, NotificationMode, NotificationType, ResponseId } from '../../shared/interfaces';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../shared/service/shared.service';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { DtoMapperService } from '../../shared/service/dtoMapper.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../authservice/auth.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-achievement',
  imports: [CommonModule, FormsModule, MatButtonModule, TableModule, RouterModule],
  templateUrl: './achievement.component.html',
  styleUrl: './achievement.component.css'
})
export class AchievementComponent {
  apiUrl: string = environment.apiUrl;
  selectedAchievement: Achievement | null = null;
  tempAchievement: Achievement | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  group: Group = { id: 0, name: 'brak' };

  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService, private route: ActivatedRoute,
    private authService: AuthService){}

  ngOnInit(){
    this.sharedService.group$.subscribe((group) => {
      this.group = group;
    })
    this.sharedService.selectedAchievement$.subscribe((selectedAchievement) => {
      this.selectedAchievement = selectedAchievement;
    })
    this.route.paramMap.subscribe(params => {
      let id = params.get('id');
      if(id){
        this.sharedService.fetchAchievementAndSelect(id!)
      }
    });
  }

  async createNewAchievement() {
    if(await this.authService.isModTokenValid()){
      this.selectedAchievement = null;
      this.tempAchievement = {} as Achievement;
      this.isEditing = false;
      this.isCreating = true;
      this.sharedService.changeLocation('achievements');
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      if(this.validate(this.tempAchievement!)){
        let dto = this.mapper.mapAchievementToDto(this.tempAchievement!);
        this.handleHttpEvent(this.sharedService.postEntity(dto, 'achievement'));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempAchievement!)){
        let dto = this.mapper.mapAchievementToDto(this.tempAchievement!);
        this.handleHttpEvent(this.sharedService.putEntity(dto, 'achievement'));
      }
    } else {
      if(await this.authService.isModTokenValid()){
        this.tempAchievement = { ...this.selectedAchievement } as Achievement;
        this.isEditing = true;
      }
    }
  }

  cancel() {
    this.tempAchievement = null;
    this.isCreating = false;
    if(this.isEditing){
      this.isEditing = false;
    } else {
      this.selectedAchievement = null;
    }
  }

  async deleteAchievement() {
    if(await this.authService.isModTokenValid()){
      const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć to osiągnięcie?")

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.handleHttpEvent(this.sharedService.deleteEntity(this.selectedAchievement?.id, 'achievement'));
        } 
      });
    }
  }

  private validate(achievement: Achievement){
    if(!achievement.name){
      this.sharedService.showDialog(DialogType.INFORMATION, "Nazwa jest wymagana!");
      return false;
    } else if (!achievement.description){
      this.sharedService.showDialog(DialogType.INFORMATION, "Opis jest wymagany!");
      return false;
    }
    return true;
  }

  private handleHttpEvent(httpResponse: Observable<HttpResponse<ResponseId>>){
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        const id = response.body ? response.body?.id : 0;
        if(status === HttpStatusCode.Ok){
          let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Edycja zakończona pomyślnie!")
          dialogRef.afterClosed().subscribe((notifyDiscord) => {
            if(notifyDiscord) {
              this.sharedService.showDiscordDialog(NotificationMode.UPDATE, NotificationType.ACHIEVEMENT, id);
            }
          });
          this.sharedService.fetchAchievementAndSelect(this.selectedAchievement!.id!)
        } else if(status === HttpStatusCode.Created){
          let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Dodano nowe osiągnięcie!")
          dialogRef.afterClosed().subscribe((notifyDiscord) => {
            if(notifyDiscord) {
              this.sharedService.showDiscordDialog(NotificationMode.NEW, NotificationType.ACHIEVEMENT, id);
            }
          });
          this.cancel();
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchAchievementHeaders();
      },
      error: (error: HttpErrorResponse) => {
        const status = error.status;
        if(status === HttpStatusCode.PreconditionRequired){ 
          this.sharedService.showDialog(DialogType.INFORMATION, 'Istnieje co najmniej jeden gracz, który ma to osiągnięcie!');
        } else if(status === HttpStatusCode.Conflict){
          this.sharedService.showDialog(DialogType.INFORMATION, 'Osiągnięcie z podaną nazwą już istnieje.');
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
        }
      }
    })
  }
}
