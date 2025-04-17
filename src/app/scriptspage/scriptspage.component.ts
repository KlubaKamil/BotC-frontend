import { Component } from '@angular/core';
import { ScriptsComponent } from "./scripts/scripts.component";
import { ScriptComponent } from './script/script.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../shared/service/shared.service';

@Component({
  selector: 'app-scriptspage',
  imports: [ScriptsComponent, ScriptComponent, MatIconModule, MatButtonModule],
  templateUrl: './scriptspage.component.html',
  styleUrl: './scriptspage.component.css'
})
export class ScriptspageComponent {
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
