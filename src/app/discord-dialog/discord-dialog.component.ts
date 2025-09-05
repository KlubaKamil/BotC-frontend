import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TableModule } from 'primeng/table';
import { DiscordChannelType, DiscordRoot, DiscordNotification, DialogType } from '../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-discord-dialog',
  imports: [CommonModule, MatButtonModule, FormsModule, TableModule, MatDialogModule, MatIconModule],
  templateUrl: './discord-dialog.component.html',
  styleUrl: './discord-dialog.component.css'
})
export class DiscordDialogComponent {
  discordRoot: DiscordRoot = {} as DiscordRoot;
  channelTypes = DiscordChannelType;
  apiUrl = environment.apiUrl;

  constructor(private dialogRef: MatDialogRef<DiscordDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient, private sharedService: SharedService) {}
  
  ngOnInit() {
    this.sharedService.fetchDiscordServers(this.discordRoot);
  }

  close() {
    this.dialogRef.close();
  }

  sendNotification(){
    let discordNotification: DiscordNotification = {};
    discordNotification.id = this.data.id;
    discordNotification.notificationType = this.data.notificationType.valueOf();
    discordNotification.notificationMode = this.data.notificationMode.valueOf();
    discordNotification.channelsToNotify = [];
    this.discordRoot!.servers.forEach(s => {
      let selectedRow = s.selectedRow
      if(selectedRow) {
        discordNotification.channelsToNotify!.push({
          id: selectedRow.id, 
          channelType: selectedRow.channelType})
      }
    });
    this.sharedService.sendNotification(discordNotification);
    this.close();
  }

  showHelp(){
    this.sharedService.showDialogWithInfoText(DialogType.INFORMATION, "Jak to działa?", 
      "Ukazane są tutaj serwery discordowe, na których Grimlog został zainstalowany.\n" + 
      "Aby kanał był widoczny, muszą zostać spełnione następujące warunki:\n" +
      "- Grimlog musi mieć możliwośc pisania na kanale/w wątku\n" + 
      "- jeśli serwer ma w nazwie \"blood\", wtedy widoczne są wszystkie kanały i wątki,\n" +
      "  w pozostałych przypadkach wyświetlone zostaną tylko kanały z \"blood\" w nazwie" +
      "- jeśli typ kanału to \"forum\", to analogicznie:\n" +
      "   - jeśli zawiera w nazwie \"blood\", wyświetlone zostaną wszystkie wątki\n" +
      "   - jeśli nie zawiera, wyświetlone zostaną tylko wątki z \"blood\" w nazwie\n" +
      "Powiadomienie może zostac wysłane na jeden kanał/wątek na serwer."
    );
  }
}
