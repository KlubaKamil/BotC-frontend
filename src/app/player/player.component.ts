import { Component } from '@angular/core';
import { Player } from '../shared/interfaces';
import { SharedService } from '../shared/service/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent {
  isEditing: boolean = false;
  isCreating: boolean =false;
  selectedPlayer: Player | null = null;
  tempPlayer: Player | null = null;

  constructor(private sharedService: SharedService, private http: HttpClient, private dialog: MatDialog){}

  ngOnInit() {
    this.sharedService.selectedPlayer$.subscribe((Player) => {
      this.selectedPlayer = Player;
      this.isCreating = false;
    })
  }

  createNewPlayer() {
    this.selectedPlayer = null;
    this.isEditing = false;
    this.isCreating = true;
    this.tempPlayer = {} as Player;
  }

  toggleEdit() {

  }

  cancel() {

  }

  deletePlayer() {
    
  }
}
