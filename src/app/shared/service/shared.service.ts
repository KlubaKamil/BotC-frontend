import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { Character, CharacterDto, DialogType, Game, GameDto, Player, PlayerDto, Script, ScriptDto, Place, PlaceDto, GameHeader, ScriptHeader, CharacterHeader, PlayerHeader, Achievement, AchievementHeader, AchievementDto, NotificationType, NotificationMode, DiscordNotification, DiscordRoot, DiscordRootDto, ResponseId, BotcJwtPayload, Group, User } from '../interfaces'
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { HttpClient, HttpEvent, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DtoMapperService } from './dtoMapper.service';
import { DiscordDialogComponent } from '../../discord-dialog/discord-dialog.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { response } from 'express';
import { AuthService } from '../../authservice/auth.service';
import { PhotoDialogComponent } from '../../photo-dialog/photo-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private viewValue : boolean = false;
  private groupValue;
  private detailsView = new BehaviorSubject<boolean>(this.viewValue);
  private group = new BehaviorSubject<Group>(JSON.parse(localStorage.getItem('group')!));

  private users = new BehaviorSubject<User[]>([]);
  private groups = new BehaviorSubject<Group[]>([]);
  private gameHeaders = new BehaviorSubject<GameHeader[]>([]);
  private scriptHeaders = new BehaviorSubject<ScriptHeader[]>([]);
  private characterHeaders = new BehaviorSubject<CharacterHeader[]>([]);
  private playerHeaders = new BehaviorSubject<PlayerHeader[]>([]);
  private achievementHeaders = new BehaviorSubject<AchievementHeader[]>([]);

  private selectedGameHeader = new BehaviorSubject<GameHeader | null>(null);
  private selectedScriptHeader = new BehaviorSubject<ScriptHeader | null>(null);
  private selectedCharacterHeader = new BehaviorSubject<CharacterHeader | null>(null);
  private selectedPlayerHeader = new BehaviorSubject<PlayerHeader | null>(null);
  private selectedAchievementHeader = new BehaviorSubject<AchievementHeader | null>(null);

  private games = new BehaviorSubject<Game[]>([]);
  private scripts = new BehaviorSubject<Script[]>([]);
  private characters = new BehaviorSubject<Character[]>([]);
  private players = new BehaviorSubject<Player[]>([]);
  private places = new BehaviorSubject<Place[]>([]);
  private achievements = new BehaviorSubject<Achievement[]>([]);
  
  private selectedGame = new BehaviorSubject<Game | null>(null);
  private selectedScript = new BehaviorSubject<Script | null>(null);
  private selectedCharacter = new BehaviorSubject<Character | null>(null);
  private selectedPlayer = new BehaviorSubject<Player | null>(null);
  private selectedAchievement = new BehaviorSubject<Achievement | null>(null);

  detailsView$ = this.detailsView.asObservable();
  group$ = this.group.asObservable();

  users$ = this.users.asObservable();
  groups$ = this.groups.asObservable();
  gameHeaders$ = this.gameHeaders.asObservable();
  scriptHeaders$ = this.scriptHeaders.asObservable();
  characterHeaders$ = this.characterHeaders.asObservable();
  playerHeaders$ = this.playerHeaders.asObservable();
  achievementHeaders$ = this.achievementHeaders.asObservable();
  
  selectedGameHeader$ =  this.selectedGameHeader.asObservable();
  selectedScriptHeader$ =  this.selectedScriptHeader.asObservable();
  selectedCharacterHeader$ =  this.selectedCharacterHeader.asObservable();
  selectedPlayerHeader$ =  this.selectedPlayerHeader.asObservable();
  selectedAchievementHeader$ =  this.selectedAchievementHeader.asObservable();

  games$ = this.games.asObservable();
  scripts$ = this.scripts.asObservable();
  characters$ = this.characters.asObservable();
  players$ = this.players.asObservable();
  places$ = this.places.asObservable();
  achievements$ = this.places.asObservable();
  
  selectedGame$ =  this.selectedGame.asObservable();
  selectedScript$ =  this.selectedScript.asObservable();
  selectedCharacter$ =  this.selectedCharacter.asObservable();
  selectedPlayer$ =  this.selectedPlayer.asObservable();
  selectedAchievement$ =  this.selectedAchievement.asObservable();
  
  apiUrl = environment.apiUrl;
  

  constructor(private dialog: MatDialog, private http: HttpClient, private mapper: DtoMapperService, private router: Router, 
    private location: Location){
    this.groupValue = localStorage.getItem('group') ? JSON.parse(localStorage.getItem('group')!) : {id: 1, name: 'Sosnowiec'};
    this.nextGroup(this.groupValue);
    this.group$.subscribe((group) => {
      localStorage.setItem('group', JSON.stringify(group))
      this.groupValue = group;
    })
  }
  
  toggleView(){
    this.viewValue = !this.viewValue
    this.detailsView.next(this.viewValue);
  }

  createNewGroup(name: string){
    this.http.put(`${this.apiUrl}/group/${name}`, null).subscribe({
      next: (result) => {
        this.showDialog(DialogType.INFORMATION, "Pomyślnie utworzono grupę: " + name);
        this.fetchAllGroups();
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, "Coś poszło nie tak podczas tworzenia grupy.")
      }
    });
  }

  nextGroup(group: Group){
    this.selectedGame.next(null);
    this.selectedScript.next(null);
    this.selectedCharacter.next(null);
    this.selectedPlayer.next(null);
    this.selectedAchievement.next(null);
    this.group.next(group)
  }

  async nextGroupByName(groupName: string | null){
    let group = this.groups.getValue().find(g => g.name === groupName);
    if(group){
      this.nextGroup(group);
    } else {
      // this.router.navigate(['/error']);
    }
  }

  nextGroupById(groupId: string){
    if(this.groups.getValue().length === 0){
      this.fetchAllGroups();
    }
    let groups = this.groups.getValue();
    let group = groups.find(g => g.id + '' === groupId);
    if(group){
      this.nextGroup(group);
    } else {
      // this.router.navigate(['/error']);
    }
  }

  navigate(tab: string, id?: any){
    let idToAppend = '';
    let groupToAppend = '';
    if(id){
      idToAppend = `/${id}`;
    }
    if(tab !== 'welcome'){
      groupToAppend = `/${this.groupValue.name}`;
    }
    this.router.navigate([`${tab}${groupToAppend}${idToAppend}`]);
  }

  changeLocation(tab: string, id?: string){
    const idToAppend = id ? `/${id}` : '';
    this.location.go(`/${tab}/${this.groupValue.name}${idToAppend}`)
  }

  memberUser(username: string){
    this.http.post<ResponseId>(`${this.apiUrl}/user/member/${this.groupValue.id}/${username}`, null).subscribe({
      next: (result) => {
        this.showDialog(DialogType.INFORMATION, `Użytkownik ${username} został dodany do grona użytkowników grupy ${this.groupValue.name}.`);
        this.fetchGroupUsers();
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, error.error);
      }
    })
  }

  unmemberUser(username: string){
    this.http.post<ResponseId>(`${this.apiUrl}/user/unmember/${this.groupValue.id}/${username}`, null).subscribe({
      next: (result) => {
        this.showDialog(DialogType.INFORMATION, `Użytkownik ${username} został usunięty z grona członków grupy ${this.groupValue.name}.`);
        this.fetchGroupUsers();
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, `Wystąpił błąd podczas usuwania użytkownika ${username} z grona użytkowników grupy ${this.groupValue.name}`);
      }
    })
  }

  modUser(username: string){
    this.http.post<ResponseId>(`${this.apiUrl}/user/mod/${this.groupValue.id}/${username}`, null).subscribe({
      next: (result) => {
        this.showDialog(DialogType.INFORMATION, `Użytkownik ${username} został dodany do grona moderatorów grupy ${this.groupValue.name}.`);
        this.fetchGroupUsers();
      },
      error: (error) => {        
        this.showDialog(DialogType.INFORMATION, error.error);
      }
    })
  }

  unmodUser(username: string){
    this.http.post<ResponseId>(`${this.apiUrl}/user/unmod/${this.groupValue.id}/${username}`, null).subscribe({
      next: (result) => {
        this.showDialog(DialogType.INFORMATION, `Użytkownik ${username} został zdegradowany z moderatora do członka grupy ${this.groupValue.name}.`);
        this.fetchGroupUsers();
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, `Wystąpił błąd podczas usuwania użytkownika ${username} z moderatorów grupy ${this.groupValue.name}`);
      }
    })
  }

  adminUser(username: string){
    this.http.post<ResponseId>(`${this.apiUrl}/user/admin/${this.groupValue.id}/${username}`, null).subscribe({
      next: (result) => {
        this.showDialog(DialogType.INFORMATION, `Użytkownik ${username} został dodany do grona administratorów grupy ${this.groupValue.name}.`);
        this.fetchGroupUsers();
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, error.error);
      }
    })
  }

  unadminUser(username: string){
    this.http.post<ResponseId>(`${this.apiUrl}/user/unadmin/${this.groupValue.id}/${username}`, null).subscribe({
      next: (result) => {
        this.showDialog(DialogType.INFORMATION, `Użytkownik ${username} został zdegradowany z administratora do członka grupy ${this.groupValue.name}.`);
        this.fetchGroupUsers();
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, `Wystąpił błąd podczas usuwania użytkownika ${username} z administratorów grupy ${this.groupValue.name}`);
      }
    })
  }

  getUsersNotInGroup(): Promise<User[]>{
    return firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/user/notgroup/${this.groupValue.id}`));
  }
  
  getGroupUsers(): Promise<User[]>{
    return firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/user/group/${this.groupValue.id}`));
  }
  
  getGroupMembers(): Promise<User[]>{
    return firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/user/group/${this.groupValue.id}/MEMBER`));
  }
  
  getGroupModerators(): Promise<User[]>{
    return firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/user/group/${this.groupValue.id}/MODERATOR`));
  }

  getGroupAdmins(): Promise<User[]>{
    return firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/user/group/${this.groupValue.id}/GROUP_ADMIN`));
  }

  postEntity(dto: any, type: string, path?: string): Observable<HttpResponse<ResponseId>>{
    let pathToAppend = path ? `/${path}` : ''
    return this.http.post<ResponseId>(`${this.apiUrl}/${type}/${this.groupValue.id}${pathToAppend}`, dto, { observe: 'response', reportProgress: true });
  }
  
  postEntityWithProgress(dto: any, type: string, path?: string): Observable<HttpEvent<ResponseId>>{
    let pathToAppend = path ? `/${path}` : ''
    return this.http.post<ResponseId>(`${this.apiUrl}/${type}/${this.groupValue.id}${pathToAppend}`, dto, 
      { observe: 'events', reportProgress: true });
  }

  putEntity(dto: any, type: string, path?: string): Observable<HttpResponse<ResponseId>>{
    let pathToAppend = path ? `/${path}` : ''
    return this.http.put<ResponseId>(`${this.apiUrl}/${type}/${this.groupValue.id}${pathToAppend}`, dto, { observe: 'response' });
  }
  
  putEntityWithProgress(dto: any, type: string, path?: string): Observable<HttpEvent<ResponseId>>{
    let pathToAppend = path ? `/${path}` : ''
    return this.http.put<ResponseId>(`${this.apiUrl}/${type}/${this.groupValue.id}${pathToAppend}`, dto, 
      { observe: 'events', reportProgress: true });
  }

  postGameImages(formData: FormData, imagesToDelete: string[], gameId: string): Observable<HttpEvent<ResponseId>> {
    // Convert each name to a small text file (binary) and append
    imagesToDelete.forEach(name => {
      const blob = new Blob([name], { type: 'text/plain' });
      const fakeFile = new File([blob], `${name}`, { type: 'text/plain' });
      formData.append('imagesToDelete', fakeFile);
    });

    // Send as multipart/form-data
    return this.http.post<ResponseId>(
      `${this.apiUrl}/game/${this.groupValue.id}/${gameId}/image`,
      formData,
      { observe: 'events', reportProgress: true }
    );
  }


  deleteEntity(id: any, type: string): Observable<HttpResponse<ResponseId>>{
    return this.http.delete<any>(`${this.apiUrl}/${type}/${this.groupValue.id}/${id}`, { observe: 'response' });
  }

  getGroup(): Group{
    return this.groupValue!;
  }

  getGroupId(): number{
    return this.groupValue!.id;
  }

  getGameImages(gameId: string): Promise<string[]> {
    return firstValueFrom(
      this.http.get<string[]>(`${this.apiUrl}/game/${this.groupValue.id}/${gameId}/images`)
    );
  }

  fetchAll(){
    this.fetchGameHeaders();
    this.fetchScriptHeaders();
    this.fetchCharacterHeaders();
    this.fetchPlayerHeaders();
    this.fetchAchievementHeaders();
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

  setAchievements(achievements: Place[]){
    this.achievements.next(achievements);
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

  removeAchievements(id: number){
    const updatedAchievements = this.achievements.getValue()?.filter(achievement => achievement.id !== id);
    this.achievements.next(updatedAchievements!);
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

  setSelectedAchievement(achievement: Achievement){
    this.selectedAchievement.next(achievement);
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

  setAchievementHeaders(achievementHeaders: AchievementHeader[]){
    this.achievementHeaders.next(achievementHeaders)
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

  setSelectedAchievementHeader(achievementHeader: AchievementHeader){
    this.selectedAchievementHeader.next(achievementHeader);
  }

  fetchGroupUsers(){
    this.http.get<User[]>(`${this.apiUrl}/user/group/${this.groupValue.id}`).subscribe({
      next: (users: User[]) => {
        this.users.next(users);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania użytkowników.');
      }
    });
  }
  
  fetchAllGroups(){
    this.http.get<Group[]>(`${this.apiUrl}/group/all`).subscribe({
      next: (groups: Group[]) => {
        this.groups.next(groups);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania grup.');
      }
    });

    return [];
  }

  fetchAllCharacters() {
    this.http.get<CharacterDto[]>(`${this.apiUrl}/character/${this.groupValue.id}/all`).subscribe({
      next: (characterDtos: CharacterDto[]) => {
        this.setCharacters(this.mapper.mapDtosToCharacters(characterDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania postaci.')
      }
    })
  }

  fetchAllPlayers() {
    this.http.get<PlayerDto[]>(`${this.apiUrl}/player/${this.groupValue.id}/all`).subscribe({
      next: (playerDtos: PlayerDto[]) => {
        this.setPlayers(this.mapper.mapDtosToPlayers(playerDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania graczy.');
      }
    })
  }

  getAllPlayers(): Observable<Player[]> {
    return this.http.get<PlayerDto[]>(`${this.apiUrl}/player/${this.groupValue.id}/all`).pipe(
      map((playerDtos: PlayerDto[]) => this.mapper.mapDtosToPlayers(playerDtos)),
      catchError((error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania graczy.');
        return of([]); // return empty array on error
      })
    );
  }

  fetchAllPlaces() {
    this.http.get<PlaceDto[]>(`${this.apiUrl}/place/${this.groupValue.id}/all`).subscribe({
      next: (placeDtos: PlaceDto[]) => {
        this.setPlaces(this.mapper.mapDtosToPlaces(placeDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania miejscówek.');
      }
    })
  }

  fetchAllGames() {
    this.http.get<GameDto[]>(`${this.apiUrl}/game/${this.groupValue.id}/all`).subscribe({
      next: (gameDtos: GameDto[]) => {
        this.setGames(this.mapper.mapDtosToGames(gameDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania gier.');
      }
    });
  }

  fetchAllScripts(){
    this.http.get<ScriptDto[]>(`${this.apiUrl}/script/${this.groupValue.id}/all`).subscribe({
      next: (scriptDtos: ScriptDto[]) => {
        this.setScripts(this.mapper.mapDtosToScripts(scriptDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania skryptów.');
      }
    });
  }

  fetchAllAchievements(){
    this.http.get<AchievementDto[]>(`${this.apiUrl}/achievement/${this.groupValue.id}/all`).subscribe({
      next: (achievementDtos: AchievementDto[]) => {
        this.setAchievements(this.mapper.mapDtosToAchievements(achievementDtos));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania osiągnięć.');
      }
    });
  }

  fetchGameHeaders(){
    this.http.get<GameHeader[]>(`${this.apiUrl}/game/${this.groupValue.id}/headers`).subscribe({
      next: (gameHeaders: GameHeader[]) => {
        this.setGameHeaders(gameHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków gier.');
      }
    });
  }

  fetchScriptHeaders(){
    this.http.get<ScriptHeader[]>(`${this.apiUrl}/script/${this.groupValue.id}/headers`).subscribe({
      next: (scriptHeaders: ScriptHeader[]) => {
        this.setScriptHeaders(scriptHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków skryptów.');
      }
    });
  }

  fetchCharacterHeaders(){
    this.http.get<CharacterHeader[]>(`${this.apiUrl}/character/${this.groupValue.id}/headers`).subscribe({
      next: (characterHeaders: CharacterHeader[]) => {
        this.setCharacterHeaders(characterHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków postaci.');
      }
    });
  }

  fetchPlayerHeaders(){
    this.http.get<PlayerHeader[]>(`${this.apiUrl}/player/${this.groupValue.id}/headers`).subscribe({
      next: (playerHeaders: PlayerHeader[]) => {
        this.setPlayerHeaders(playerHeaders);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków graczy.');
      }
    });
  }
  
  fetchAchievementHeaders(){
    this.http.get<AchievementHeader[]>(`${this.apiUrl}/achievement/${this.groupValue.id}/headers`).subscribe({
      next: (achievementHeader: AchievementHeader[]) => {
        this.setAchievementHeaders(achievementHeader);
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania nagłówków osiągnięć.');
      }
    });
  }

  fetchGameAndSelect(id: string | number){
    this.http.get<GameDto>(`${this.apiUrl}/game/${this.groupValue.id}/${id}`).subscribe({
      next: (gameDto: GameDto) => {
        this.setSelectedGame(this.mapper.mapDtoToGame(gameDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania gry.');
      }
    });
  }

  fetchScriptAndSelect(id: string | number){
    this.http.get<ScriptDto>(`${this.apiUrl}/script/${this.groupValue.id}/${id}`).subscribe({
      next: (scriptDto: ScriptDto) => {
        this.setSelectedScript(this.mapper.mapDtoToScript(scriptDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania skryptu.');
      }
    });
  }

  fetchCharacterAndSelect(id: string | number){
    this.http.get<CharacterDto>(`${this.apiUrl}/character/${this.groupValue.id}/${id}`).subscribe({
      next: (characterDto: CharacterDto) => {
        this.setSelectedCharacter(this.mapper.mapDtoToCharacter(characterDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania postaci.');
      }
    });
  }

  fetchPlayerAndSelect(id: string | number){
    this.http.get<PlayerDto>(`${this.apiUrl}/player/${this.groupValue.id}/${id}`).subscribe({
      next: (playerDto: PlayerDto) => {
        this.setSelectedPlayer(this.mapper.mapDtoToPlayer(playerDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania gracza.');
      }
    });
  }

  fetchAchievementAndSelect(id: string | number){
    this.http.get<AchievementDto>(`${this.apiUrl}/achievement/${this.groupValue.id}/${id}`).subscribe({
      next: (achievementDto: AchievementDto) => {
        this.setSelectedAchievement(this.mapper.mapDtoToAchievement(achievementDto));
      },
      error: (error) => {
        this.showDialog(DialogType.INFORMATION, 'Coś poszlo nie tak w trakcie pobierania osiągnięcia.');
      }
    });
  }

  showDialog(type: DialogType, message: String){
      return this.dialog.open(DialogComponent, {
        data: {
          type: type,
          message: message,
        }
    })
  }

  showDialogWithInfoText(type: DialogType, message: String, info: String){
      return this.dialog.open(DialogComponent, {
        data: {
          type: type,
          message: message,
          info: info
        }
    })
  }

  showSelectionDialog(message: String, options: any[]){
    return this.dialog.open(DialogComponent, {
      data: {
        type: DialogType.SELECTION,
        message: message,
        options: options
      }
    })
  }

  showSelectionDialogWithInfo(message: String, options: any[], info: string){
    return this.dialog.open(DialogComponent, {
      data: {
        type: DialogType.SELECTION,
        message: message,
        options: options,
        info: info
      }
    })
  }

  showNotificationDialog(notificationType: NotificationType, id: number, notificationMode: NotificationMode){
    return this.dialog.open(DiscordDialogComponent, {
      data: {
        id: id,
        notificationType: notificationType, 
        notificationMode: notificationMode
      }
    })
  }

  showPhotoDialog(game: Game, formData?: FormData){
    return this.dialog.open(PhotoDialogComponent, {
      data: {
        game: game,
        formData: formData
      }
    })
  }

  // showPhotoDialog(type: DialogType, message: String, url: String){
  //   return this.dialog.open(DialogComponent, {
  //     data: {
  //       game: game
  //       message: message,
  //       url: url
  //     }
  //   })
  // }

  sendNotification(discordNotification: DiscordNotification){
    this.http.post(this.apiUrl + `/notification`, discordNotification).subscribe({
      next: () => {
        this.showDialog(DialogType.INFORMATION, "Powiadomienie wysłane.")
      },
      error: () => {
        this.showDialog(DialogType.INFORMATION, "Coś poszło nie tak podczas wysyłania powiadomienia.")
      }
    });
  }

  fetchDiscordServers(discordRoot: DiscordRoot){
    this.http.get<DiscordRootDto>(`${this.apiUrl}/notification`).subscribe({
      next: (response) => {
        let mappedResponse = this.mapper.mapDtoToDiscordRoot(response);
        discordRoot.servers = mappedResponse.servers;
        discordRoot!.servers.forEach(s => {
          if(!discordRoot!.expandedServers) discordRoot!.expandedServers = {};
          discordRoot!.expandedServers[s.id] = true;
          s.channels.forEach(c => {
            if(!s.expandedChannels) s.expandedChannels = {};
            s.expandedChannels[c.id] = true;
          })
        })
      },
      error: () => {
        this.showDialog(DialogType.INFORMATION, "Coś poszło nie tak podczas pobierania serwerów.")
      }
    })
  }
}
