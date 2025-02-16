import { Component } from '@angular/core';
import { Player } from '../shared/interfaces'
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';

@Component({
  selector: 'app-players',
  imports: [CommonModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css'
})
export class PlayersComponent {
  players: Player[] | null = null;
  error: string = '';
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private sharedService: SharedService) {
    this.fetchAllPlayers();
  }

  fetchAllPlayers() {
    this.http.get<Player[]>(this.apiUrl + '/player/all').subscribe({
      next: (data) => {
        this.players = data;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to fetch players data.';
        this.players = null;
      }
    })
  }

  selectPlayer(player: Player){
    this.sharedService.setSelectedPlayer(player);
  }
}
