import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Character } from '../shared/interfaces';
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-characters',
  imports: [CommonModule, MatButtonModule],
  standalone: true,
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent {
  characters: Character[] | null = null;

  constructor(private sharedService: SharedService){}

  ngOnInit() {
    this.sharedService.characters$.subscribe((characters) => {
      this.characters = characters;
    });
  }

  selectCharacter(character: Character){
    this.sharedService.setSelectedCharacter(character);
  }
}
