import { UserStore } from "@/stores";
import { CommonModule } from "@angular/common";
import { Component, effect, inject, OnInit } from "@angular/core";
import LoginComponent from "./components/login";
import { MainComponent } from "../main/main.component";
import LoggerService from "@/services/LoggerService";

const Logger = LoggerService.createComponentLogger('Authentication');

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    MainComponent
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
})

export default class AuthenticationComponent implements OnInit {
  private userStore = inject(UserStore);
  
  constructor() {
    Logger.info('OnInit complete');
  }

  ngOnInit(): void {
    this.isAuthenticated = this.userStore.hasValidUser();

    effect(() => {
      const username = this.userStore.username(); // Read signal value
      Logger.info('Username updated', username);

      this.isAuthenticated = this.userStore.hasValidUser();
      Logger.info('this.isAuthenticated', this.isAuthenticated);
    });
  }

  public isAuthenticated = false;
}