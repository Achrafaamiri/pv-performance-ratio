import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { HigecoService } from './higeco.service';
import { normalize, dailyPR, totalPR, DailyPR } from './pr';
import { Sample } from './higeco.types';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private api = inject(HigecoService);

  apiToken = '';
  loading = false;
  error = '';

  samples: Sample[] = [];
  daily: DailyPR[] = [];
  total: number | null = null;

  carica(): void {
    const token = this.apiToken.trim();
    if (!token) {
      this.error = 'Inserisci il token';
      return;
    }

    this.loading = true;
    this.error = '';

    this.api.loadLogData(token).subscribe({
      next: res => {
        this.samples = normalize(res);
        this.daily = dailyPR(this.samples);
        this.total = totalPR(this.samples);
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.error ?? 'Errore durante il caricamento';
        this.loading = false;
      },
    });
  }
}
