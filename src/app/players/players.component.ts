import { Component } from '@angular/core';
import { Assignment, Character, Game, Player, Script } from '../shared/interfaces'
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
      let gamesWithPlayer = this.games?.filter(g => g.assignments?.find(a => a.player?.id === p.id)) || [];
      let gamesNumber = gamesWithPlayer.length;
      let gamesBeingGood = gamesWithPlayer.filter(g => this.wasGoodInGame(g, p)).length || 0;
      let wonGames = gamesWithPlayer.filter(g => this.wasGoodInGame(g, p) === g.goodWon).length || 0;
      p.gamesNumber = gamesNumber;
      p.goodPercentage = gamesNumber === 0 ? 0 : 100 * gamesBeingGood / gamesNumber;
      p.winRatio = gamesNumber === 0 ? 0 : 100 * wonGames / gamesNumber;
    });
  }

  private wasGoodInGame(game: Game, player: Player): boolean{
    let assignment = game.assignments!.find(a => a.player?.id === player.id)!;
    let good = assignment.good!;
    if(assignment.transformations?.length && assignment.transformations?.length > 0){
      let length = assignment.transformations.length;
      let lastTransformation = assignment.transformations[length - 1];
      good = lastTransformation.good!;
    }
    return good;
  }
}
