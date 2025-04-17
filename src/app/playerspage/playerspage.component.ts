import { Component } from '@angular/core';
import { GamesComponent } from "../gamespage/games/games.component";
import { PlayersComponent } from "./players/players.component";
import { PlayerComponent } from './player/player.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';

@Component({
  selector: 'app-playerspage',
  imports: [PlayerComponent, PlayersComponent, MatIconModule, MatButtonModule],
  templateUrl: './playerspage.component.html',
  styleUrl: './playerspage.component.css'
})
export class PlayerspageComponent {
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
