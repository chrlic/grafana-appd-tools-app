import { NavModelItem } from '@grafana/data';
import pluginJson from './plugin.json';
import { AppConfig, CombinedHealthRuleProps, HealthRuleQuery } from 'types';

export const PLUGIN_ID = `${pluginJson.id}`
export const PLUGIN_BASE_URL = `/a/${PLUGIN_ID}`;

export enum ROUTES {
  HR = 'hr',
  Two = 'two',
  Config = 'config'
}

export const NAVIGATION_TITLE = 'AppDynamics Tools';
export const NAVIGATION_SUBTITLE = 'Tools to work with AppDynamics data';

// Add a navigation item for each route you would like to display in the navigation bar
export const NAVIGATION: Record<string, NavModelItem> = {
  [ROUTES.HR]: {
    id: ROUTES.HR,
    text: 'Combined Health Rules',
    icon: 'exclamation-triangle',
    url: `${PLUGIN_BASE_URL}/hr`,
  },
  [ROUTES.Two]: {
    id: ROUTES.Two,
    text: 'Page Two',
    icon: 'database',
    url: `${PLUGIN_BASE_URL}/two`,
  },
  [ROUTES.Config]: {
    id: ROUTES.Config,
    text: 'Configuration',
    icon: 'cog',
    url: `plugins/${PLUGIN_ID}`
  }
};

export const selectWidth=25;
export const labelWidth=20;

// following MUST match AppDynamics datasource internal id
export const appDynamicsDatasourceIdString = 'appdynamics-be-ds-plugin';

export const defaultBackendHostUrl = 'http://localhost:3000';

export const healthRuleEntityKinds = [
  { label: 'Application', value: 'APP' },
  { label: 'Infrastructure', value: 'INFRA' },
  { label: 'Database', value: 'DB' },
];

export const entityKindsToEntityNames = {
  'INFRA': { label: "Infrastructure", value: "Server & Infrastructure Monitoring" },
  'DB': {label: "Database", value: "Database Monitoring"},
};

export const defaultAppConfig: AppConfig = {
  rules: [],
  backendHostUrl: defaultBackendHostUrl,
  apiToken: ''
};

export const defaultCombinedHealthRuleNamePrefix = "Combined Health Rule";
export const defaultCombinedHealthRule: CombinedHealthRuleProps = {
  name: '',
  urlId: '',
  datasource: { value: '', label: ''},
  healthRuleQueries: [],
  combinedHealthExpression: '',
};

export const defaultHealthRule: HealthRuleQuery = {
  healthRuleEntityKind: { label: '', value: '' },
  application: { label: '', value: '' },
  healthRule: { label: '', value: '' },
  singleSeries: true,
  splitOnChange: false,
  normal: 100,
  warning: 50,
  critical: 0,
}
