import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const PIPELINE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pipeline.component').then((m) => m.PipelineComponent),
  },
];
