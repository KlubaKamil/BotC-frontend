import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonsComponent } from './buttons/buttons.component';
import { Router, RouterModule } from '@angular/router';
import { SharedService } from './shared/service/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [CommonModule, ButtonsComponent, RouterModule]
})
export class AppComponent {
  constructor(private sharedService: SharedService, private router: Router) {}

  ngOnInit() {
    const url = window.location.pathname;
    const parts = url.split('/').filter(Boolean);
    if (parts.length > 2) {
      this.sharedService.toggleView();
    }
  }
}
