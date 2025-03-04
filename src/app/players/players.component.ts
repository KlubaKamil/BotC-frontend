import { Component } from '@angular/core';
import { Character, Game, Player, Script } from '../shared/interfaces'
import { CommonModule } from '@angular/common';
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-players',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css'
})
export class PlayersComponent {
  players: Player[] | null = null;
  characters: Character[] | null = null;
  scripts: Script[] | null = null;
  games: Game[] | null = null;

  constructor(private sharedService: SharedService) {}

  ngOnInit(){
    this.sharedService.games$.subscribe((games) => this.games = games);
    this.sharedService.characters$.subscribe((characters) => this.characters = characters);
    this.sharedService.players$.subscribe((players) => {
      this.players = players; 
      this.getDetails();
    })
  }

  selectPlayer(player: Player){
    this.sharedService.setSelectedPlayer(player);
  }

  addPlayer(player: Player){
    this.players?.push(player);
  }

  private getDetails(){
    this.players?.forEach(p => {
      let gamesNumber = this.games?.filter(g => g.assignments?.find(a => a.player?.id === p.id)).length || 0;
      let gamesBeingGood = this.games?.filter(g => g.assignments?.find(a => a.player?.id === p.id && a.good)).length || 0;
      let wonGames = this.games?.filter(g => g.assignments?.find(a => a.player?.id === p.id && g.goodWon === a.good)).length || 0;
      p.gamesNumber = gamesNumber;
      p.goodPercentage = gamesNumber === 0 ? 0 : 100 * gamesBeingGood / gamesNumber;
      p.winRatio = gamesNumber === 0 ? 0 : 100 * wonGames / gamesNumber;
    });
  }
}
