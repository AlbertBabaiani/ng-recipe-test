import { Component, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  search_value = signal<string>('');

  search_value_output = output<string>({
    alias: 'search',
  });

  favourite_status = signal<boolean>(false);

  constructor() {
    this.activatedRoute.queryParamMap.pipe(takeUntilDestroyed()).subscribe({
      next: (query) => {
        const favouritesParam = query.get('favourites');

        if (favouritesParam !== null) {
          const parsedFavourites = favouritesParam === 'true';
          if (parsedFavourites) {
            this.favourite_status.set(parsedFavourites);
          } else {
            this.router.navigate(['./'], {
              queryParams: {
                favourites: false,
              },
              queryParamsHandling: 'merge',
            });
          }
        }
      },
    });
  }

  search() {
    const formattedValue = this.search_value().toLocaleLowerCase().trim();

    if (formattedValue) {
      this.router.navigate(['./'], {
        queryParams: {
          search: formattedValue,
        },
        queryParamsHandling: 'merge',
      });
      this.search_value_output.emit(formattedValue);
      this.search_value.set('');
    }
  }

  favouriteSearching() {
    this.router.navigate(['./'], {
      queryParams: {
        favourites: this.favourite_status(),
      },
      queryParamsHandling: 'merge',
    });
  }

  reset() {
    this.search_value.set('');
    this.search_value_output.emit('');
  }
}
