import { bootstrapApplication } from '@angular/platform-browser';

import './global-extensions';
import AppComponent, { config } from '@/components/app';

bootstrapApplication(AppComponent, config)
  .catch(console.error);
