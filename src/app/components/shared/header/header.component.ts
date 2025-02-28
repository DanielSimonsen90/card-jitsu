import { Component } from '@angular/core';
import { SITE_NAME } from '@/constants';
import LogoutComponent from "../../authentication/components/logout";
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [LogoutComponent, CommonModule],
  selector: 'site-header',
  templateUrl: 'header.component.html',
  styleUrl: 'header.component.scss'
})

export default class SiteHeaderComponent {
  public readonly SITE_NAME = SITE_NAME;
}