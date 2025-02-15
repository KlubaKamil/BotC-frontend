import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Character, Game, Player, Script } from '../interfaces'

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private selectedGame = new BehaviorSubject<Game | null>(null);
  private selectedScript = new BehaviorSubject<Script | null>(null);
  private selectedCharacter = new BehaviorSubject<Character | null>(null);
  private selectedPlayer = new BehaviorSubject<Player | null>(null);

  selectedGame$ =  this.selectedGame.asObservable();
  selectedScript$ =  this.selectedScript.asObservable();
  selectedCharacter$ =  this.selectedCharacter.asObservable();
  selectedPlayer$ =  this.selectedPlayer.asObservable();

  setSelectedCharacter(character: Character){
    this.selectedCharacter.next(character);
  }

}
