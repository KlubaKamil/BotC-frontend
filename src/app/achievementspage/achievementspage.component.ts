import { Component } from '@angular/core';
import { AchievementsComponent } from "./achievements/achievements.component";
import { AchievementComponent } from "./achievement/achievement.component";
import { SharedService } from '../shared/service/shared.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-achievementspage',
  imports: [AchievementsComponent, AchievementComponent, MatIconModule, MatButtonModule],
  templateUrl: './achievementspage.component.html',
  styleUrl: './achievementspage.component.css'
})
export class AchievementspageComponent {
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
