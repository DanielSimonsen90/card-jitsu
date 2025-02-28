import { UserStore } from '@/stores';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-logout',
  templateUrl: 'logout.component.html',
  styleUrl: 'logout.component.scss'
})

export default class LogoutComponent {
  private userStore = inject(UserStore);
  
  public get username() {
    return this.userStore.state.username;
  }
  public get shouldRender() {
    return this.userStore.hasValidUser();
  }

  public logout() {
    this.userStore.delete();
  }
}