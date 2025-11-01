import { Component } from '@angular/core';
import AuthenticationComponent from "../authentication/authentication.component";
import SiteHeaderComponent from "../shared/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [AuthenticationComponent, SiteHeaderComponent],
})

export default class AppComponent {}
