import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TableModule } from 'primeng/table';
import { DiscordChannelType, DiscordRoot, DialogType, NotificationMode } from '../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { MatIconModule } from '@angular/material/icon';
import { CheckboxModule } from "primeng/checkbox";
import { DtoMapperService } from '../shared/service/dtoMapper.service';

@Component({
  selector: 'app-discord-dialog',
  imports: [CommonModule, MatButtonModule, FormsModule, TableModule, MatDialogModule, MatIconModule, CheckboxModule],
  templateUrl: './discord-dialog.component.html',
  styleUrl: './discord-dialog.component.css'
})
export class DiscordDialogComponent {
  discordRoot: DiscordRoot = {} as DiscordRoot;
  channelTypes = DiscordChannelType;
  apiUrl = environment.apiUrl;
  notificationMode: NotificationMode;
  title: string;

  constructor(private dialogRef: MatDialogRef<DiscordDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient, private sharedService: SharedService, private dtoMapper: DtoMapperService) {
      this.notificationMode = this.data.notificationMode;
      this.title =  this.notificationMode === NotificationMode.EDIT_CHANNELS 
      ? 'Zaznacz kanały dostępne do powiadomienia' 
      : 'Zaznacz kanały do powiadomienia';
  }
  
  ngOnInit() {
    let path = this.notificationMode === NotificationMode.EDIT_CHANNELS ? '/all' : '/allowed';
    this.sharedService.fetchDiscordServers(this.discordRoot, path);
  }

  close() {
    this.dialogRef.close();
  }

  saveDiscordChannels() {
    this.sharedService.saveDiscordChannels(this.discordRoot);
    this.close();
  }

  sendDiscordNotification(){
    let discordNotification = {
      id: this.data.id,
      notificationType: this.data.notificationType,
      notificationMode: this.notificationMode,
      discordRootDto: this.dtoMapper.mapDiscordRootToDto(this.discordRoot)
    }
    this.sharedService.sendDiscordNotification(discordNotification);
    this.close();
  }

  showHelp(){
    if(this.notificationMode === NotificationMode.EDIT_CHANNELS){
      this.sharedService.showDialogWithInfoText(DialogType.INFORMATION, "Jak to działa?", 
        "Ukazane są tutaj serwery discordowe, na których Grimlog został zainstalowany.\n" + 
        "Aby kanał był widoczny, muszą zostać spełnione następujące warunki:\n" +
        "- Role @everyone musi mieć możliwośc pisania na kanale/w wątku\n" + 
        "- musi to być kanał typu TEXT lub FORUM\n" +
        "Zaznaczone kanały/wątki będą widoczne w oknie powiadomień, które otwiera się\n" + 
        "po edycji wpisu, a powiadomienie zostanie wysłane na nie po kliknięciu przycisku\n" + 
        "\"Wyślij\".\n"
      );
    } else {
      this.sharedService.showDialogWithInfoText(DialogType.INFORMATION, "Jak to działa?", 
        "Ukazane są tutaj serwery discordowe, na których Grimlog został zainstalowany.\n" + 
        "Powiadomienie zostanie wysłane na kanały/wątki, które zostały zaznaczone.\n" +
        "W przypadku wysyłania powiadomienia na temat gry, zostaną także wysłane zdjęcia,\n" +
        "które zostały dodane do rozgrywki.\n"
      );
    }
  }
}
