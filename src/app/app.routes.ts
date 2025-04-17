import { Routes } from '@angular/router';
import { GamespageComponent } from './gamespage/gamespage.component';
import { ScriptspageComponent } from './scriptspage/scriptspage.component';
import { CharacterspageComponent } from './characterspage/characterspage.component';
import { PlayerspageComponent } from './playerspage/playerspage.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'games', component: GamespageComponent },
  { path: 'games/:id', component: GamespageComponent, data: { renderMode: 'server' }},
  { path: 'scripts', component: ScriptspageComponent },
  { path: 'scripts/:id', component: ScriptspageComponent, data: { renderMode: 'server' } },
  { path: 'characters', component: CharacterspageComponent },
  { path: 'characters/:id', component: CharacterspageComponent, data: { renderMode: 'server' } },
  { path: 'players', component: PlayerspageComponent },
  { path: 'players/:id', component: PlayerspageComponent, data: { renderMode: 'server' } },
  { path: 'welcome', component: WelcomepageComponent }
];