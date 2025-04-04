import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Character } from '../shared/interfaces';
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';

@Component({
  selector: 'app-characters',
  imports: [CommonModule, MatButtonModule, TableModule],
  standalone: true,
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent {
  characterHeaders: Character[] | null = null;

  constructor(private sharedService: SharedService){}

  ngOnInit() {
    this.sharedService.characterHeaders$.subscribe((characterHeaders) => {
      this.characterHeaders = characterHeaders;
    });
  }

  selectCharacter(event: TableRowSelectEvent){
    let characterHeader = event.data;
    let id = characterHeader.id;
    this.sharedService.fetchCharacterAndSelect(id);
    this.sharedService.setSelectedCharacterHeader(characterHeader);
  }
}
