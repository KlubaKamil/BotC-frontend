import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../shared/interfaces'
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent {
  games: Game[] | null = null;
  error: string = '';  
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {  
    this.fetchAllGames();
  }

  fetchAllGames() {
    this.http.get<Game[]>(this.apiUrl + '/game/all').subscribe({
      next: (data) => {
        this.games = data;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to fetch games data.';
        this.games = null;
      }
    });
  }

  showPlayers(game: Game){
    console.log(game);
  }
} 
