import { Component } from '@angular/core';
import { Alignment, Character, DialogType, Game, NotificationMode, NotificationType, ResponseId, Script } from '../../shared/interfaces';
import { SharedService } from '../../shared/service/shared.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { DtoMapperService } from '../../shared/service/dtoMapper.service';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../authservice/auth.service';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-character',
  imports: [CommonModule, FormsModule, MatButtonModule, SelectModule, InputNumberModule, TableModule, RouterModule, 
    TextFieldModule, MatIconModule],
  templateUrl: './character.component.html',
  styleUrl: './character.component.css'
})
export class CharacterComponent {
  apiUrl = environment.apiUrl;
  characters: Character[] = [];
  scripts: Script[] = [];
  games: Game[] = [];
  selectedCharacter: Character | null = null;
  tempCharacter: Character | null = null;
  isEditing: boolean = false;
  isCreating: boolean = false;
  alignments = Object.values(Alignment);
  characterStats: {name: string, characterScripts: number, characterTotalTimesPlayed: number, characterTotalWonGames: number,
                  characterTotalWinRatio: number, characterPerScriptDetails: {scriptName: String, characterTimesPlayed: number, 
                  characterWonGames: number, characterWinRatio: number}[]} | undefined;
  imageSize = '100';
  formData: FormData | null = null;
  isPhotoUploaded: boolean = false;
  timestamp: number = Date.now();

  constructor(private sharedService: SharedService, private http: HttpClient, private mapper: DtoMapperService, private route: ActivatedRoute,
    private authService: AuthService, private location: Location, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      let characterId = params.get('id');
      if(characterId){
        this.sharedService.fetchCharacterAndSelect(characterId!)
      }
    });
    this.sharedService.characters$.subscribe((characters) => {
      this.characters = characters!;
    })
    this.sharedService.scripts$.subscribe((scripts) => {
      this.scripts = scripts!;
    })
    this.sharedService.games$.subscribe((games) => {
      this.games = games!;
    })
    this.sharedService.selectedCharacter$.subscribe((character) => {
      this.cancel();
      this.selectedCharacter = character;
    })
    window.addEventListener('resize', () => this.imageSize = window.innerWidth >= 992 ? '100': 'orig');
  }

  async createNewCharacter() {
    if(await this.authService.isLoggedIn()){
      this.selectedCharacter = null;
      this.tempCharacter = {} as Character;
      this.tempCharacter.maxStartNumber = 1;
      this.isEditing = false;
      this.isCreating = true;
      this.location.go('/characters');
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      if(this.validate(this.tempCharacter!)){
        let dto = this.mapper.mapCharacterToDto(this.tempCharacter!);
        this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/character`, dto, {observe: 'response'}));
      }
    } else if(this.isCreating) {
      if(this.validate(this.tempCharacter!)){
        let dto = this.mapper.mapCharacterToDto(this.tempCharacter!);
        this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/character`, dto, {observe: 'response'}));
      }
    } else {
      if (await this.authService.isLoggedIn()){
        this.tempCharacter = JSON.parse(JSON.stringify(this.selectedCharacter));
        this.isEditing = true;
      } 
    }
  }

  cancel() {
    this.tempCharacter = null;
    this.isCreating = false;
    if(this.isEditing){
      this.isEditing = false;
    } else {
      this.selectedCharacter = null;
    }
  }

  async deleteCharacter() {
    if(await this.authService.isLoggedIn()){
      const dialogRef = this.sharedService.showDialog(DialogType.CONFIRMATION, "Na pewno chcesz usunąć tę postać?")

      dialogRef.afterClosed().subscribe((result) => {
        if(result) {
          this.handleResponse(this.http.delete<any>(`${this.apiUrl}/character/${this.selectedCharacter!.id}`, {observe: 'response'}));
        } 
      });
    }
  }

  addImage(event: Event){
    const input = event.target as HTMLInputElement;
    const maxSizeInMB = 10;  
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > maxSizeInBytes) {
        this.sharedService.showDialog(DialogType.INFORMATION, "Maksymalny rozmiar zdjęcia to 15MB.");
      } else {
        this.formData = new FormData();
        this.formData.append('image', file);
        this.isPhotoUploaded = true;
        this.snackBar.open('Przesłano, gotowe do zapisania.', undefined, {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    }
  }

  private validate(character: Character){
    if(!character.name){
      this.sharedService.showDialog(DialogType.INFORMATION, "Nazwa jest wymagana!");
      return false;
    } else if(!character.alignment) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Przynależność jest wymagana!");
      return false;
    } else if(!character.description) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Opis jest wymagany!");
      return false;
    }else if(!character.maxStartNumber) {
      this.sharedService.showDialog(DialogType.INFORMATION, "Maksymalna liczba wystąpień na start rozgrywki jest wymagana!");
      return false;
    }
    return true;
  }
  
  private handleResponse(httpResponse: Observable<HttpResponse<ResponseId>>, handlePhotoResponse?: boolean){
    httpResponse.subscribe({
      next: (response: HttpResponse<ResponseId>) => {
        const status = response.status;
        const id = response.body!.id;
        if(status === HttpStatusCode.Ok){
          if(this.isPhotoUploaded){
            this.isPhotoUploaded = false;
            this.handleResponse(this.http.post<ResponseId>(`${this.apiUrl}/character/${id}/image`, this.formData, { observe: 'response' }), true)
            setTimeout(() => {
              this.timestamp = Date.now();
              }, 1000);
          } else {
            let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Edycja zakończone pomyślnie!")
            dialogRef.afterClosed().subscribe((notifyDiscord) => {
              if(notifyDiscord) {
                this.sharedService.showNotificationDialog(NotificationType.CHARACTER, id, NotificationMode.UPDATE);
              }
            this.sharedService.fetchCharacterAndSelect(this.selectedCharacter!.id!)
            });
          }
        } else if(status === HttpStatusCode.Created){
          if(this.isPhotoUploaded){
            this.isPhotoUploaded = false;
            this.handleResponse(this.http.put<ResponseId>(`${this.apiUrl}/character/${id}/image`, this.formData, { observe: 'response' }), true)
            setTimeout(() => {
              this.timestamp = Date.now();
            }, 1000);
          } else {
            let dialogRef = this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Dodano nową postać!")
            dialogRef.afterClosed().subscribe((notifyDiscord) => {
              if(notifyDiscord) {
                this.sharedService.showNotificationDialog(NotificationType.CHARACTER, id, NotificationMode.NEW);
              }
            });
            this.sharedService.fetchCharacterAndSelect(this.selectedCharacter!.id!)
          }
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!")
          this.cancel();
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Sukces!');
        }
        this.sharedService.fetchCharacterHeaders();
      },
      error: (error: HttpErrorResponse) => {
        const status = error.status;
         if(handlePhotoResponse){
          this.sharedService.showDialog(DialogType.INFORMATION, "Postać zapisana pomyślnie, natomiast przesłanie zdjęcia nie powiodło się!")
        } else if(status === HttpStatusCode.PreconditionRequired){ 
          this.sharedService.showDialog(DialogType.INFORMATION, 'Istnieje co najmniej jedna gra lub skrypt, w której ta postac bierze udział!');
        } else if (status === HttpStatusCode.Conflict){
          this.sharedService.showDialog(DialogType.INFORMATION, 'Postać z tą nazwą już istnieje!');
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
        }
      }
    })
  }
}
