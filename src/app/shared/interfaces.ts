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
  discordName?: String,
  storytellerGamesNumber: number,
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
  storytellers: PlayerDto[];
  fables: CharacterDto[];
  assignments: AssignmentDto[];
  goodWon: boolean;
  date?: Date;
  notes?: string;
  place?: PlaceDto;
  imageUploaded?: boolean;
  balanceMarks?: BalanceMarkDto[];
}

export interface BalanceMarkDto {
  mark: number;
  username: string;
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
  scriptCharacters?: ScriptCharacterDto[];
  scriptDetails?: ScriptDetails;
}

export interface ScriptCharacterDto {
  character?: CharacterDto;
  characterOrder?: number;
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
  imageUploaded?: boolean;
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
  storytellerGamesNumber?: number;
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
  type: TransformationType;
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
  storytellers?: Player[];
  fables?: Character[];
  assignments?: Assignment[];
  goodWon?: boolean;
  date?: Date;
  notes?: string;
  place?: Place;
  imageUploaded?: boolean;
  balanceMarks?: BalanceMark[];
}

export class BalanceMark {
  mark?: number;
  username?: string;
}

export class Script {
  id?: number;
  name?: String;
  author?: String;
  notes?: String;
  scriptCharacters?: ScriptCharacter[];
  scriptDetails?: ScriptDetails
}

export class ScriptCharacter {
  character?: Character;
  characterOrder?: number;
}

export class Character {
  id?: number;
  name?: string;
  maxStartNumber?: number;
  alignment?: Alignment;
  description?: String;
  linkToWiki?: String;
  tips?: String;
  imageUploaded?: boolean;
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
  type?: TransformationType;
}

export enum TransformationType {
  BECOME = "Stał się",
  GOT_ABILITY = "Zdobył zdolność",
  THOUGHT_THAT_WAS = "Myślał, że był"
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

export interface ResponseId {
  id: number;
}

export interface JwtPayload {
  exp: number;
  iat?: number;
  [key: string]: any;
}

export enum DialogType {
  CONFIRMATION,
  INFORMATION,
  INFORMATION_DISCORD,
  INSERTION,
  PASSWORD,
  PHOTOGRAPHY,
  SELECTION
}

export enum NotificationType {
  GAME = "GAME",
  SCRIPT = "SCRIPT",
  CHARACTER = "CHARACTER",
  PLAYER = "PLAYER",
  ACHIEVEMENT = "ACHIEVEMENT"
}

export enum NotificationMode {
  NEW = "NEW",
  UPDATE = "UPDATE"
}

export enum DiscordChannelType {
  FORUM = "FORUM",
  TEXT = "TEXT",
  GUILD_PUBLIC_THREAD = "GUILD_PUBLIC_THREAD"
}

export class DiscordNotification{
  id?: number;
  notificationType?: NotificationType;
  notificationMode?: NotificationMode
  channelsToNotify?: DiscordNotifiedChannel[];
}

export class DiscordNotifiedChannel {
  id ?: string;
  channelType ?: DiscordChannelType;
}

export interface DiscordRootDto {
  servers: DiscordServerDto[];
}

export interface DiscordServerDto {
  id: string;
  name: string;
  channels: DiscordChannelDto[];
}

export interface DiscordChannelDto {
  id: string;
  name: string;
  channelType: DiscordChannelType;
  threads: DiscordThreadDto[];
}

export interface DiscordThreadDto {
  id: string;
  name: string;
  channelType: DiscordChannelType;
}

export interface DiscordRoot {
  servers: DiscordServer[];
  expandedServers: { [key: string]: boolean } 
}

export interface DiscordServer {
  id: string,
  name: string,
  channels: DiscordChannel[]
  expandedChannels: { [key: string]: boolean }
  selectedRow: any;
}

export interface DiscordChannel {
  id: string,
  name: string
  channelType: DiscordChannelType,
  threads: DiscordThread[]
}

export interface DiscordThread {
  id: string,
  name: string
  channelType: DiscordChannelType;
}

export interface BotcJwtPayload extends JwtPayload {
  sub: string;
  groupRoles: GroupRole[];
}

export interface GroupRole {
  group: Group;
  role: Role;
}

export interface Group {
  id: number;
  name: string;
}

export enum Role {
  MEMBER = "Członek",
  MODERATOR = "Moderator",
  GROUP_ADMIN = "Admin",
  GLOBAL_ADMIN = "Admin globalny"
}

export interface User {
  id: number,
  name: string,
  groupRoles: GroupRole[]
}

export interface JwtRequest {
  username: string,
  password: string
}