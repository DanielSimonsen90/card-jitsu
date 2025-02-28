import { bootstrapApplication } from '@angular/platform-browser';
import AppComponent, { config } from '@/components/app';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
