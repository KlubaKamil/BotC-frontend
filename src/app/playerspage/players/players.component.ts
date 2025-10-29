import { Component } from '@angular/core';
import { Character, Game, Player, PlayerHeader, Script } from '../../shared/interfaces'
import { CommonModule } from '@angular/common';
import { SharedService } from '../../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { MatIconModule } from '@angular/material/icon';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { SelectModule } from 'primeng/select';
import { SelectBackCloseDirective } from '../../select-back-close-directive/select-back-close.directive';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-players',
  imports: [FormsModule, CommonModule, MatButtonModule, TableModule, MatIconModule, ToggleButtonModule, MatSlideToggleModule, 
    MatButtonToggleModule, SelectModule, SelectBackCloseDirective],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent {
  playerHeaders: PlayerHeader[] | null = null;
  filteredPlayerHeaders: PlayerHeader[] | null = null;
  characters: Character[] | null = null;
  scripts: Script[] | null = null;
  games: Game[] | null = null;
  tableCard = "Gracze"
  filterValue = "Wszyscy"
  availableFilters: Record<string, Record<string, number>> = {
    Gracze: { Wszyscy: 0, Zaawansowani: 15, Eksperci: 40 },
    Narratorzy: { Wszyscy: 1, Zaawansowani: 10, Eksperci: 30 }
  };
  filteredField: Record<string, (p: PlayerHeader) => number> = {
    Gracze: p => p.gamesNumber,
    Narratorzy: p => p.storytellerGamesNumber
  };

  constructor(private sharedService: SharedService, private route: ActivatedRoute) {}

  ngOnInit(){
    this.sharedService.games$.subscribe((games) => this.games = games);
    this.sharedService.characters$.subscribe((characters) => this.characters = characters);
    this.sharedService.playerHeaders$.subscribe((playerHeaders) => {
      this.playerHeaders = playerHeaders; 
      this.filteredPlayerHeaders = playerHeaders;
    })
    this.route.params.subscribe((params) => {
      this.sharedService.fetchPlayerHeaders();
    });
  }

  selectPlayer(event: TableRowSelectEvent){
    let playerHeader = event.data;
    let id = playerHeader.id;
    this.sharedService.toggleView();
    this.sharedService.changeLocation('players', id);
    this.sharedService.fetchPlayerAndSelect(id);
  }

  getAlignmentGradient(gamesNumber: number, goodPercentage: number): string {
    if(gamesNumber < 10) return 'gray';
    let goodThreshhold = 70
    let r, g, b;

    if (goodPercentage > goodThreshhold){
      r = (100 - goodPercentage) * 8;
      g = 78 + (100 - goodPercentage) * 6;
      b = 161 + (100 - goodPercentage) * 3.5;
    } else {
      r = Math.max(175, 175 + (goodPercentage - 50) * 3.6);
      g = Math.max(18, 18 + (goodPercentage - 50) * 11.5);
      b = Math.max(24, 24 + (goodPercentage - 50) * 10.5);
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
  
  getStorytellerVictoryGradient(gamesNumber: number, goodPercentage: number): string {
    if(gamesNumber == 0) return 'gray'
    let goodThreshhold = 50
    let r, g, b;
    let value = goodPercentage - goodThreshhold;

    if (value > 0){
      r = 255 - value * 5.1;
      g = 255 - value * 3.56;
      b = 255 - value * 1.9;
    } else {
      r = 255 + value * 1.6;
      g = 255 + value * 4.74;
      b = 255 + value * 4.62;
    }
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return `rgb(${r}, ${g}, ${b}`;
  }

  filterPlayers(checked: string){
    this.filterValue = checked;
    let tc = this.tableCard;
    let fv = this.filterValue;

    let field = this.filteredField[tc];
    let minValue = this.availableFilters[tc][fv];

    this.filteredPlayerHeaders = this.playerHeaders!.filter(p => field(p) >= minValue);
  }

  changeTableCard(value: string){
    this.tableCard = value
    this.filterPlayers(this.filterValue)
  }
}
