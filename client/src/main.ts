import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { apiInterceptor } from './app/interceptors/api-interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from './environments/environment';
import { ThemeService } from './app/services/theme.service';

// Apply the saved appearance before Ionic creates its first view. This keeps
// every route consistent after a mobile refresh, not only the Settings page.
const themeService = new ThemeService();
themeService.initialize();

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy,
    },

    provideIonicAngular(),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),

    provideHttpClient(
      withInterceptors([
        apiInterceptor,
      ])
    ),

    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
});
