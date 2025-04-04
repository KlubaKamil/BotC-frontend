import { Component } from '@angular/core';
import { Character, Game, Player, Script } from '../shared/interfaces'
import { CommonModule } from '@angular/common';
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { MatIconModule } from '@angular/material/icon';
import { ToggleButtonChangeEvent, ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players',
  imports: [FormsModule, CommonModule, MatButtonModule, TableModule, MatIconModule, ToggleButtonModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent {
  playerHeaders: Player[] | null = null;
  filteredPlayerHeaders: Player[] | null = null;
  characters: Character[] | null = null;
  scripts: Script[] | null = null;
  games: Game[] | null = null;

  constructor(private sharedService: SharedService) {}

  ngOnInit(){
    this.sharedService.games$.subscribe((games) => this.games = games);
    this.sharedService.characters$.subscribe((characters) => this.characters = characters);
    this.sharedService.playerHeaders$.subscribe((playerHeaders) => {
      this.playerHeaders = playerHeaders; 
      this.filterInactive(false);
    })
  }

  selectPlayer(event: TableRowSelectEvent){
    let playerHeader = event.data;
    let id = playerHeader.id;
    this.sharedService.fetchPlayerAndSelect(id);
    this.sharedService.setSelectedPlayerHeader(playerHeader);
  }

  getAlignmentGradient(gamesNumber: number, goodPercentage: number): string {
    if(gamesNumber < 10) return 'gray'
    let goodThreshhold = 70
    let r, g, b;

    if (goodPercentage > goodThreshhold){
      r = (100 - goodPercentage) * 7;
      g = 78 + (100 - goodPercentage) * 5.5;
      b = 161 + (100 - goodPercentage) * 3;
    } else {
      r = Math.max(175, 175 + (goodPercentage - 40) * 3);
      g = Math.max(18, 18 + (goodPercentage - 40) * 7);
      b = Math.max(24, 24 + (goodPercentage - 40) * 6);
    }
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    if(r > 255) r = 255;
    if(g > 255) g = 255;
    if(b > 255) b = 255;
    return `rgb(${r}, ${g}, ${b}`;
  }

  getVictoryGradient(gamesNumber: number, winRatio: number): string {
    if(gamesNumber < 10) return 'gray'
    let r, g, b;

    if (winRatio <= 25) {
        r = g = b = 0; // Black
    } else if (winRatio <= 50) {
        let t = (winRatio - 25) / 25; // Normalize between 0 and 1
        r = Math.round(128 * t);
        g = Math.round(128 * t);
        b = Math.round(128 * t);
    } else if (winRatio <= 75) {
        let t = (winRatio - 50) / 25; // Normalize between 0 and 1
        r = Math.round(128 + (255 - 128) * t);
        g = Math.round(128 + (215 - 128) * t);
        b = Math.round(128 + (0 - 128) * t);
    } else {
        r = 255;
        g = 215;
        b = 0; // Gold
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  filterInactive(event: boolean){
    if(event){
      this.filteredPlayerHeaders = this.playerHeaders!.filter(p => p.gamesNumber! >= 10);
    } else {
      this.filteredPlayerHeaders = this.playerHeaders;
    }
  }
}
