import { Component } from '@angular/core';
import { SettingsStore, UserStore } from '@/stores';
import { StorageService } from '@/services/StorageService';
import AuthenticationComponent from "../authentication/authentication.component";
import SiteHeaderComponent from "../shared/header/header.component";
import BroadcastService from '@/services/BroadcastService';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [AuthenticationComponent, SiteHeaderComponent],
  providers: [
    UserStore, SettingsStore,
    BroadcastService, StorageService
  ],
})

export default class AppComponent {}
