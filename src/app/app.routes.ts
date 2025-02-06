import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { ErrorPageComponent } from './Pages/error-page/error-page.component';
import { guardsGuard } from './Components/new-recipe/Guards/guards.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'recipe-list',
    pathMatch: 'full',
  },
  {
    path: 'recipe-list',
    component: HomeComponent,
    title: 'Recipe list',
  },
  {
    path: 'recipe/:id',
    loadComponent: () =>
      import('./Components/recipe-details/recipe-details.component').then(
        (c) => c.RecipeDetailsComponent
      ),
  },
  {
    path: 'new-recipe',
    loadComponent: () =>
      import('./Components/new-recipe/new-recipe.component').then(
        (c) => c.NewRecipeComponent
      ),
    canDeactivate: [guardsGuard],
    title: 'New recipe',
  },
  {
    path: 'recipe/:id/edit',
    loadComponent: () =>
      import('./Components/new-recipe/new-recipe.component').then(
        (c) => c.NewRecipeComponent
      ),
    canDeactivate: [guardsGuard],
    title: 'Edit recipe',
  },
  {
    path: '**',
    component: ErrorPageComponent,
    title: 'Error',
  },
];
