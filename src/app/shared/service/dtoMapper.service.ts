import { Injectable } from "@angular/core";
import { Assignment, AssignmentDto, Character, CharacterDto, Game, GameDto, Player, PlayerDto, Script, ScriptDto } from "../interfaces";

@Injectable({
  providedIn: 'root'
})
export class DtoMapperService {
    mapCharacterToDto(model: Character): CharacterDto {
        return {
            id: model.id,
            name: model.name!,
            alignment: model.alignment!,
            description: model.description!,
            linkToWiki: model.linkToWiki
        };
    }

    mapCharactersToDtos(models: Character[]): CharacterDto[] {
        return models.map(model => this.mapCharacterToDto(model));
    }

    mapDtoToCharacter(dto: CharacterDto): Character {
        return {
            id: dto.id,
            name: dto.name,
            alignment: dto.alignment,
            description: dto.description,
            linkToWiki: dto.linkToWiki
        };
    }
      
    mapDtosToCharacters(dtos: CharacterDto[]): Character[] {
        return dtos.map(dto => this.mapDtoToCharacter(dto));
    }

    
    mapScriptToDto(model: Script): ScriptDto {
        return {
            id: model.id,
            name: model.name!,
            characters: this.mapCharactersToDtos(model.characters!)
        };
    }

    mapScriptsToDtos(models: Script[]): ScriptDto[] {
        return models.map(model => this.mapScriptToDto(model));
    }

    mapDtoToScript(dto: ScriptDto): Script {
        return {
            id: dto.id,
            name: dto.name,
            characters: this.mapDtosToCharacters(dto.characters),
            timesPlayed: 0 // Default value, update as needed
        };
    }
    
    mapDtosToScripts(dtos: ScriptDto[]): Script[] {
        return dtos.map(dto => this.mapDtoToScript(dto));
    }
    

    mapPlayerToDto(model: Player): PlayerDto {
        return {
            id: model.id,
            name: model.name!
        };
    }
    
    mapPlayersToDtos(models: Player[]): PlayerDto[] {
        return models.map(model => this.mapPlayerToDto(model));
    }
    

    mapDtoToPlayer(dto: PlayerDto): Player {
        return {
            id: dto.id,
            name: dto.name
        };
    }
    
    mapDtosToPlayers(dtos: PlayerDto[]): Player[] {
        return dtos.map(dto => this.mapDtoToPlayer(dto));
    }
    

    mapAssignmentToDto(model: Assignment): AssignmentDto {
        return {
            player: this.mapPlayerToDto(model.player!),
            character: this.mapCharacterToDto(model.character!),
            good: model.good!
        };
    }
    
    mapAssignmentsToDtos(models: Assignment[]): AssignmentDto[] {
        return models.map(model => this.mapAssignmentToDto(model));
    }

    mapDtoToAssignment(dto: AssignmentDto): Assignment {
        return {
            player: this.mapDtoToPlayer(dto.player),
            character: this.mapDtoToCharacter(dto.character),
            good: dto.good
        };
    }
    
    mapDtoToAssignments(dtos: AssignmentDto[]): Assignment[] {
        return dtos.map(dto => this.mapDtoToAssignment(dto));
    }

    
    mapGameToDto(model: Game): GameDto {
        return {
            id: model.id,
            script: this.mapScriptToDto(model.script!),
            storyteller: this.mapPlayerToDto(model.storyteller!),
            fabled: this.mapCharacterToDto(model.fabled!),
            assignments: this.mapAssignmentsToDtos(model.assignments!),
            goodWon: model.goodWon!,
            date: model.date,
            notes: model.notes
        };
    }
    
    mapGamesToDtos(models: Game[]): GameDto[] {
        return models.map(model => this.mapGameToDto(model));
    }
    
    mapDtoToGame(dto: GameDto): Game {
        return {
            id: dto.id,
            script: this.mapDtoToScript(dto.script),
            storyteller: this.mapDtoToPlayer(dto.storyteller),
            fabled: dto.fabled ? this.mapDtoToCharacter(dto.fabled) : null,
            assignments: this.mapDtoToAssignments(dto.assignments),
            goodWon: dto.goodWon,
            date: dto.date,
            notes: dto.notes
        };
    }
    
    mapDtosToGames(dtos: GameDto[]): Game[] {
        return dtos.map(dto => this.mapDtoToGame(dto));
    }
}