import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game, GameHeader } from '../../shared/interfaces'
import { SharedService } from '../../shared/service/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, MatButtonModule, TableModule, RouterModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent {
  gameHeaders: GameHeader[] | null = null;

  constructor(private sharedService: SharedService, route: ActivatedRoute, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.sharedService.fetchGameHeaders();
    this.sharedService.gameHeaders$.subscribe((gameHeaders) => {
      this.gameHeaders = gameHeaders;
      this.cd.detectChanges();
    })
  }

  selectGame(event: TableRowSelectEvent){
    let gameHeader = event.data;
    let id = gameHeader.id;
    this.sharedService.toggleView();
    this.sharedService.navigate('games', id);
  }
     
  customSort(event: SortEvent) {
    event.data!.sort((a, b) => {
      if (event.field === 'date') {
        let date1 = this.parseDate(a.date);
        let date2 = this.parseDate(b.date);
        let result = date1 > date2 ? 1 : date1 < date2 ? -1 : 0;
        if(result == 0){
          let id1 = a.id;
          let id2 = b.id;
          result = id1 - id2;
        }
        return event.order! * result;
      } else if(event.field === 'goodWon'){
        let value1 = a[event.field!];
        let value2 = b[event.field!];
        return event.order! * (value2 - value1);
      } else {
        let value1 = a[event.field!];
        let value2 = b[event.field!];
        if (typeof value1 === 'number' && typeof value2 === 'number') {
          return event.order! * (value1 - value2);
        } else if (typeof value1 === 'string' && typeof value2 === 'string') {
          return event.order! * value1.localeCompare(value2);
        }
      }
      return 0;
    });
  }
  
  parseDate(dateString: string): Date {
    if (!dateString) return new Date(0);
    let parts = dateString.split('/');
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }
} 
