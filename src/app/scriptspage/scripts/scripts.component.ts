import { Component } from '@angular/core';
import { Character, Game, Script, ScriptHeader } from '../../shared/interfaces'
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-scripts',
  imports: [CommonModule, MatButtonModule, TableModule],
  templateUrl: './scripts.component.html',
  styleUrl: './scripts.component.css'
})
export class ScriptsComponent {
  scriptHeaders: ScriptHeader[] | null = null;
  characters: Character[] | null = null;
  games: Game[] | null = null;
  error: string = '';
  apiUrl = environment.apiUrl;

  constructor(private sharedService: SharedService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.sharedService.fetchScriptHeaders();
    this.sharedService.scriptHeaders$.subscribe((scriptHeaders) => {
      this.scriptHeaders = scriptHeaders;
    })
  }

  selectScript(event: TableRowSelectEvent){
    let scriptHeader = event.data;
    let id = scriptHeader.id;
    this.sharedService.toggleView();
    this.sharedService.navigate('/scripts', id)
  }
}
