import { Injectable } from "@angular/core";
import { Achievement, AchievementDto, Assignment, AssignmentDto, Character, CharacterDto, Game, GameDto, Place, PlaceDto, Player, PlayerAchievement, PlayerAchievementDto, PlayerDto, Script, ScriptDto, Transformation, TransformationDto } from "../interfaces";
import { dt } from "@primeng/themes";

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
            linkToWiki: model.linkToWiki,
            tips: model.tips
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
            tips: dto.tips,
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
            author: model.author,
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
            author: dto.author,
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
            name: model.name!,
            discordName: model.discordName,
            playerAchievements: model.playerAchievements ? this.mapPlayerAchievementToDtos(model.playerAchievements) : []
        };
    }
    
    mapPlayersToDtos(models: Player[]): PlayerDto[] {
        return models.map(model => this.mapPlayerToDto(model));
    }
    

    mapDtoToPlayer(dto: PlayerDto): Player {
        return {
            id: dto.id,
            name: dto.name,
            discordName: dto.discordName,
            playerAchievements: dto.playerAchievements ? this.mapDtosToPlayerAchievements(dto.playerAchievements) : [],
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
            place: model.place ? this.mapPlaceToDto(model.place) : undefined,
            imageUrl: model.imageUrl,
            balanceMarks: model.balanceMarks
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
            place: dto.place ? this.mapDtoToPlace(dto.place) : undefined,
            imageUrl: dto.imageUrl,
            balanceMarks: dto.balanceMarks ? dto.balanceMarks : []
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


    
    mapAchievementToDto(model: Achievement): AchievementDto {
        return {
            id: model.id,
            name: model.name!,
            description: model.description!,
        };
    }
    
    mapAchievementsToDtos(models: Achievement[]): AchievementDto[] {
        return models.map(model => this.mapAchievementToDto(model));
    }
    
    mapDtoToAchievement(dto: AchievementDto): Achievement {
        return {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            achievementDetails: dto.achievementDetails
        };
    }
    
    mapDtosToAchievements(dtos: AchievementDto[]): Achievement[] {
        return dtos.map(dto => this.mapDtoToAchievement(dto));
    }



    mapPlayerAchievementToDto(model: PlayerAchievement): PlayerAchievementDto {
        return {
            id: model.id,
            achievement: this.mapAchievementToDto(model.achievement!),
            date: model.date
        };
    }
    
    mapPlayerAchievementToDtos(models: PlayerAchievement[]): PlayerAchievementDto[] {
        return models.map(model => this.mapPlayerAchievementToDto(model));
    }
    
    mapDtoToPlayerAchievement(dto: PlayerAchievementDto): PlayerAchievement {
        return {
            id: dto.id,
            achievement: this.mapDtoToAchievement(dto.achievement),
            date: dto.date
        };
    }
    
    mapDtosToPlayerAchievements(dtos: PlayerAchievementDto[]): PlayerAchievement[] {
        return dtos.map(dto => this.mapDtoToPlayerAchievement(dto));
    }
}