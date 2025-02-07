import { Component, model } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss',
})
export class ErrorMessageComponent {
  message = model<string | null>(null, {
    alias: 'error_message',
  });

  closeMessage() {
    this.message.set(null);
  }
}
