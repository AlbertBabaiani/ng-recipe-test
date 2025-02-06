export interface IRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  imageUrl: string;
  favourite: boolean;
}
