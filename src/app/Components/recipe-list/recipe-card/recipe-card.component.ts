import { Component, input } from '@angular/core';
import { IRecipe } from '../../../Models/recipe.model';
import { I18nPluralPipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [TitleCasePipe, RouterLink, I18nPluralPipe],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  recipe = input.required<IRecipe>();

  ingredientQuantity: { [k: string]: string } = {
    '=0': 'No ingredients',
    '=1': '# ingredient',
    other: '# ingredients',
  };
}
