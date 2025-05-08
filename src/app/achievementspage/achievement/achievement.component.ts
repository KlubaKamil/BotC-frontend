import { Component } from '@angular/core';
import { Achievement, DialogType, NotificationType, ResponseId } from '../../shared/interfaces';
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

  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService, private route: ActivatedRoute,
    private authService: AuthService, private location: Location){}

  ngOnInit(){
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
    if(await this.authService.isLoggedIn()){
      this.selectedAchievement = null;
      this.tempAchievement = {} as Achievement;
      this.isEditing = false;
      this.isCreating = true;
      this.location.go('/achievements');
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      if(this.validate(this.tempAchievement!)){
        let dto = this.mapper.mapAchievementToDto(this.tempAchievement!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/achievement`, dto, { observe: 'response' }));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempAchievement!)){
        let dto = this.mapper.mapAchievementToDto(this.tempAchievement!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/achievement`, dto, { observe: 'response' }));
      }
    } else {
      if(await this.authService.isLoggedIn()){
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
    if(await this.authService.isLoggedIn()){
      const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć to osiągnięcie?")

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.handleResponse(this.http.delete<ResponseId>(this.apiUrl + '/achievement/' + this.selectedAchievement?.id, { observe: 'response' }));
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

  private handleResponse(httpResponse: Observable<HttpResponse<ResponseId>>){
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        const id = response.body!.id;
        if(status === HttpStatusCode.Ok){
          let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Edycja zakończona pomyślnie!")
          dialogRef.afterClosed().subscribe((notifyDiscord) => {
            if(notifyDiscord) {
              this.sharedService.notifyDiscord(NotificationType.ACHIEVEMENT, id);
            }
          });
          this.sharedService.fetchAchievementAndSelect(this.selectedAchievement!.id!)
        } else if(status === HttpStatusCode.Created){
          let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Dodano nowe osiągnięcie!")
          dialogRef.afterClosed().subscribe((notifyDiscord) => {
            if(notifyDiscord) {
              this.sharedService.notifyDiscord(NotificationType.ACHIEVEMENT, id);
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
