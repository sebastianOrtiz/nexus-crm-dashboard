import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchDocument } from '../../core/models/search.model';
import { SearchService } from '../../core/services/search.service';
import { TranslateService } from '../../core/services/translate.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

type BadgeVariant = 'warning' | 'success' | 'danger' | 'default';

/** Documents management page — upload and list indexed documents */
@Component({
  selector: 'app-search-documents',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    UpperCasePipe,
    BadgeComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    TranslatePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-surface-100">{{ 'search.documents' | translate }}</h1>
          <p class="text-sm text-surface-400 mt-1">{{ 'search.subtitle' | translate }}</p>
        </div>

        <!-- Upload button -->
        <label
          class="btn-primary cursor-pointer flex items-center gap-2"
          [class.opacity-60]="uploading()"
          [class.pointer-events-none]="uploading()"
        >
          @if (uploading()) {
            <app-loading-spinner size="sm" />
            {{ 'search.documents.uploading' | translate }}
          } @else {
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            {{ 'search.documents.upload' | translate }}
          }
          <input
            type="file"
            accept=".pdf,.txt,.md"
            class="sr-only"
            [disabled]="uploading()"
            (change)="onFileSelected($event)"
          />
        </label>
      </div>

      <!-- Drag & drop zone -->
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
        [class]="
          dragOver()
            ? 'border-primary-500 bg-primary-500/5'
            : 'border-surface-600 hover:border-surface-500'
        "
        (dragover)="onDragOver($event)"
        (dragleave)="dragOver.set(false)"
        (drop)="onDrop($event)"
      >
        <svg
          class="h-10 w-10 mx-auto text-surface-500 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p class="text-sm text-surface-400">
          Arrastra un archivo PDF o texto aquí, o
          <label class="text-primary-400 hover:text-primary-300 cursor-pointer font-medium">
            selecciona uno
            <input
              type="file"
              accept=".pdf,.txt,.md"
              class="sr-only"
              [disabled]="uploading()"
              (change)="onFileSelected($event)"
            />
          </label>
        </p>
        <p class="text-xs text-surface-500 mt-1">PDF, TXT, MD — máximo 10MB</p>
      </div>

      <!-- Success / error banner -->
      @if (successMessage()) {
        <div
          class="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-600/30 px-4 py-3 text-sm text-green-400"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {{ successMessage() }}
        </div>
      }

      @if (errorMessage()) {
        <div
          class="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-600/30 px-4 py-3 text-sm text-red-400"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ errorMessage() }}
        </div>
      }

      <!-- Documents list -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <app-loading-spinner size="lg" />
        </div>
      } @else if (documents().length === 0) {
        <app-empty-state
          [title]="'search.documents.empty' | translate"
          [description]="'search.documents.empty_desc' | translate"
        />
      } @else {
        <div class="grid grid-cols-1 gap-3">
          @for (doc of documents(); track doc.id) {
            <div class="card flex items-center gap-4">
              <!-- File icon -->
              <div
                class="shrink-0 h-10 w-10 rounded-lg bg-surface-700 flex items-center justify-center"
              >
                <svg
                  class="h-5 w-5 text-surface-400"
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
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-medium text-surface-100 truncate">{{
                    doc.filename
                  }}</span>
                  <app-badge
                    [label]="statusLabel(doc.status)"
                    [variant]="statusVariant(doc.status)"
                  />
                </div>
                <div class="flex items-center gap-3 mt-1 text-xs text-surface-400">
                  <span>{{ doc.fileType | uppercase }}</span>
                  <span>&middot;</span>
                  <span>{{ doc.fileSize | number }} bytes</span>
                  <span>&middot;</span>
                  <span>{{ doc.chunkCount }} chunks</span>
                  <span>&middot;</span>
                  <span>{{ doc.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>

              <!-- Delete button -->
              <button
                class="btn-secondary btn-sm shrink-0 text-red-400 hover:text-red-300"
                (click)="confirmDelete(doc)"
                [title]="'search.documents.delete_title' | translate"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          }
        </div>
      }
    </div>

    <!-- Confirm delete dialog -->
    <app-confirm-dialog
      [isOpen]="confirmOpen()"
      [title]="'search.documents.delete_title' | translate"
      [message]="deleteMessage()"
      (confirm)="deleteDocument()"
      (cancel)="confirmOpen.set(false)"
    />
  `,
})
export class SearchDocumentsComponent implements OnInit {
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly dragOver = signal(false);
  readonly documents = signal<SearchDocument[]>([]);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly confirmOpen = signal(false);
  readonly deleteMessage = signal('');

  private pendingDeleteId = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.upload(file);
    }
    // Reset so the same file can be re-selected after error
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.upload(file);
    }
  }

  confirmDelete(doc: SearchDocument): void {
    this.pendingDeleteId = doc.id;
    this.deleteMessage.set(this.translate.t('search.documents.delete_msg', { name: doc.filename }));
    this.confirmOpen.set(true);
  }

  deleteDocument(): void {
    this.confirmOpen.set(false);
    this.searchService
      .deleteDocument(this.pendingDeleteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.documents.update((docs) => docs.filter((d) => d.id !== this.pendingDeleteId));
          this.showSuccess(this.translate.t('search.documents.deleted'));
        },
        error: () => {
          this.showError('error.generic');
        },
      });
  }

  statusLabel(status: string): string {
    return this.translate.t(`search.documents.status.${status}`);
  }

  statusVariant(status: string): BadgeVariant {
    switch (status) {
      case 'indexed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  }

  private upload(file: File): void {
    this.clearMessages();
    this.uploading.set(true);
    this.searchService
      .uploadDocument(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          this.documents.update((docs) => [doc, ...docs]);
          this.uploading.set(false);
          this.showSuccess(this.translate.t('search.documents.uploaded'));
        },
        error: () => {
          this.uploading.set(false);
          this.showError('error.generic');
        },
      });
  }

  private loadDocuments(): void {
    this.loading.set(true);
    this.searchService
      .listDocuments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (docs) => {
          this.documents.set(docs);
          this.loading.set(false);
        },
        error: () => {
          this.documents.set([]);
          this.loading.set(false);
        },
      });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    this.errorMessage.set('');
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  private showError(key: string): void {
    this.errorMessage.set(this.translate.t(key));
    this.successMessage.set('');
    setTimeout(() => this.errorMessage.set(''), 4000);
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
