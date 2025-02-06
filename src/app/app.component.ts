import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { RecipeListService } from './Services/recipe-list.service';
import { LoaderComponent } from './Components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'recipeSharing';

  private recipeListService = inject(RecipeListService);

  isLoading = this.recipeListService.loading;
}
