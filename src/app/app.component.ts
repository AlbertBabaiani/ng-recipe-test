import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { RecipeListService } from './Services/recipe-list.service';
import { LoaderComponent } from './Components/loader/loader.component';
import { ErrorMessageComponent } from './Components/error-message/error-message.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    LoaderComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'recipeSharing';

  private recipeListService = inject(RecipeListService);

  isLoading = this.recipeListService.loading;

  error_message = this.recipeListService.errorMessage;

  removeErrorMessage(message: string | null) {
    this.recipeListService.setErrorMessage(message);
  }
}
