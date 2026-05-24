import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';


export interface AppConfig {
  discordOauthUrl: string;
  discordServerUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config!: AppConfig;

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return firstValueFrom(
      this.http.get<AppConfig>('/assets/config/config.json')
    ).then(cfg => { 
      this.config = cfg; 
    });
  }

  get discordOauthUrl(): string { return this.config?.discordOauthUrl ?? ''; }
  get discordServerUrl(): string { return this.config?.discordServerUrl ?? ''; }
}