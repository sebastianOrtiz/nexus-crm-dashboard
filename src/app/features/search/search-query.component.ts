import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SearchResult } from '../../core/models/search.model';
import { SearchService } from '../../core/services/search.service';
import { TranslateService } from '../../core/services/translate.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Semantic search query interface */
@Component({
  selector: 'app-search-query',
  standalone: true,
  imports: [DecimalPipe, FormsModule, LoadingSpinnerComponent, TranslatePipe],
  template: `
    <div class="space-y-6 max-w-3xl mx-auto">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">{{ 'search.query.title' | translate }}</h1>
        <p class="text-sm text-surface-400 mt-1">{{ 'search.subtitle' | translate }}</p>
      </div>

      <!-- Search input -->
      <div class="card">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                class="h-4 w-4 text-surface-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              class="input pl-10 w-full"
              [placeholder]="'search.query.placeholder' | translate"
              [(ngModel)]="query"
              (keydown.enter)="runSearch()"
              [disabled]="searching()"
            />
          </div>
          <button
            class="btn-primary shrink-0 flex items-center gap-2"
            (click)="runSearch()"
            [disabled]="!query.trim() || searching()"
          >
            @if (searching()) {
              <app-loading-spinner size="sm" />
              {{ 'search.query.searching' | translate }}
            } @else {
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {{ 'search.query.search' | translate }}
            }
          </button>
        </div>
      </div>

      <!-- Results -->
      @if (hasSearched()) {
        @if (results().length === 0) {
          <!-- Empty state -->
          <div class="card text-center py-12">
            <svg
              class="h-12 w-12 mx-auto text-surface-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 class="text-base font-medium text-surface-200">
              {{ 'search.query.no_results' | translate }}
            </h3>
            <p class="mt-1 text-sm text-surface-400">
              {{ 'search.query.no_results_desc' | translate }}
            </p>
          </div>
        } @else {
          <!-- Results count -->
          <p class="text-xs text-surface-500">
            {{ 'search.query.results_count' | translate: { count: results().length } }}
            &mdash; &ldquo;{{ lastQuery() }}&rdquo;
          </p>

          <!-- Results list -->
          <div class="space-y-3">
            @for (result of results(); track result.chunkText) {
              <div class="card space-y-3">
                <!-- Score + source header -->
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div class="flex items-center gap-2">
                    <svg
                      class="h-4 w-4 text-surface-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span class="text-xs text-surface-400">
                      {{ 'search.query.source' | translate }}:
                    </span>
                    <span class="text-xs font-medium text-primary-400">
                      {{ result.documentFilename }}
                    </span>
                  </div>

                  <!-- Relevance badge -->
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-surface-400"
                      >{{ 'search.query.relevance' | translate }}:</span
                    >
                    <span
                      class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      [class]="scoreClass(result.score)"
                    >
                      {{ result.score * 100 | number: '1.0-0' }}%
                    </span>
                  </div>
                </div>

                <!-- Score bar -->
                <div class="h-1 rounded-full bg-surface-700 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    [class]="scoreBarClass(result.score)"
                    [style.width.%]="result.score * 100"
                  ></div>
                </div>

                <!-- Chunk text -->
                <p class="text-sm text-surface-300 leading-relaxed">{{ result.chunkText }}</p>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class SearchQueryComponent {
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  query = '';
  readonly searching = signal(false);
  readonly hasSearched = signal(false);
  readonly results = signal<SearchResult[]>([]);
  readonly lastQuery = signal('');

  runSearch(): void {
    const q = this.query.trim();
    if (!q || this.searching()) return;

    this.searching.set(true);
    this.hasSearched.set(false);

    this.searchService
      .search(q)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.results.set(response.results);
          this.lastQuery.set(response.query || q);
          this.searching.set(false);
          this.hasSearched.set(true);
        },
        error: () => {
          this.results.set([]);
          this.lastQuery.set(q);
          this.searching.set(false);
          this.hasSearched.set(true);
        },
      });
  }

  scoreClass(score: number): string {
    if (score >= 0.8) return 'bg-green-500/20 text-green-400';
    if (score >= 0.6) return 'bg-blue-500/20 text-blue-400';
    if (score >= 0.4) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-surface-600 text-surface-400';
  }

  scoreBarClass(score: number): string {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-surface-500';
  }
}
