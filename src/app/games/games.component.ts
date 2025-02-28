import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../shared/interfaces'
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent {
  games: Game[] | null = null;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.games$.subscribe((games) => {
      this.games = games;
    })
    this.sharedService.fetchAll();
  }

  selectGame(game: Game){
    this.sharedService.setSelectedGame(game);
  }

  addGame(game: Game){
    this.games?.push(game)
  }
} 
