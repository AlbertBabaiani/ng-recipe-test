import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { IRecipe } from '../../../Models/recipe.model';
import { I18nPluralPipe, NgClass, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeListService } from '../../../Services/recipe-list.service';
import { TruncatePipe } from './Pipes/truncate.pipe';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [TitleCasePipe, RouterLink, I18nPluralPipe, NgClass, TruncatePipe],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  private recipeListService = inject(RecipeListService);
  recipe = input.required<IRecipe>();

  ingredientQuantity: { [k: string]: string } = {
    '=0': 'No ingredients',
    '=1': '# ingredient',
    other: '# ingredients',
  };

  private _favouriteStatus = signal<boolean>(false);
  readonly favouriteStatus = this._favouriteStatus.asReadonly();

  constructor() {
    effect(() => {
      const status = this.recipe()?.favourite;
      untracked(() => this._favouriteStatus.set(status));
    });
  }

  get img() {
    return this.recipe()?.imageUrl || '';
  }

  onError() {
    this.recipe().imageUrl = 'images/no-image.jpg';
  }

  updateRecipeFavouriteStatus() {
    this._favouriteStatus.update((val) => !val);
    this.recipeListService.updateFavourite(
      this.recipe().id,
      !this.recipe().favourite
    );
  }
}
