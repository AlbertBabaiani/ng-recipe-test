import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AddNewRecipeBtnComponent } from '../add-new-recipe-btn/add-new-recipe-btn.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AddNewRecipeBtnComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {}
