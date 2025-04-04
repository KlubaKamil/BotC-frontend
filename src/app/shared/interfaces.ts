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
  gamesNumber: number,
  goodPercentage: number,
  winRatio: number
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
  characters: CharacterDto[];
  scriptDetails?: ScriptDetails;
}

export interface ScriptDetails{
  gamesNumber: number,
  choicePercentage: number,
  scriptCharactersDetails: ScriptCharacterDetails[];
}

export interface ScriptCharacterDetails{
  characterId: number,
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
  characterDetails?: CharacterDetails;
}

export interface CharacterDetails {
  gamesNumber: number;
  wonGamesNumber: number;
  winRatio: number;
  characterInScriptsDetails: CharacterInScriptDetails[];
}

export interface CharacterInScriptDetails {
  scriptName: string;
  gamesNumber: number;
  wonGamesNumber: number;
  winRatio: number;
}

export interface PlayerDto{
  id?: number;
  name: string;
  playerDetails?: PlayerDetails
}

export interface PlayerDetails {
  playerCharactersDetails: PlayerCharacterDetails[];
  playerScriptsDetails: PlayerScriptDetails[];
}

export interface PlayerCharacterDetails{
  characterName: string,
  gamesNumber: number,
  wonGamesNumber: number,
  winRatio: number
}

export interface PlayerScriptDetails{
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
}

export class Script {
  id?: number;
  name?: String;
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
  characterDetails?: CharacterDetails;
}

export class Player{
  id?: number; 
  name?: string;
  gamesNumber?: number;
  goodPercentage?: number;
  winRatio?: number;
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

export enum DialogType {
  CONFIRMATION,
  INFORMATION
}

export interface ResponseId {
  id: number;
}