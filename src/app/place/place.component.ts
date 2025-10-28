import { Component, Inject } from '@angular/core';
import { DialogType, Place, ResponseId } from '../shared/interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { SharedService } from '../shared/service/shared.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-place',
  imports: [TableModule, CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './place.component.html',
  styleUrl: './place.component.css'
})
export class PlaceComponent {
  places: Place[];
  tempPlace: Place = {};
  isCreating: boolean = true;

  constructor(private dialogRef: MatDialogRef<PlaceComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
    private sharedService: SharedService) {
    this.places = data.places;
  }

  ngOnInit(){
    this.sharedService.places$.subscribe((places) => {
      this.places = places!;
    })
  }

  addPlace(){
    if(!this.validatePlace()) return;
    this.handleHttpEvent(this.sharedService.putEntity(this.tempPlace, 'place'))
    this.cancel();
  }

  toggleEdit(place: Place){
    this.isCreating = false;
    this.tempPlace = {...place};
  }

  editPlace(){
    if(!this.validatePlace()) return;
    this.handleHttpEvent(this.sharedService.postEntity(this.tempPlace, 'place'))
    this.cancel();
  }

  deletePlace(place: Place){
    this.handleHttpEvent(this.sharedService.deleteEntity(place.id, 'place'));
  }

  cancel(){
    this.isCreating = true;
    this.tempPlace = {};
  }

  private validatePlace(): boolean{
    let name = this.tempPlace.name;
    if(!name || name.length == 0){
      this.sharedService.showDialog(DialogType.INFORMATION, "Nazwa nie może być pusta.")
      return false;
    } else if(this.places.filter(p => p.name === name).length > 0){
      this.sharedService.showDialog(DialogType.INFORMATION, "Miejsce o podanej nazwie już istnieje.")
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
          this.sharedService.showDialog(DialogType.INFORMATION, "Edycja zakończona pomyślnie.");
        } else if(status === HttpStatusCode.Created){
          this.sharedService.showDialog(DialogType.INFORMATION, "Pomyślnie dodano miejsce.");
        } else if(status === HttpStatusCode.NoContent){
          this.sharedService.showDialog(DialogType.INFORMATION, "Usunięcie zakończone pomyślnie!");
        }
        this.sharedService.fetchAllPlaces();
      },
      error: (error) => {
        const status = error.status;
        if(status === HttpStatusCode.PreconditionRequired){ 
          this.sharedService.showDialog(DialogType.INFORMATION, 'Istnieje co najmniej jedna gra, z tym miejscem rozgrywki.');
        } else {
          this.sharedService.showDialog(DialogType.INFORMATION, "Wystąpił błąd podczas dodawania miejsca rozgrywek.");
        }
      }
    });
  }
}
