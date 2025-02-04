import { Component, inject, input, Signal } from '@angular/core';
import { RecipeListService } from '../../Services/recipe-list.service';
import { IRecipe } from '../../Models/recipe.model';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { AddNewRecipeBtnComponent } from '../add-new-recipe-btn/add-new-recipe-btn.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [RecipeCardComponent, AddNewRecipeBtnComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
})
export class RecipeListComponent {
  private recipeListService = inject(RecipeListService);

  searched_value = input<string>('');

  list: Signal<IRecipe[]> = this.recipeListService.list;
}
