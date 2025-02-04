import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-new-recipe-btn',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './add-new-recipe-btn.component.html',
  styleUrl: './add-new-recipe-btn.component.scss',
})
export class AddNewRecipeBtnComponent {}
