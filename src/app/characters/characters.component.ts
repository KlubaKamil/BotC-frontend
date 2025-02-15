import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Character } from '../shared/interfaces';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared/service/shared.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-characters',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent {
  characters: Character[] | null = null;
  error: string = '';
    apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private sharedService: SharedService){
    this.fetchAllCharacters();
  }

  fetchAllCharacters() {
    this.http.get<Character[]>(this.apiUrl + '/character/all').subscribe({
      next: (data) => {
        this.characters = data;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to fetch characters data.';
        this.characters = null;
      }
    })
  }

  selectCharacter(character: Character){
    this.sharedService.setSelectedCharacter(character);
  }

  addCharacter(character: Character){
    this.characters?.push(character)
  }
}
