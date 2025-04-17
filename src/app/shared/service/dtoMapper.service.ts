import { Injectable } from "@angular/core";
import { Assignment, AssignmentDto, Character, CharacterDto, Game, GameDto, Place, PlaceDto, Player, PlayerDto, Script, ScriptDto, Transformation, TransformationDto } from "../interfaces";

@Injectable({
  providedIn: 'root'
})
export class DtoMapperService {
    mapCharacterToDto(model: Character): CharacterDto {
        return {
            id: model.id,
            name: model.name!,
            maxStartNumber: model.maxStartNumber!,
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
            maxStartNumber: dto.maxStartNumber,
            alignment: dto.alignment,
            description: dto.description,
            linkToWiki: dto.linkToWiki,
            characterDetails: dto.characterDetails
        };
    }
      
    mapDtosToCharacters(dtos: CharacterDto[]): Character[] {
        return dtos.map(dto => this.mapDtoToCharacter(dto));
    }

    
    mapScriptToDto(model: Script): ScriptDto {
        return {
            id: model.id,
            name: model.name!,
            notes: model.notes,
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
            notes: dto.notes,
            characters: this.mapDtosToCharacters(dto.characters),
            scriptDetails: dto.scriptDetails
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
            name: dto.name,
            playerDetails: dto.playerDetails
        };
    }
    
    mapDtosToPlayers(dtos: PlayerDto[]): Player[] {
        return dtos.map(dto => this.mapDtoToPlayer(dto));
    }

    mapPlaceToDto(model: Place): PlaceDto {
        return {
            id: model.id,
            name: model.name!
        };
    }
    
    mapPlacesToDtos(models: Place[]): PlaceDto[] {
        return models.map(model => this.mapPlaceToDto(model));
    }
    

    mapDtoToPlace(dto: PlaceDto): Place {
        return {
            id: dto.id,
            name: dto.name
        };
    }
    
    mapDtosToPlaces(dtos: PlaceDto[]): Place[] {
        return dtos.map(dto => this.mapDtoToPlace(dto));
    }
    
    

    mapAssignmentToDto(model: Assignment): AssignmentDto {
        return {
            player: this.mapPlayerToDto(model.player!),
            character: this.mapCharacterToDto(model.character!),
            index: model.index!,
            good: model.good!,
            transformations: model.transformations ? this.mapTransformationsToDtos(model.transformations!) : []
        };
    }
    
    mapAssignmentsToDtos(models: Assignment[]): AssignmentDto[] {
        return models.map(model => this.mapAssignmentToDto(model));
    }

    mapDtoToAssignment(dto: AssignmentDto): Assignment {
        return {
            player: this.mapDtoToPlayer(dto.player),
            character: this.mapDtoToCharacter(dto.character),
            index: dto.index,
            good: dto.good,
            transformations: dto.transformations ? this.mapDtosToTransformations(dto.transformations) : undefined
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
            fabled: model.fabled ? this.mapCharacterToDto(model.fabled!) : undefined,
            assignments: this.mapAssignmentsToDtos(model.assignments!),
            goodWon: model.goodWon!,
            date: model.date,
            notes: model.notes,
            place: model.place ? this.mapPlaceToDto(model.place) : undefined
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
            notes: dto.notes,
            place: dto.place ? this.mapDtoToPlace(dto.place) : undefined
        };
    }
    
    mapDtosToGames(dtos: GameDto[]): Game[] {
        return dtos.map(dto => this.mapDtoToGame(dto));
    }

    

    mapTransformationToDto(model: Transformation): TransformationDto {
        return {
            character: this.mapCharacterToDto(model.character!),
            good: model.good!
        };
    }
    
    mapTransformationsToDtos(models: Transformation[]): TransformationDto[] {
        return models.map(model => this.mapTransformationToDto(model));
    }
    
    mapDtoToTransformation(dto: TransformationDto): Transformation {
        return {
            character: this.mapDtoToCharacter(dto.character),
            good: dto.good
        };
    }
    
    mapDtosToTransformations(dtos: TransformationDto[]): Transformation[] {
        return dtos.map(dto => this.mapDtoToTransformation(dto));
    }
}