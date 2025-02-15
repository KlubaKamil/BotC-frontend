import { Component } from '@angular/core';
import { GameComponent } from "./game/game.component";
import { GamesComponent } from "./games/games.component";
import { CommonModule } from '@angular/common';
import { ButtonsComponent } from './buttons/buttons.component';
import { ScriptsComponent } from "./scripts/scripts.component";
import { CharactersComponent } from './characters/characters.component';
import { PlayersComponent } from './players/players.component';
import { ScriptComponent } from "./script/script.component";
import { CharacterComponent } from "./character/character.component";
import { PlayerComponent } from "./player/player.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, GameComponent, GamesComponent, ButtonsComponent,
    ScriptsComponent, CharactersComponent, PlayersComponent, ScriptComponent, 
    CharacterComponent, PlayerComponent]
})
export class AppComponent {
  title = 'BotC-frontend';
  activeComponent: string = 'games';

  changeComponent(activeComponent: string){
    this.activeComponent = activeComponent;
  }
}
