import { Component } from '@angular/core';
import { Character, Game, Script } from '../shared/interfaces'
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-scripts',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './scripts.component.html',
  styleUrl: './scripts.component.css'
})
export class ScriptsComponent {
  scripts: Script[] | null = null;
  characters: Character[] | null = null;
  games: Game[] | null = null;
  error: string = '';
  apiUrl = environment.apiUrl;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.scripts$.subscribe((scripts) => {
      this.scripts = scripts;
      this.getDetails();
    })
    this.sharedService.games$.subscribe((games) => this.games = games);
    this.sharedService.characters$.subscribe((characters) => this.characters = characters);
    
  }

  selectScript(script: Script){
    this.sharedService.setSelectedScript(script);
  }

  addScript(script: Script){
    this.scripts?.push(script)
  }

  private getDetails(){
    this.scripts?.forEach(s => {
      s.timesPlayed = this.games?.filter(g => g.script?.id === s.id).length;
    })
  }
}
