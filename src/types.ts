import { SelectableValue } from '@grafana/data';

export interface AppConfig {
    rules: CombinedHealthRuleProps[];
    backendHostUrl: string;
    apiToken: string;
}  

export interface CombinedHealthRuleProps {
    name: string; // combined HR name
    urlId: string; // under this, result will be visible
    datasource: SelectableValue; // datasource to use to pull individual HR's
    healthRuleQueries: HealthRuleQuery[];
    combinedHealthExpression: string;
}

export interface HealthRuleQuery {
    healthRuleEntityKind: SelectableValue; // Application, Infrastructure, Database
    application: SelectableValue; // in case its application only
    healthRule: SelectableValue; // Health Rule pulled from AppD
    singleSeries: boolean; // show as single value series, false = 3 different series normal/warning/critical
    splitOnChange: boolean; // when using single series, remove datapoint between changing series causing a discontinued line
    normal: number; // metric value if condition normal. 0 = omit the metric
    warning: number; // metric value if condition warning. 0 = omit the metric
    critical: number; // metric value if condition critical. 0 = omit the metric
}

