export enum Alignment {
  TOWNSFOLK = 'Townsfolk',
  OUTSIDER = 'Outsider',
  MINION = 'Minion',
  DEMON = 'Demon',
  TRAVELLER = 'Traveller',
  FABLE = 'Fable'
}

export interface Character {
  id: number;
  name: string;
  alignment: Alignment;
  good: boolean;
  description: String;
  linkToWiki: String;
}

export interface Assignment {
  player: Player;
  character: Character;
}

export interface Game {
  id: number;
  script: Script;
  storyteller: Player;
  assignments: Assignment[];
  goodWon: boolean;
  date: string;
}

export interface Script{
  id: number;
  name: String;
  characters: Character[];
  timesPlayed: number;
}

export interface Player{
  id: number; 
  name: string;
  gamesNumber: number;
  goodPercentage: number;
  winRatio: number;
}

export enum DialogType {
  CONFIRMATION,
  INFORMATION
}