import { Component } from '@angular/core';
import { UserStoreService } from '@/stores';
import { StorageService } from '@/services/StorageService';
import AuthenticationComponent from "../authentication/authentication.component";
import SiteHeaderComponent from "../shared/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [AuthenticationComponent, SiteHeaderComponent],
  providers: [StorageService, UserStoreService],
})

export default class AppComponent {}
