import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../shared/interfaces'
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
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
  }

  selectGame(game: Game){
    this.sharedService.setSelectedGame(game);
  }
} 
