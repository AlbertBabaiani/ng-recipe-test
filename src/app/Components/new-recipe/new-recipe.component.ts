import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { urlValidator } from './Validators/validator.validator';
import { RecipeListService } from '../../Services/recipe-list.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IRecipe } from '../../Models/recipe.model';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-recipe',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.scss',
})
export class NewRecipeComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);
  private activatedRouteSubscription!: Subscription;

  private id: string = '';

  private _isEditing = signal<boolean>(false);
  readonly isEditing = this._isEditing.asReadonly();

  private recipeListService = inject(RecipeListService);

  form!: FormGroup;
  private fb = inject(FormBuilder);
  private initial_form!: IRecipe;

  private canBeSubmitted = false;

  private scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.scrollToTop();

    this.initializeForm();

    this.subscribeToRouteParams();
  }

  private createEmptyRecipe(): IRecipe {
    return {
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      instructions: '',
      ingredients: [],
    };
  }

  private getTextValidators(min: number, max: number) {
    return [
      Validators.required,
      Validators.minLength(min),
      Validators.maxLength(max),
    ];
  }

  private initializeForm(): void {
    this.initial_form = this.createEmptyRecipe();
    this.form = this.fb.group(
      {
        title: ['', this.getTextValidators(3, 20)],
        description: ['', this.getTextValidators(3, 200)],
        ingredients: this.fb.array([
          this.fb.control('', this.getTextValidators(3, 20)),
        ]),
        instructions: ['', this.getTextValidators(3, 200)],
        imageUrl: [
          '',
          [Validators.required, Validators.minLength(3), urlValidator()],
        ],
      },
      { updateOn: 'blur' }
    );
  }

  private setInitialValues(recipe: IRecipe) {
    this.form.patchValue({
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      imageUrl: recipe.imageUrl,
    });

    this.ingredients.clear();

    recipe.ingredients.forEach((ingredient) => {
      this.addIngredient(ingredient);
    });
  }

  private subscribeToRouteParams(): void {
    this.activatedRouteSubscription = this.activatedRoute.paramMap.subscribe({
      next: (paramMap) => {
        const recipeId = paramMap.get('id');
        if (!recipeId) return;

        this._isEditing.set(true);
        this.recipeListService.getRecipe(recipeId).subscribe({
          next: (recipe) => {
            if (!recipe) {
              this.router.navigate(['error']);
              return;
            }
            this.id = recipe.id;
            this.setInitialValues(recipe);
            this.initial_form = recipe;
          },
        });
      },
    });
  }

  get title() {
    return this.form.get('title');
  }

  get description() {
    return this.form.get('description');
  }

  get instructions() {
    return this.form.get('instructions');
  }

  get imageUrl() {
    return this.form.get('imageUrl');
  }

  get ingredients() {
    return this.form.get('ingredients') as FormArray;
  }

  addIngredient(value: string = ''): void {
    this.ingredients.push(
      this.fb.control(value, this.getTextValidators(3, 20))
    );
  }

  deleteIngredient(id: number) {
    this.ingredients.removeAt(id);
  }

  get canLeave() {
    return this.form.pristine || this.canBeSubmitted;
  }

  isFormUnchanged(): boolean {
    return (
      JSON.stringify({ id: this.id, ...this.form.value }) ===
      JSON.stringify(this.initial_form)
    );
  }

  private markAllAsTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      if (control instanceof FormArray) {
        control.controls.forEach((formControl) => formControl.markAsTouched());
      } else {
        control.markAsTouched();
      }
    });
  }

  addNewRecipe() {
    this.markAllAsTouched();

    if (this.isEditing()) {
      if (this.isFormUnchanged()) return;

      this.canBeSubmitted = true;
      this.updateRecipe();
    } else {
      if (this.form.valid) {
        this.canBeSubmitted = true;
        this.recipeListService.addNewRecipe({ ...this.form.value, id: 0 });
      } else {
        console.log('Form is invalid');
      }
    }
  }

  private updateRecipe() {
    this.recipeListService.updateRecipe(this.id, {
      id: this.id,
      ...this.form.value,
    });
  }

  deleteRecipe() {
    const response = confirm(`Do you want to delete ${this.title?.value}?`);
    if (response) {
      this.recipeListService.deleteRecipe(this.id);
    }
  }

  ngOnDestroy(): void {
    this.activatedRouteSubscription?.unsubscribe();
  }
}
