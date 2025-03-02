export enum Alignment {
  TOWNSFOLK = 'Townsfolk',
  OUTSIDER = 'Outsider',
  MINION = 'Minion',
  DEMON = 'Demon',
  TRAVELLER = 'Traveller',
  FABLED = 'Fabled'
}

export interface CharacterDto {
  id?: number;
  name: string;
  alignment: Alignment;
  description: String;
  linkToWiki?: String;
}

export interface GameDto {
  id?: number;
  script: ScriptDto;
  storyteller: PlayerDto;
  fabled?: CharacterDto;
  assignments: AssignmentDto[];
  goodWon: boolean;
  date?: string;
  place?: string;
  notes?: string;
}

export interface AssignmentDto {
  player: PlayerDto;
  character: CharacterDto;
  good: boolean;
}

export interface ScriptDto{
  id?: number;
  name: String;
  characters: CharacterDto[];
}

export interface PlayerDto{
  id?: number;
  name: string;
}

export class Character {
  id?: number;
  name?: string;
  alignment?: Alignment;
  description?: String;
  linkToWiki?: String;
}

export class Game {
  id?: number;
  script?: Script;
  storyteller?: Player;
  fabled?: Character | undefined | null;
  assignments?: Assignment[];
  goodWon?: boolean;
  date?: string;
  place?: string;
  notes?: string;
}

export class Script {
  id?: number;
  name?: String;
  characters?: Character[];
  timesPlayed?: number;
}

export class Player{
  id?: number; 
  name?: string;
  gamesNumber?: number;
  goodPercentage?: number;
  winRatio?: number;
}

export class Assignment {
  player?: Player;
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