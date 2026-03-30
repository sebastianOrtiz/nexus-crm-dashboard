import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Semantic Search home — architecture explanation */
@Component({
  selector: 'app-search-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="space-y-8 max-w-4xl mx-auto">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">
          {{ 'search.home.heading' | translate }}
        </h1>
        <p class="text-sm text-surface-400 mt-2 leading-relaxed max-w-2xl">
          {{ 'search.home.intro' | translate }}
        </p>
      </div>

      <!-- Pipeline diagram -->
      <div class="card">
        <h2 class="text-base font-semibold text-surface-100 mb-6">
          {{ 'search.home.pipeline_title' | translate }}
        </h2>

        <div class="flex flex-col sm:flex-row items-stretch gap-3">
          <!-- Step 1: Upload -->
          <div
            class="flex-1 rounded-lg border border-surface-600 bg-surface-700/50 p-4 text-center"
          >
            <div
              class="h-10 w-10 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2"
            >
              <svg
                class="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">
              {{ 'search.home.step1_title' | translate }}
            </p>
            <p class="text-xs text-surface-400 mt-1">{{ 'search.home.step1_desc' | translate }}</p>
          </div>

          <!-- Arrow -->
          <div class="hidden sm:flex items-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <div class="sm:hidden flex justify-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <!-- Step 2: Parse & Chunk -->
          <div
            class="flex-1 rounded-lg border border-surface-600 bg-surface-700/50 p-4 text-center"
          >
            <div
              class="h-10 w-10 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2"
            >
              <svg
                class="h-5 w-5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">
              {{ 'search.home.step2_title' | translate }}
            </p>
            <p class="text-xs text-surface-400 mt-1">{{ 'search.home.step2_desc' | translate }}</p>
          </div>

          <!-- Arrow -->
          <div class="hidden sm:flex items-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <div class="sm:hidden flex justify-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <!-- Step 3: Embeddings -->
          <div
            class="flex-1 rounded-lg border border-surface-600 bg-surface-700/50 p-4 text-center"
          >
            <div
              class="h-10 w-10 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-2"
            >
              <svg
                class="h-5 w-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">
              {{ 'search.home.step3_title' | translate }}
            </p>
            <p class="text-xs text-surface-400 mt-1">{{ 'search.home.step3_desc' | translate }}</p>
          </div>

          <!-- Arrow -->
          <div class="hidden sm:flex items-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <div class="sm:hidden flex justify-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <!-- Step 4: ChromaDB -->
          <div class="flex-1 rounded-lg border border-green-600/30 bg-green-500/10 p-4 text-center">
            <div
              class="h-10 w-10 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-2"
            >
              <svg
                class="h-5 w-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">
              {{ 'search.home.step4_title' | translate }}
            </p>
            <p class="text-xs text-surface-400 mt-1">{{ 'search.home.step4_desc' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Two columns: tech stack + features -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Tech stack -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">
            {{ 'search.home.tech_title' | translate }}
          </h2>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <span
                class="shrink-0 mt-0.5 h-6 w-6 rounded bg-green-500/15 flex items-center justify-center text-xs font-bold text-green-400"
                >Py</span
              >
              <span class="text-sm text-surface-300"
                >FastAPI — Framework HTTP para la Search API</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="shrink-0 mt-0.5 h-6 w-6 rounded bg-blue-500/15 flex items-center justify-center"
              >
                <svg
                  class="h-3.5 w-3.5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3"
                  />
                </svg>
              </span>
              <span class="text-sm text-surface-300"
                >sentence-transformers — Modelo all-MiniLM-L6-v2 local</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="shrink-0 mt-0.5 h-6 w-6 rounded bg-purple-500/15 flex items-center justify-center"
              >
                <svg
                  class="h-3.5 w-3.5 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7"
                  />
                </svg>
              </span>
              <span class="text-sm text-surface-300"
                >ChromaDB — Vector store para similitud coseno</span
              >
            </li>
            <li class="flex items-start gap-3">
              <span
                class="shrink-0 mt-0.5 h-6 w-6 rounded bg-amber-500/15 flex items-center justify-center"
              >
                <svg
                  class="h-3.5 w-3.5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </span>
              <span class="text-sm text-surface-300"
                >PostgreSQL — Metadata y estado de documentos</span
              >
            </li>
          </ul>
        </div>

        <!-- Key features -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">
            {{ 'search.home.features_title' | translate }}
          </h2>
          <ul class="space-y-3">
            @for (feat of features; track feat) {
              <li class="flex items-start gap-2 text-sm text-surface-300">
                <svg
                  class="h-4 w-4 text-green-400 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ feat | translate }}
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- CTA buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <a routerLink="/search/documents" class="btn-primary btn-lg">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          {{ 'search.home.view_documents' | translate }}
        </a>
        <a routerLink="/search/query" class="btn-secondary btn-lg">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {{ 'search.home.view_search' | translate }}
        </a>
      </div>
    </div>
  `,
})
export class SearchHomeComponent {
  readonly features = [
    'search.home.feat_local',
    'search.home.feat_no_cost',
    'search.home.feat_pdf',
    'search.home.feat_chunking',
    'search.home.feat_cosine',
  ];
}
