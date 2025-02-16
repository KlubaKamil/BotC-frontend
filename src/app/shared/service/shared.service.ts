import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Character, DialogType, Game, Player, Script } from '../interfaces'
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';

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

  constructor(private dialog: MatDialog){}

  setSelectedCharacter(character: Character){
    this.selectedCharacter.next(character);
  }

  setSelectedPlayer(player: Player){
    this.selectedPlayer.next(player);
  }

  showDialog(type: DialogType, message: string){
    return this.dialog.open(DialogComponent, {
      data: {
        type: type,
        message: message
      }
    })
  }
}
