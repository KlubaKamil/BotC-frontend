import { Component } from '@angular/core';
import { CharactersComponent } from './characters/characters.component';
import { CharacterComponent } from './character/character.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';

@Component({
  selector: 'app-characterspage',
  imports: [CharactersComponent, CharacterComponent, MatIconModule, MatButtonModule],
  templateUrl: './characterspage.component.html',
  styleUrl: './characterspage.component.css'
})
export class CharacterspageComponent {
  detailsView = false;

  constructor(private sharedService: SharedService){}

  ngOnInit() {
    this.sharedService.detailsView$.subscribe((detailsView) => {
      this.detailsView = detailsView;
    })
  }

  toggleView() {
    this.sharedService.toggleView();
  }
}
