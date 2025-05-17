import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CharacterHeader } from '../../shared/interfaces';
import { SharedService } from '../../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { Router } from '@angular/router';


@Component({
  selector: 'app-characters',
  imports: [CommonModule, MatButtonModule, TableModule],
  standalone: true,
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent {
  characterHeaders: CharacterHeader[] | null = null;

  constructor(private sharedService: SharedService, private router: Router){}

  ngOnInit() {
    this.sharedService.fetchCharacterHeaders();
    this.sharedService.characterHeaders$.subscribe((characterHeaders) => {
      this.characterHeaders = characterHeaders;
    });
  }

  selectCharacter(event: TableRowSelectEvent){
    let characterHeader = event.data;
    let id = characterHeader.id;
    this.router.navigate(['/characters', id]);
    this.sharedService.toggleView();
  }
}
