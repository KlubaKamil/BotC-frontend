import { Component } from '@angular/core';
import { Character, Game, Script } from '../shared/interfaces'
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { SharedService } from '../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';

@Component({
  selector: 'app-scripts',
  imports: [CommonModule, MatButtonModule, TableModule],
  templateUrl: './scripts.component.html',
  styleUrl: './scripts.component.css'
})
export class ScriptsComponent {
  scriptHeaders: Script[] | null = null;
  characters: Character[] | null = null;
  games: Game[] | null = null;
  error: string = '';
  apiUrl = environment.apiUrl;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.scriptHeaders$.subscribe((scriptHeaders) => {
      this.scriptHeaders = scriptHeaders;
    })
  }

  selectScript(event: TableRowSelectEvent){
    let scriptHeader = event.data;
    let id = scriptHeader.id;
    this.sharedService.fetchScriptAndSelect(id);
    this.sharedService.setSelectedScriptHeader(scriptHeader);
  }
}
