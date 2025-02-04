import { Component } from '@angular/core';
import { SearchComponent } from '../../Components/search/search.component';
import { RecipeListComponent } from '../../Components/recipe-list/recipe-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchComponent, RecipeListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  searched_value: string = '';
}
