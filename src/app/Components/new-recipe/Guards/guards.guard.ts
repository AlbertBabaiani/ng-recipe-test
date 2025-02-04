import { CanDeactivateFn } from '@angular/router';
import { NewRecipeComponent } from '../new-recipe.component';

export const guardsGuard: CanDeactivateFn<NewRecipeComponent> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  if (component.canLeave) {
    return true;
  }

  return confirm('You have not submitted the form! Do you want to leave?');
};
