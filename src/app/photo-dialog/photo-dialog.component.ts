import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DialogType, Group } from '../shared/interfaces';
import { DropdownBackService } from '../dropdown-back-service/dropdown-back.service';
import { SharedService } from '../shared/service/shared.service';

@Component({
  selector: 'app-photo-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './photo-dialog.component.html',
  styleUrls: ['./photo-dialog.component.css']
})
export class PhotoDialogComponent {
  apiUrl = environment.apiUrl;
  group: Group = { id: 0, name: 'brak' };
  timestamp = Date.now();

  gameId?: number;
  uploadedImageNames: string[] = [];
  formData: FormData | null = null;
  editAvailable = false;

  selectedPreviews: string[] = [];
  imagesToDelete: string[] = [];
  initialImageNames: string[] = [];
  initialFormDataCount = 0;

  constructor(
    private dialogRef: MatDialogRef<PhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private backSvc: DropdownBackService,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.sharedService.group$.subscribe((group) => (this.group = group));
  }

  async ngOnInit() {
    const game = this.data.game;
    if (game.id) {
      const place = game.place ? `, ${game.place.name}` : '';
      const date = game.date ? `, ${game.date}` : '';
      this.data.message = `Gra ${game.id}, ${game.script?.name}${place}${date}`;
      this.gameId = game.id;
      this.uploadedImageNames = await this.sharedService.getGameImages(game.id);
    } else {
      this.data.message = 'Gra w trakcie tworzenia';
    }
    const oldFormData = this.data.formData;
    if(oldFormData){
      const newFormData = new FormData();
      const files = oldFormData.getAll('imagesToUpload') as File[];
      files.forEach((file: any) => {
        newFormData.append('imagesToUpload', file);
      });

      this.initialFormDataCount = newFormData.getAll('imagesToUpload').length;

      // rebuild previews
      this.selectedPreviews = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.selectedPreviews.push(e.target.result);
        reader.readAsDataURL(file);
      });
      this.initialImageNames = files.map(f => f.name);
      this.formData = newFormData;
    }
    this.editAvailable = this.formData !== null;
  }

  ngOnDestroy() {
    this.backSvc.unregisterDialog(this.dialogRef);
  }

  close() {
    this.dialogRef.close(null);
  }

  confirm() {
    this.dialogRef.close({
      formData: this.formData,
      imagesToDelete: this.imagesToDelete
    });
  }

  addImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        if (file.size > maxSizeInBytes) {
          this.sharedService.showDialog(DialogType.INFORMATION, 'Maksymalny rozmiar zdjęcia to 10MB.');
        } else {
          this.formData!.append('imagesToUpload', file);
          const reader = new FileReader();
          reader.onload = (e: any) => this.selectedPreviews.push(e.target.result);
          reader.readAsDataURL(file);
        }
      });

      this.snackBar.open('Gotowe do zapisania.', undefined, {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
    input.value = '';
  }

  removePreview(index: number) {
    this.selectedPreviews.splice(index, 1);
    const newFormData = new FormData();
    const files = this.formData!.getAll('imagesToUpload');
    files.forEach((file: any, i: number) => {
      if (i !== index) newFormData.append('imagesToUpload', file as File);
    });
    this.formData = newFormData;
  }

  markImageForDeletion(imageName: string) {
    if (!this.imagesToDelete.includes(imageName)) {
      this.imagesToDelete.push(imageName);
    }
  }

  get hasChanges(): boolean {
    const currentFiles = this.formData?.getAll('imagesToUpload') as File[] || [];
    const currentFileNames = currentFiles.map(f => f.name);

    const filesChanged =
      this.initialImageNames.length !== currentFileNames.length ||
      !this.initialImageNames.every(name => currentFileNames.includes(name)) ||
      !currentFileNames.every(name => this.initialImageNames.includes(name));

    const deletionsChanged = this.imagesToDelete.length > 0;

    return filesChanged || deletionsChanged;
  }
}
