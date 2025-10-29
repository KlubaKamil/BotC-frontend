import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AchievementHeader } from '../../shared/interfaces';
import { SharedService } from '../../shared/service/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule, TableRowSelectEvent } from 'primeng/table';

@Component({
  selector: 'app-achievements',
  imports: [FormsModule, CommonModule, TableModule],
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.css'
})
export class AchievementsComponent {
  achievementHeaders: AchievementHeader[] | null = null;

  constructor(private sharedService: SharedService, private route: ActivatedRoute) {}

  ngOnInit(){
    this.sharedService.fetchAchievementHeaders();
    this.sharedService.achievementHeaders$.subscribe((achievementHeaders) => {
      this.achievementHeaders = achievementHeaders;
    })
    this.route.params.subscribe((params) => {
      this.sharedService.fetchAchievementHeaders();
    });
  }

  selectAchievement(event: TableRowSelectEvent){
    let achievementHeader = event.data;
    let id = achievementHeader.id;
    this.sharedService.toggleView();
    this.sharedService.changeLocation('achievements', id);
    this.sharedService.fetchAchievementAndSelect(id);
  }
}
