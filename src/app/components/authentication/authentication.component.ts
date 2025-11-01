import { UserStore } from "@/stores";
import { CommonModule } from "@angular/common";
import { Component, effect, inject, OnInit } from "@angular/core";
import LoginComponent from "./components/login";
import { MainComponent } from "../main/main.component";
import LoggerService from "@/services/LoggerService";
import { GameProvider } from "../game";

const Logger = LoggerService.createComponentLogger('Authentication').disable();

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    GameProvider, MainComponent
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
})

export default class AuthenticationComponent implements OnInit {
  private userStore = inject(UserStore);

  public ngOnInit(): void {
    this.userStore.load();
  }

  public get isAuthenticated() {
    const value = this.userStore.hasValidUser();
    Logger.info('this.isAuthenticated', value, this.userStore.user.username);
    return value;
  }
}