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

  readonly list_length = computed(() => this._list().length);

  constructor() {
    this.fetchAllData().subscribe();

    this.activatedRoute.queryParamMap.subscribe({
      next: (data: ParamMap) => {
        this.searched_value = data.get('search') || '';
        this.filterRecipes();
      },
    });
  }

  private fetchAllData(): Observable<void> {
    return this.httpClient.get<IRecipe[]>(this.apiUrl).pipe(
      switchMap((data) => {
        this._list.set(data);
        this._original_list = data;

        this.filterRecipes();
        return of(undefined); // Return an Observable that resolves with void
      }),
      catchError((err) => {
        console.error('Error fetching data:', err);
        return of(undefined); // Return an empty Observable in case of error
      })
    );
  }

  private filterRecipes(): void {
    if (!this.searched_value) {
      this._list.set(this._original_list);
      return;
    }
    const searchLower = this.searched_value.toLowerCase();
    this._list.set(
      this._original_list.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(searchLower)
          )
      )
    );
  }

  getRecipe(id: string): Observable<IRecipe | undefined> {
    return this.fetchAllData().pipe(
      switchMap(() => {
        const recipe = this._original_list.find(
          (recipe: IRecipe) => recipe.id === id
        );
        return of(recipe); // Return the recipe as an Observable
      })
    );
  }

  addNewRecipe(newRecipe: IRecipe) {
    this.httpClient
      .post<IRecipe>(this.apiUrl, { ...newRecipe, id: uuidv4() })
      .subscribe({
        next: (data) => {
          this._list.set([...this._list(), data]);
          this._original_list.push(data);
          this.router.navigate(['']);
        },
        error: (err) => {
          console.error('Error adding new recipe:', err);
        },
      });
  }

  updateRecipe(id: string, recipe: IRecipe) {
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
      },
      error: (err) => {
        console.error('Error updating recipe:', err);
      },
    });
  }

  deleteRecipe(id: string): void {
    this.httpClient.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        // console.log(`Recipe with id ${id} deleted successfully.`);
        this._list.set(this._list().filter((recipe) => recipe.id !== id));
        this._original_list = this._original_list.filter(
          (recipe) => recipe.id !== id
        );
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Error deleting recipe:', err);
      },
    });
  }
}
