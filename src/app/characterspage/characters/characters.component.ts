import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CharacterHeader } from '../../shared/interfaces';
import { SharedService } from '../../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-characters',
  imports: [CommonModule, MatButtonModule, TableModule],
  standalone: true,
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent {
  characterHeaders: CharacterHeader[] | null = null;

  constructor(private sharedService: SharedService, private route: ActivatedRoute){}

  ngOnInit() {
    this.sharedService.characterHeaders$.subscribe((characterHeaders) => {
      this.characterHeaders = characterHeaders;
    });
    this.route.params.subscribe((params) => {
      this.sharedService.fetchCharacterHeaders();
    });
  }

  selectCharacter(event: TableRowSelectEvent){
    let characterHeader = event.data;
    let id = characterHeader.id;
    this.sharedService.toggleView();
    this.sharedService.navigate('characters', id);
  }
}
