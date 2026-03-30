import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Event Service home — architecture explanation */
@Component({
  selector: 'app-events-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="space-y-8 max-w-4xl mx-auto">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-surface-100">{{ 'events.home.heading' | translate }}</h1>
        <p class="text-sm text-surface-400 mt-2 leading-relaxed max-w-2xl">
          {{ 'events.home.intro' | translate }}
        </p>
      </div>

      <!-- Flow diagram -->
      <div class="card">
        <h2 class="text-base font-semibold text-surface-100 mb-4">
          {{ 'events.home.how_title' | translate }}
        </h2>
        <p class="text-sm text-surface-400 mb-6">
          {{ 'events.home.how_desc' | translate }}
        </p>

        <!-- Pipeline visual -->
        <div class="flex flex-col sm:flex-row items-stretch gap-3">
          <div class="flex-1 rounded-lg border border-surface-600 bg-surface-700/50 p-4 text-center">
            <div class="h-10 w-10 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
              <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">{{ 'events.home.step1_title' | translate }}</p>
            <p class="text-xs text-surface-400 mt-1">{{ 'events.home.step1_desc' | translate }}</p>
          </div>

          <div class="hidden sm:flex items-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div class="sm:hidden flex justify-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div class="flex-1 rounded-lg border border-surface-600 bg-surface-700/50 p-4 text-center">
            <div class="h-10 w-10 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
              <svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">{{ 'events.home.step2_title' | translate }}</p>
            <p class="text-xs text-surface-400 mt-1">{{ 'events.home.step2_desc' | translate }}</p>
          </div>

          <div class="hidden sm:flex items-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div class="sm:hidden flex justify-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div class="flex-1 rounded-lg border border-surface-600 bg-surface-700/50 p-4 text-center">
            <div class="h-10 w-10 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
              <svg class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">{{ 'events.home.step3_title' | translate }}</p>
            <p class="text-xs text-surface-400 mt-1">{{ 'events.home.step3_desc' | translate }}</p>
          </div>

          <div class="hidden sm:flex items-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div class="sm:hidden flex justify-center text-surface-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div class="flex-1 rounded-lg border border-green-600/30 bg-green-500/10 p-4 text-center">
            <div class="h-10 w-10 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-2">
              <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-sm font-medium text-surface-100">{{ 'events.home.step4_title' | translate }}</p>
            <p class="text-xs text-surface-400 mt-1">{{ 'events.home.step4_desc' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Two columns: tech stack + features -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Tech stack -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">
            {{ 'events.home.tech_title' | translate }}
          </h2>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <span class="shrink-0 mt-0.5 h-6 w-6 rounded bg-cyan-500/15 flex items-center justify-center text-xs font-bold text-cyan-400">Go</span>
              <span class="text-sm text-surface-300">{{ 'events.home.tech_go' | translate }}</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="shrink-0 mt-0.5 h-6 w-6 rounded bg-red-500/15 flex items-center justify-center">
                <svg class="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span class="text-sm text-surface-300">{{ 'events.home.tech_redis' | translate }}</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="shrink-0 mt-0.5 h-6 w-6 rounded bg-blue-500/15 flex items-center justify-center">
                <svg class="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" />
                </svg>
              </span>
              <span class="text-sm text-surface-300">{{ 'events.home.tech_pg' | translate }}</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="shrink-0 mt-0.5 h-6 w-6 rounded bg-surface-600 flex items-center justify-center">
                <svg class="h-3.5 w-3.5 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                </svg>
              </span>
              <span class="text-sm text-surface-300">{{ 'events.home.tech_gin' | translate }}</span>
            </li>
          </ul>
        </div>

        <!-- Key features -->
        <div class="card">
          <h2 class="text-base font-semibold text-surface-100 mb-4">
            {{ 'events.home.features_title' | translate }}
          </h2>
          <ul class="space-y-3">
            <li class="flex items-start gap-2 text-sm text-surface-300">
              <svg class="h-4 w-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ 'events.home.feat_idempotent' | translate }}
            </li>
            <li class="flex items-start gap-2 text-sm text-surface-300">
              <svg class="h-4 w-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ 'events.home.feat_retry' | translate }}
            </li>
            <li class="flex items-start gap-2 text-sm text-surface-300">
              <svg class="h-4 w-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ 'events.home.feat_correlation' | translate }}
            </li>
            <li class="flex items-start gap-2 text-sm text-surface-300">
              <svg class="h-4 w-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ 'events.home.feat_graceful' | translate }}
            </li>
            <li class="flex items-start gap-2 text-sm text-surface-300">
              <svg class="h-4 w-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ 'events.home.feat_structured' | translate }}
            </li>
          </ul>
        </div>
      </div>

      <!-- CTA buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <a routerLink="/events/flows" class="btn-primary btn-lg">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {{ 'events.home.view_flows' | translate }}
        </a>
        <a routerLink="/events/timeline" class="btn-secondary btn-lg">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {{ 'events.home.view_events' | translate }}
        </a>
      </div>
    </div>
  `,
})
export class EventsHomeComponent {}
