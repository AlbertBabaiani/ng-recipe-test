import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  // Two words search

  private router = inject(Router);

  search_value = signal<string>('');

  search_value_output = output<string>({
    alias: 'search',
  });

  search() {
    const formattedValue = this.search_value().toLocaleLowerCase().trim();
    console.log(formattedValue);

    if (formattedValue) {
      // Additional

      this.router.navigate(['./'], {
        queryParams: {
          search: formattedValue,
        },
        queryParamsHandling: 'merge',
      });
      this.search_value_output.emit(this.search_value());
      this.search_value.set('');
    }
  }

  reset() {
    this.search_value.set('');
    this.search_value_output.emit('');
  }
}
