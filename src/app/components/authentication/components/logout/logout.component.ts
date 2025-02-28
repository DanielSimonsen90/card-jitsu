import { UserStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-logout',
  templateUrl: 'logout.component.html',
  styleUrl: 'logout.component.scss'
})

export default class LogoutComponent implements OnInit {
  private _userStore = inject(UserStore);
  
  public username: string | undefined;
  public shouldRender = false;

  public ngOnInit() {
    this.username = this._userStore.username();
    this.shouldRender = this._userStore.hasValidUser();
  }

  public logout() {
    this._userStore.delete();
  }
}