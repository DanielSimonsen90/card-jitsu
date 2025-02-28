import { Component } from '@angular/core';
import { UserStore } from '@/stores';
import { StorageService } from '@/services/StorageService';
import AuthenticationComponent from "../authentication/authentication.component";
import SiteHeaderComponent from "../shared/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [AuthenticationComponent, SiteHeaderComponent],
  providers: [StorageService, UserStore],
})

export default class AppComponent {}
