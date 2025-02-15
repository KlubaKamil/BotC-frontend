import { Component } from '@angular/core';
import { Game } from '../shared/interfaces'

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
    game!: Game;

    fillDetails(game: Game){
        this.game = game;
    }
}
