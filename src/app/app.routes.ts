import { Routes } from '@angular/router';
import { GamespageComponent } from './gamespage/gamespage.component';
import { ScriptspageComponent } from './scriptspage/scriptspage.component';
import { CharacterspageComponent } from './characterspage/characterspage.component';
import { PlayerspageComponent } from './playerspage/playerspage.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { AchievementspageComponent } from './achievementspage/achievementspage.component';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'games', component: GamespageComponent },
  { path: 'games/:id', component: GamespageComponent },
  { path: 'scripts', component: ScriptspageComponent },
  { path: 'scripts/:id', component: ScriptspageComponent },
  { path: 'characters', component: CharacterspageComponent },
  { path: 'characters/:id', component: CharacterspageComponent },
  { path: 'players', component: PlayerspageComponent },
  { path: 'players/:id', component: PlayerspageComponent },
  { path: 'achievements', component: AchievementspageComponent },
  { path: 'achievements/:id', component: AchievementspageComponent },
  { path: 'welcome', component: WelcomepageComponent }
];