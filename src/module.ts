import { AppPlugin } from '@grafana/data';
import { App } from './components/App';
import { AppConfigComponent } from './components/AppConfigComponent';

export const plugin = new AppPlugin<{}>().setRootPage(App).addConfigPage({
  title: 'Configuration',
  icon: 'cog',
  body: AppConfigComponent,
  id: 'configuration',
});
