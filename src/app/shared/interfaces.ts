export enum Alignment {
  TOWNSFOLK = 'Townsfolk',
  OUTSIDER = 'Outsider',
  MINION = 'Minion',
  DEMON = 'Demon',
  TRAVELLER = 'Traveller',
  FABLED = 'Fabled'
}

export interface GameHeader{
  id: number,
  scriptName: string,
  storytellerName: string,
  playersNumber: number,
  goodWon: boolean,
  date: Date
}

export interface ScriptHeader{
  id: number,
  scriptName: string,
  gamesNumber: number
}

export interface CharacterHeader{
  id: number;
  name: string;
  maxStartNumber: number;
  alignment: Alignment;
  description: String;
  linkToWiki: String;
}

export interface PlayerHeader{
  id: number,
  name: string,
  discordName?: String
  gamesNumber: number,
  goodPercentage: number,
  winRatio: number
}

export interface AchievementHeader{
  id: number,
  name: string,
  description: string
}

export interface GameDto {
  id?: number;
  script: ScriptDto;
  storyteller: PlayerDto;
  fabled?: CharacterDto;
  assignments: AssignmentDto[];
  goodWon: boolean;
  date?: Date;
  notes?: string;
  place?: PlaceDto;
  imageUrl?: String;
  balanceMarks?: number[];
}

export interface AssignmentDto {
  player: PlayerDto;
  character: CharacterDto;
  index: number;
  good: boolean;
  transformations: TransformationDto[]
}

export interface ScriptDto{
  id?: number;
  name: String;
  author?: String;
  notes?: String;
  characters: CharacterDto[];
  scriptDetails?: ScriptDetails;
}

export interface ScriptDetails{
  gamesNumber: number,
  choicePercentage: number,
  scriptCharactersDetails: ScriptCharacterDetails[];
}

export interface ScriptCharacterDetails{
  id: number,
  name: String,
  gamesNumber: number,
  occurrencePercentage: number,
  wonGamesNumber: number,
  winRatio: number
}

export interface CharacterDto {
  id?: number;
  name: string;
  maxStartNumber: number;
  alignment: Alignment;
  description: String;
  linkToWiki?: String;
  tips?: String;
  characterDetails?: CharacterDetails;
}

export interface CharacterDetails {
  gamesNumber: number;
  wonGamesNumber: number;
  winRatio: number;
  characterInScriptsDetails: CharacterInScriptDetails[];
}

export interface CharacterInScriptDetails {
  scriptId: number,
  scriptName: string;
  gamesNumber: number;
  wonGamesNumber: number;
  winRatio: number;
}

export interface PlayerDto{
  id?: number;
  name: string;
  discordName?: string;
  playerAchievements?: PlayerAchievementDto[],
  playerDetails?: PlayerDetails
}

export interface PlayerDetails {
  gamesNumber?: number;
  goodPercentage?: number;
  winRatio?: number;
  playerCharactersDetails: PlayerCharacterDetails[];
  playerScriptsDetails: PlayerScriptDetails[];
}

export interface PlayerCharacterDetails{
  characterId: number,
  characterName: string,
  gamesNumber: number,
  wonGamesNumber: number,
  winRatio: number
}

export interface PlayerScriptDetails{
  scriptId: number,
  scriptName: string,
  gamesNumber: number,
  wonGamesNumber: number,
  winRatio: number
}

export interface PlaceDto{
  id?: number;
  name: string;
}

export interface TransformationDto{
  character: CharacterDto;
  good: boolean;
}

export interface PlayerAchievementDto {
  id?: number;
  achievement: AchievementDto;
  date?: Date;
}

export interface AchievementDto {
  id?: number;
  name: string;
  description: string;
  date?: Date;
  achievementDetails?: AchievementDetails
}

export interface AchievementDetails {
  accomplishmentNumber: number;
  achievementPlayerDetails: AchievementPlayerDetails[];
}

export interface AchievementPlayerDetails{
  id: number;
  name: String;
  date: Date;
}

export class Game {
  id?: number;
  script?: Script;
  storyteller?: Player;
  fabled?: Character | undefined | null;
  assignments?: Assignment[];
  goodWon?: boolean;
  date?: Date;
  notes?: string;
  place?: Place;
  imageUrl?: String;
  balanceMarks?: number[];
}

export class Script {
  id?: number;
  name?: String;
  author?: String;
  notes?: String;
  characters?: Character[];
  scriptDetails?: ScriptDetails
}

export class Character {
  id?: number;
  name?: string;
  maxStartNumber?: number;
  alignment?: Alignment;
  description?: String;
  linkToWiki?: String;
  tips?: String;
  characterDetails?: CharacterDetails;
}

export class Player{
  id?: number; 
  name?: string;
  discordName?: string;
  playerAchievements?: PlayerAchievement[];
  playerDetails?: PlayerDetails
}

export class Place{
  id?: number; 
  name?: string;
}

export class Assignment {
  player?: Player;
  character?: Character;
  index?: number;
  good?: boolean;
  transformations?: Transformation[];
}

export class Transformation {
  character?: Character;
  good?: boolean;
}

export class Achievement {
  id?: number;
  name?: string;
  description?: string;
  achievementDetails?: AchievementDetails;
}

export class PlayerAchievement {
  id?: number;
  achievement?: Achievement;
  date?: Date;
}

export enum DialogType {
  CONFIRMATION,
  INFORMATION,
  INFORMATION_DISCORD,
  INSERTION,
  PASSWORD,
  PHOTOGRAPHY
}

export enum NotificationType {
  GAME = "GAME",
  SCRIPT = "SCRIPT",
  CHARACTER = "CHARACTER",
  PLAYER = "PLAYER",
  ACHIEVEMENT = "ACHIEVEMENT"
}

export interface ResponseId {
  id: number;
}

interface JwtPayload {
  exp: number;
  iat?: number;
  [key: string]: any;
}