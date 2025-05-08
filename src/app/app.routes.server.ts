import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'games/:id',
    renderMode: RenderMode.Client 
  },
  {
    path: 'scripts/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'characters/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'players/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'achievements/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
