import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withViewTransitions
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withViewTransitions()
    )
  ]
};