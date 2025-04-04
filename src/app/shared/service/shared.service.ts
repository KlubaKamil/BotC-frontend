import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Character, CharacterDto, DialogType, Game, GameDto, Player, PlayerDto, Script, ScriptDto, Place, PlaceDto, GameHeader, ScriptHeader, CharacterHeader, PlayerHeader } from '../interfaces'
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DtoMapperService } from './dtoMapper.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private gameHeaders = new BehaviorSubject<GameHeader[] | null>(null);
  private scriptHeaders = new BehaviorSubject<ScriptHeader[] | null>(null);
  private characterHeaders = new BehaviorSubject<CharacterHeader[] | null>(null);
  private playerHeaders = new BehaviorSubject<PlayerHeader[] | null>(null);
  
  private selectedGameHeader = new BehaviorSubject<GameHeader | null>(null);
  private selectedScriptHeader = new BehaviorSubject<ScriptHeader | null>(null);
  private selectedCharacterHeader = new BehaviorSubject<CharacterHeader | null>(null);
  private selectedPlayerHeader = new BehaviorSubject<PlayerHeader | null>(null);

  private games = new BehaviorSubject<Game[] | null>(null);
  private scripts = new BehaviorSubject<Script[] | null>(null);
  private characters = new BehaviorSubject<Character[] | null>(null);
  private players = new BehaviorSubject<Player[] | null>(null);
  private places = new BehaviorSubject<Place[] | null>(null);
  
  private selectedGame = new BehaviorSubject<Game | null>(null);
  private selectedScript = new BehaviorSubject<Script | null>(null);
  private selectedCharacter = new BehaviorSubject<Character | null>(null);
  private selectedPlayer = new BehaviorSubject<Player | null>(null);

  gameHeaders$ = this.gameHeaders.asObservable();
  scriptHeaders$ = this.scriptHeaders.asObservable();
  characterHeaders$ = this.characterHeaders.asObservable();
  playerHeaders$ = this.playerHeaders.asObservable();
  
  selectedGameHeader$ =  this.selectedGameHeader.asObservable();
  selectedScriptHeader$ =  this.selectedScriptHeader.asObservable();
  selectedCharacterHeader$ =  this.selectedCharacterHeader.asObservable();
  selectedPlayerHeader$ =  this.selectedPlayerHeader.asObservable();

  games$ = this.games.asObservable();
  scripts$ = this.scripts.asObservable();
  characters$ = this.characters.asObservable();
  players$ = this.players.asObservable();
  places$ = this.places.asObservable();
  
  selectedGame$ =  this.selectedGame.asObservable();
  selectedScript$ =  this.selectedScript.asObservable();
  selectedCharacter$ =  this.selectedCharacter.asObservable();
  selectedPlayer$ =  this.selectedPlayer.asObservable();
  
  apiUrl = environment.apiUrl;
  

  constructor(private dialog: MatDialog, private http: HttpClient, private mapper: DtoMapperService){
  }

  fetchAll(){
    this.fetchGameHeaders();
    this.fetchScriptHeaders();
    this.fetchCharacterHeaders();
    this.fetchPlayerHeaders();
  }

  setGames(games: Game[]){
    this.games.next(games);
  }

  setScripts(scripts: Script[]){
    this.scripts.next(scripts);
  }

  setCharacters(characters: Character[]){
    this.characters.next(characters);
  }

  setPlayers(players: Player[]){
    this.players.next(players);
  }

  setPlaces(places: Place[]){
    this.places.next(places);
  }

  removeGame(id: number){
    const updateGames = this.games.getValue()?.filter(game => game.id !== id);
    this.games.next(updateGames!);
  }
  
  removeScript(id: number){
    const updatedScripts = this.scripts.getValue()?.filter(script => script.id !== id);
    this.scripts.next(updatedScripts!);
  }

  removeCharacter(id: number){
    const updatedCharacters = this.characters.getValue()?.filter(character => character.id !== id);
    this.characters.next(updatedCharacters!);
  }

  removePlayer(id: number){
    const updatedPlayers = this.players.getValue()?.filter(player => player.id !== id);
    this.players.next(updatedPlayers!);
  }

  removePlace(id: number){
    const updatedPlaces = this.places.getValue()?.filter(place => place.id !== id);
    this.places.next(updatedPlaces!);
  }

  setSelectedGame(game: Game){
    this.selectedGame.next(game);
  }

  setSelectedScript(script: Script){
    this.selectedScript.next(script);
  }

  setSelectedCharacter(character: Character){
    this.selectedCharacter.next(character);
  }

  setSelectedPlayer(player: Player){
    this.selectedPlayer.next(player);
  }

  setGameHeaders(gameHeaders: GameHeader[]){
    this.gameHeaders.next(gameHeaders)
  }

  setScriptHeaders(scriptHeaders: ScriptHeader[]){
    this.scriptHeaders.next(scriptHeaders)
  }

  setCharacterHeaders(characterHeaders: CharacterHeader[]){
    this.characterHeaders.next(characterHeaders)
  }

  setPlayerHeaders(playerHeaders: PlayerHeader[]){
    this.playerHeaders.next(playerHeaders)
  }

  setSelectedGameHeader(gameHeader: GameHeader){
    this.selectedGameHeader.next(gameHeader);
  }

  setSelectedScriptHeader(scriptHeader: ScriptHeader){
    this.selectedScriptHeader.next(scriptHeader);
  }

  setSelectedCharacterHeader(characterHeader: CharacterHeader){
    this.selectedCharacterHeader.next(characterHeader);
  }

  setSelectedPlayerHeader(playerHeader: PlayerHeader){
    this.selectedPlayerHeader.next(playerHeader);
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

  fetchAllPlaces() {
    this.http.get<PlaceDto[]>(this.apiUrl + '/place/all').subscribe({
      next: (placeDtos: PlaceDto[]) => {
        this.setPlaces(this.mapper.mapDtosToPlaces(placeDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania miejscówek.');
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

  fetchGameHeaders(){
    this.http.get<GameHeader[]>(this.apiUrl + '/game/headers').subscribe({
      next: (gameHeaders: GameHeader[]) => {
        this.setGameHeaders(gameHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków gier.');
      }
    });
  }

  fetchScriptHeaders(){
    this.http.get<ScriptHeader[]>(this.apiUrl + '/script/headers').subscribe({
      next: (scriptHeaders: ScriptHeader[]) => {
        this.setScriptHeaders(scriptHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków skryptów.');
      }
    });
  }

  fetchCharacterHeaders(){
    this.http.get<CharacterHeader[]>(this.apiUrl + '/character/headers').subscribe({
      next: (characterHeaders: CharacterHeader[]) => {
        this.setCharacterHeaders(characterHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków postaci.');
      }
    });
  }

  fetchPlayerHeaders(){
    this.http.get<PlayerHeader[]>(this.apiUrl + '/player/headers').subscribe({
      next: (playerHeaders: PlayerHeader[]) => {
        this.setPlayerHeaders(playerHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków graczy.');
      }
    });
  }

  fetchGameAndSelect(id: number){
    this.http.get<GameDto>(this.apiUrl + '/game/' + id).subscribe({
      next: (gameDto: GameDto) => {
        this.setSelectedGame(this.mapper.mapDtoToGame(gameDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania gry.');
      }
    });
  }

  fetchScriptAndSelect(id: number){
    this.http.get<ScriptDto>(this.apiUrl + '/script/' + id).subscribe({
      next: (scriptDto: ScriptDto) => {
        this.setSelectedScript(this.mapper.mapDtoToScript(scriptDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania skryptu.');
      }
    });
  }

  fetchCharacterAndSelect(id: number){
    this.http.get<CharacterDto>(this.apiUrl + '/character/' + id).subscribe({
      next: (characterDto: CharacterDto) => {
        this.setSelectedCharacter(this.mapper.mapDtoToCharacter(characterDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania postaci.');
      }
    });
  }

  fetchPlayerAndSelect(id: number){
    this.http.get<PlayerDto>(this.apiUrl + '/player/' + id).subscribe({
      next: (playerDto: PlayerDto) => {
        this.setSelectedPlayer(this.mapper.mapDtoToPlayer(playerDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania gracza.');
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
