import { Component } from '@angular/core';
import { GamesComponent } from './games/games.component';
import { GameComponent } from './game/game.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';

@Component({
  selector: 'app-gamespage',
  imports: [GamesComponent, GameComponent, MatIconModule, MatButtonModule],
  templateUrl: './gamespage.component.html',
  styleUrl: './gamespage.component.css'
})
export class GamespageComponent {
  detailsView = false;

  constructor(private sharedService: SharedService){}

  ngOnInit() {
    this.sharedService.detailsView$.subscribe((detailsView) => {
      this.detailsView = detailsView;
    })
  }

  toggleView() {
    this.sharedService.toggleView();
  }
}
