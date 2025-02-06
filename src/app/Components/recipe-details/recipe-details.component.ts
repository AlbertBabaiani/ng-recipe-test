import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { IRecipe } from '../../Models/recipe.model';
import { RecipeListService } from '../../Services/recipe-list.service';
import { Title } from '@angular/platform-browser';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss',
})
export class RecipeDetailsComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);
  private activatedRouteSubscription!: Subscription;

  private recipeListService = inject(RecipeListService);

  private titleService = inject(Title);

  recipe = signal<IRecipe | undefined>(undefined);
  list_length = this.recipeListService.list_length;

  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    this.activatedRouteSubscription = this.activatedRoute.paramMap
      .pipe(
        switchMap((paramMap) => {
          const recipeId = paramMap.get('id') || '';
          return this.recipeListService.getRecipe(recipeId);
        })
      )
      .subscribe({
        next: (recipe) => {
          if (!recipe) {
            this.router.navigate(['/error']);
            return;
          }

          this.recipe.set(recipe);
          this.titleService.setTitle(`${recipe.title} - Details`);
        },
        error: (err) => {
          console.error('Error fetching recipe:', err);
          this.router.navigate(['/error']);
        },
      });
  }

  onError() {
    const currentRecipe = this.recipe();
    if (currentRecipe) {
      this.recipe.set({
        ...currentRecipe,
        imageUrl: 'images/no-image.jpg',
      });
    }
  }

  updateRecipeFavouriteStatus() {
    const currentRecipe = this.recipe();
    if (currentRecipe) {
      this.recipe.set({
        ...currentRecipe,
        favourite: !currentRecipe.favourite,
      });
      this.recipeListService.updateFavourite(
        currentRecipe.id,
        !currentRecipe.favourite
      );
    }
  }

  ngOnDestroy(): void {
    this.activatedRouteSubscription?.unsubscribe();
  }
}
