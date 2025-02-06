import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  customMaxLengthValidator,
  customMinLengthValidator,
  urlValidator,
} from './Validators/validator.validator';
import { RecipeListService } from '../../Services/recipe-list.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IRecipe } from '../../Models/recipe.model';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-new-recipe',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    RouterLink,
    ValidationMessageComponent,
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.scss',
})
export class NewRecipeComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  private activatedRoute = inject(ActivatedRoute);
  private activatedRouteSubscription!: Subscription;

  private title_service = inject(Title);

  private recipeListService = inject(RecipeListService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  private initial_form!: IRecipe;
  imageUrl_backup = signal<string>('');

  private id: string = '';

  isSubmitted = signal<boolean>(false);

  private _isEditing = signal<boolean>(false);
  readonly isEditing = this._isEditing.asReadonly();

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
    this.imageUrl_backup.set('');
    return {
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      instructions: '',
      ingredients: [],
      favourite: false,
    };
  }

  private getTextValidators(min: number, max: number) {
    return [
      Validators.required,
      customMaxLengthValidator(max),
      customMinLengthValidator(min),
    ];
  }

  private initializeForm(): void {
    this.initial_form = this.createEmptyRecipe();
    this.form = this.fb.group(
      {
        favourite: [false, { updateOn: 'change' }],
        title: ['', this.getTextValidators(3, 40)],
        description: ['', this.getTextValidators(3, 200)],
        ingredients: this.fb.array([]),
        instructions: ['', this.getTextValidators(3, 200)],
        imageUrl: [
          '',
          {
            validators: [
              Validators.required,
              customMinLengthValidator(3),
              urlValidator(),
            ],
            updateOn: 'change',
          },
        ],
      },
      { updateOn: 'blur' }
    );

    this.addIngredient();
  }

  private setInitialValues(recipe: IRecipe) {
    this.initial_form = recipe;
    this.form.patchValue(recipe);
    this.imageUrl_backup.set(recipe.imageUrl);

    this.ingredients.clear();

    recipe.ingredients.forEach((ingredient) => this.addIngredient(ingredient));
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
            this.title_service.setTitle(`Editing - ${recipe.title}`);
            this.setInitialValues(recipe);
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

  get favourite() {
    return this.form.get('favourite') as FormControl<boolean>;
  }

  onImageError() {
    this.imageUrl?.setErrors({
      invalidUrl: true,
    });
    this.imageUrl?.markAsTouched();
    this.imageUrl_backup.set('images/no-image.jpg');
  }

  get ingredients() {
    return this.form.get('ingredients') as FormArray;
  }

  addIngredient(value: string = ''): void {
    this.ingredients.push(
      this.fb.control(value, this.getTextValidators(3, 40))
    );
  }

  deleteIngredient(id: number) {
    this.ingredients.removeAt(id);
  }

  get canLeave() {
    return this.form.pristine || this.canBeSubmitted;
  }

  isFormUnchanged(): boolean {
    const sortObject = (obj: IRecipe) =>
      JSON.stringify(
        Object.keys(obj)
          .sort()
          .reduce((acc: { [key in keyof IRecipe]: any }, key: string) => {
            const value = obj[key as keyof IRecipe];

            acc[key as keyof IRecipe] = Array.isArray(value)
              ? value.sort()
              : value;
            return acc;
          }, {} as { [key in keyof IRecipe]: any })
      );

    return (
      sortObject({ id: this.id, ...this.form.value }) ===
      sortObject(this.initial_form)
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

  private trimFormValues(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);

      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim());
      } else if (control instanceof FormArray) {
        control.controls.forEach((formControl) => {
          if (typeof formControl.value === 'string') {
            formControl.setValue(formControl.value.trim());
          }
        });
      }
    });
  }

  submitForm() {
    this.markAllAsTouched();
    this.isSubmitted.set(true);
    this.scrollToTop();

    if (this.form.invalid || (this.isEditing() && this.isFormUnchanged()))
      return;

    this.canBeSubmitted = true;
    this.trimFormValues();

    this.isEditing()
      ? this.updateRecipe()
      : this.recipeListService.addNewRecipe({ ...this.form.value, id: 0 });
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
