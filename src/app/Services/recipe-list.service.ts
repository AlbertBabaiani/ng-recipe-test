import { computed, inject, Injectable, signal } from '@angular/core';
import { IRecipe } from '../Models/recipe.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class RecipeListService {
  private apiUrl = environment.apiUrl;

  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private _list = signal<IRecipe[]>([]);
  readonly list = this._list.asReadonly();

  private _original_list: IRecipe[] = [];

  private searched_value: string = '';
  private showFavourites: boolean = false;

  readonly list_length = computed(() => this._list().length);

  private _loading = signal<boolean>(true);
  readonly loading = this._loading.asReadonly();

  private setLoadingState(state: boolean) {
    this._loading.set(state);
  }

  constructor() {
    this.fetchAllData().subscribe();

    this.activatedRoute.queryParamMap.subscribe({
      next: (data: ParamMap) => {
        this.searched_value = data.get('search') || '';
        const favouriteParam = data.get('favourites');

        this.showFavourites = favouriteParam === 'true';

        this.filterRecipes();
      },
    });
  }

  private fetchAllData(): Observable<void> {
    this.setLoadingState(true);
    return this.httpClient.get<IRecipe[]>(this.apiUrl).pipe(
      switchMap((data) => {
        this._list.set(data);
        this._original_list = data;

        this.filterRecipes();
        this.setLoadingState(false);
        return of(undefined); // Return an Observable that resolves with void
      }),
      catchError((err) => {
        console.error('Error fetching data:', err);
        this.setLoadingState(false);
        return of(undefined); // Return an empty Observable in case of error
      })
    );
  }

  private filterRecipes(): void {
    let filteredList = this._original_list;

    // Apply search filter
    if (this.searched_value) {
      const searchLower = this.searched_value.toLowerCase();
      filteredList = filteredList.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply favorites filter
    if (this.showFavourites) {
      filteredList = filteredList.filter((recipe) => recipe.favourite);
    }

    this._list.set(filteredList);
  }

  getRecipe(id: string): Observable<IRecipe | undefined> {
    this.setLoadingState(true);
    return this.fetchAllData().pipe(
      switchMap(() => {
        const recipe = this._original_list.find(
          (recipe: IRecipe) => recipe.id === id
        );
        this.setLoadingState(false);
        return of(recipe); // Return the recipe as an Observable
      })
    );
  }

  addNewRecipe(newRecipe: IRecipe) {
    this.setLoadingState(true);
    this.httpClient
      .post<IRecipe>(this.apiUrl, { ...newRecipe, id: uuidv4() })
      .subscribe({
        next: (data) => {
          this._list.set([...this._list(), data]);
          this._original_list.push(data);
          this.router.navigate(['']);
          this.setLoadingState(false);
        },
        error: (err) => {
          console.error('Error adding new recipe:', err);
          this.setLoadingState(false);
        },
      });
  }

  updateRecipe(id: string, recipe: IRecipe) {
    this.setLoadingState(true);
    this.httpClient.put<IRecipe>(`${this.apiUrl}/${id}`, recipe).subscribe({
      next: (updatedRecipe) => {
        if (!updatedRecipe) return;

        this._list.set([
          ...this._list().map((r) => (r.id === id ? updatedRecipe : r)),
        ]);

        this._original_list = this._original_list.map((recipe) =>
          recipe.id === id ? updatedRecipe : recipe
        );
        this.router.navigate(['']);
        this.setLoadingState(false);
      },
      error: (err) => {
        console.error('Error updating recipe:', err);
        this.setLoadingState(false);
      },
    });
  }

  updateFavourite(id: string, favourite_status: boolean) {
    this.httpClient
      .patch<IRecipe>(`${this.apiUrl}/${id}`, { favourite: favourite_status })
      .subscribe({
        next: (updatedRecipe) => {
          this.fetchAllData().subscribe();
        },
        error: (err) => {
          console.error('Error updating recipe:', err);
        },
      });
  }

  deleteRecipe(id: string): void {
    this.setLoadingState(true);
    this.httpClient.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this._list.set(this._list().filter((recipe) => recipe.id !== id));
        this._original_list = this._original_list.filter(
          (recipe) => recipe.id !== id
        );
        this.router.navigate(['']);
        this.setLoadingState(false);
      },
      error: (err) => {
        console.error('Error deleting recipe:', err);
        this.setLoadingState(false);
      },
    });
  }
}
