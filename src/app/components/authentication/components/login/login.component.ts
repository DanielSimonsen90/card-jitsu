import { UserStore } from "@/stores";
import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import LoggerService from "@/services/LoggerService";

const Logger = LoggerService.createComponentLogger('Login');

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export default class LoginComponent implements OnInit {
  private _userStore = inject(UserStore);

  public username: string | undefined;

  public ngOnInit(): void {
    this.username = this._userStore.username();
  }

  public onSubmit() {
    Logger.info('onSubmit', this.username);
    if (this.username) this._userStore.createUser(this.username);
  }
}