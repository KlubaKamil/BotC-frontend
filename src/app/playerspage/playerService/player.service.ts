import { HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { DialogType, NotificationMode, NotificationType, Player, ResponseId } from '../../shared/interfaces';
import { SharedService } from '../../shared/service/shared.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private sharedService: SharedService) { }

  validate(player: Player){
    if(!player.name){
      this.sharedService.showDialog(DialogType.INFORMATION, "Imię jest wymagane!");
      return false;
    }
    return true;
  }

  handleHttpEvent(httpResponse: Observable<HttpResponse<ResponseId>>): Observable<number | null> {
    return httpResponse.pipe(
      map((response: HttpResponse<ResponseId>) => {
        const id = response.body?.id ?? 0;

        if (response.status === HttpStatusCode.Ok) {
          this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Edycja zakończona pomyślnie!");
          this.sharedService.fetchPlayerAndSelect(id);
        } else if (response.status === HttpStatusCode.Created) {
          this.sharedService.showDialog(DialogType.INFORMATION_DISCORD, "Dodano nowego gracza!");
        }
        this.sharedService.fetchPlayerHeaders();

        return id;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.PreconditionRequired) {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Istnieje gra, w której ten gracz bierze udział!');
        } else if (error.status === HttpStatusCode.Conflict) {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Gracz z podaną nazwą już istnieje.');
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Coś poszło nie tak!');
        }

        return of(null); // ✅ wrap in observable
      })
    );
  }
}
