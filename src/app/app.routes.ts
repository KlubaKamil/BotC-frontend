import { Routes } from '@angular/router';
import { GamespageComponent } from './gamespage/gamespage.component';
import { ScriptspageComponent } from './scriptspage/scriptspage.component';
import { CharacterspageComponent } from './characterspage/characterspage.component';
import { PlayerspageComponent } from './playerspage/playerspage.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { AchievementspageComponent } from './achievementspage/achievementspage.component';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'games/:groupName', component: GamespageComponent },
  { path: 'games/:groupName/:id', component: GamespageComponent },
  { path: 'scripts/:groupName', component: ScriptspageComponent },
  { path: 'scripts/:groupName/:id', component: ScriptspageComponent },
  { path: 'characters/:groupName', component: CharacterspageComponent },
  { path: 'characters/:groupName/:id', component: CharacterspageComponent },
  { path: 'players/:groupName', component: PlayerspageComponent },
  { path: 'players/:groupName/:id', component: PlayerspageComponent },
  { path: 'achievements/:groupName', component: AchievementspageComponent },
  { path: 'achievements/:groupName/:id', component: AchievementspageComponent },
  { path: 'welcome', component: WelcomepageComponent }
];

