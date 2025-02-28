import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Character, CharacterDto, DialogType, Game, GameDto, Player, PlayerDto, Script, ScriptDto } from '../interfaces'
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DtoMapperService } from './dtoMapper.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private games = new BehaviorSubject<Game[] | null>(null);
  private scripts = new BehaviorSubject<Script[] | null>(null);
  private characters = new BehaviorSubject<Character[] | null>(null);
  private players = new BehaviorSubject<Player[] | null>(null);
  private selectedGame = new BehaviorSubject<Game | null>(null);
  private selectedScript = new BehaviorSubject<Script | null>(null);
  private selectedCharacter = new BehaviorSubject<Character | null>(null);
  private selectedPlayer = new BehaviorSubject<Player | null>(null);

  games$ = this.games.asObservable();
  scripts$ = this.scripts.asObservable();
  characters$ = this.characters.asObservable();
  players$ = this.players.asObservable();
  selectedGame$ =  this.selectedGame.asObservable();
  selectedScript$ =  this.selectedScript.asObservable();
  selectedCharacter$ =  this.selectedCharacter.asObservable();
  selectedPlayer$ =  this.selectedPlayer.asObservable();
  
  apiUrl = environment.apiUrl;
  

  constructor(private dialog: MatDialog, private http: HttpClient, private mapper: DtoMapperService){
  }

  fetchAll(){
    this.fetchAllCharacters();
    this.fetchAllPlayers();
    this.fetchAllGames();
    this.fetchAllScripts();
  }

  setCharacters(characters: Character[]){
    this.characters.next(characters);
  }

  setSelectedCharacter(character: Character){
    this.selectedCharacter.next(character);
  }

  removeCharacter(id: number){
    const updatedCharacters = this.characters.getValue()?.filter(character => character.id !== id);
    this.characters.next(updatedCharacters!);
  }

  setPlayers(players: Player[]){
    this.players.next(players);
  }

  setSelectedPlayer(player: Player){
    this.selectedPlayer.next(player);
  }

  removePlayer(id: number){
    const updatedPlayers = this.players.getValue()?.filter(player => player.id !== id);
    this.players.next(updatedPlayers!);
  }

  setScripts(scripts: Script[]){
    this.scripts.next(scripts);
  }

  setSelectedScript(script: Script){
    this.selectedScript.next(script);
  }

  removeScript(id: number){
    const updatedScripts = this.scripts.getValue()?.filter(script => script.id !== id);
    this.scripts.next(updatedScripts!);
  }

  setGames(games: Game[]){
    this.games.next(games);
  }

  setSelectedGame(game: Game){
    this.selectedGame.next(game);
  }

  removeGame(id: number){
    const updateGames = this.games.getValue()?.filter(game => game.id !== id);
    this.games.next(updateGames!);
  }

  fetchAllCharacters() {
    this.http.get<CharacterDto[]>(this.apiUrl + '/character/all').subscribe({
      next: (characterDtos: CharacterDto[]) => {
        this.setCharacters(this.mapper.mapDtosToCharacters(characterDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania postaci.')
      }
    })
  }

  fetchAllPlayers() {
    this.http.get<PlayerDto[]>(this.apiUrl + '/player/all').subscribe({
      next: (playerDtos: PlayerDto[]) => {
        this.setPlayers(this.mapper.mapDtosToPlayers(playerDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania graczy.');
      }
    })
  }

  fetchAllGames() {
    this.http.get<GameDto[]>(this.apiUrl + '/game/all').subscribe({
      next: (gameDtos: GameDto[]) => {
        this.setGames(this.mapper.mapDtosToGames(gameDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania gier.');
      }
    });
  }

  fetchAllScripts(){
    this.http.get<ScriptDto[]>(this.apiUrl + '/script/all').subscribe({
      next: (scriptDtos: ScriptDto[]) => {
        this.setScripts(this.mapper.mapDtosToScripts(scriptDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania skryptów.');
      }
    });
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
