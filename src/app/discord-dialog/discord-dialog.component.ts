import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TableModule } from 'primeng/table';
import { DiscordChannelType, DiscordRoot, DiscordNotification } from '../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';

@Component({
  selector: 'app-discord-dialog',
  imports: [CommonModule, MatButtonModule, FormsModule, TableModule, MatDialogModule],
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
      console.log("SELECTED ")
      console.log(selectedRow)
      if(selectedRow) {
        discordNotification.channelsToNotify!.push({
          id: selectedRow.id, 
          channelType: selectedRow.channelType})
      }
    });
    console.log(discordNotification)
    this.sharedService.sendNotification(discordNotification);
    this.close();
  }
}
