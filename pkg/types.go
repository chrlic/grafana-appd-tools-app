package main

type AppConfig struct {
	Rules          []CombinedHealthRule `json:"rules"`
	BackendHostUrl string               `json:"backendHostUrl"`
	ApiToken       string               `json:"apiToken"`
}

type CombinedHealthRule struct {
	Name                     string            `json:"name"`       // combined HR name
	UrlId                    string            `json:"urlId"`      // under this, result will be visible
	Datasource               SelectableValue   `json:"datasource"` // datasource to use to pull individual HR's
	HealthRuleQueries        []HealthRuleQuery `json:"healthRuleQueries"`
	CombinedHealthExpression string            `json:"combinedHealthExpression"`
}

type HealthRuleQuery struct {
	HealthRuleEntityKind SelectableValue `json:"healthRuleEntityKind"` // Application, Infrastructure, Database
	Application          SelectableValue `json:"application"`          // in case its application only
	HealthRule           SelectableValue `json:"healthRule"`           // Health Rule pulled from AppD
	SingleSeries         bool            `json:"singleSeries"`         // show as single value series, false = 3 different series normal/warning/critical
	SplitOnChange        bool            `json:"splitOnChange"`        // when using single series, remove datapoint between changing series causing a discontinued line
	Normal               int             `json:"normal"`               // metric value if condition normal. 0 = omit the metric
	Warning              int             `json:"warning"`              // metric value if condition warning. 0 = omit the metric
	Critical             int             `json:"critical"`             // metric value if condition critical. 0 = omit the metric
}

type GrafanaQuery struct {
	Queries []AppDynamicsDatasourceQuery `json:"queries"`
	From    string                       `json:"from"`
	To      string                       `json:"to"`
}

type HealthRuleProps struct {
	Critical int `json:"critical"`
	Normal   int `json:"normal"`
	Warning  int `json:"warning"`
}

type SelectableValue struct {
	Label string `json:"label"`
	Value any    `json:"value"`
}

type TraceQuery struct {
	RootSpansOnly bool  `json:"rootSpansOnly"`
	Rules         []any `json:"rules"`
	SmartOptions  bool  `json:"smartOptions"`
}

type AppDynamicsDatasourceQuery struct {
	AppOrInfra            bool            `json:"appOrInfra"`
	Datasource            SelectableValue `json:"datasource"`
	EntityKind            SelectableValue `json:"entityKind"`
	EntityName            SelectableValue `json:"entityName"`
	HealthRule            SelectableValue `json:"healthRule"`
	HealthRuleIntervals   bool            `json:"healthRuleIntervals"`
	HealthRuleProps       HealthRuleProps `json:"healthRuleProps"`
	HealthRuleSplitByNull bool            `json:"healthRuleSplitByNull,omitempty"`
	MetricAggregation     SelectableValue `json:"metricAggregation"`
	MetricKind            SelectableValue `json:"metricKind"`
	MetricPath            string          `json:"metricPath"`
	RefID                 string          `json:"refId"`
	ShiftBy               SelectableValue `json:"shiftBy"`
	TraceQuery            TraceQuery      `json:"traceQuery"`
	WithStreaming         bool            `json:"withStreaming"`
	TraceID               string          `json:"traceId"`
	AdqlQuery             string          `json:"adqlQuery"`
	DatasourceID          int             `json:"datasourceId"`
	IntervalMs            int             `json:"intervalMs"`
	MaxDataPoints         int             `json:"maxDataPoints"`
	Hide                  bool            `json:"hide,omitempty"`
}

type GrafanaQueryResponse struct {
	Results map[string]OneQueryResponse `json:"results"`
}

type OneQueryResponse struct {
	Status int                    `json:"status"`
	Frames []GrafanaResponseFrame `json:"frames"`
}

type GrafanaResponseFrame struct {
	Schema GrafanaResponseSchema `json:"schema"`
	Data   GrafanaResponseData   `json:"data"`
}

type GrafanaResponseSchema struct {
	Name   string                 `json:"name"`
	RefID  string                 `json:"refId"`
	Fields []GrafanaResponseField `json:"fields"`
}

type GrafanaResponseField struct {
	Name     string               `json:"name"`
	Type     string               `json:"type"`
	TypeInfo GrafanaFieldTypeInfo `json:"typeInfo,omitempty"`
}

type GrafanaFieldTypeInfo struct {
	Frame    string `json:"frame"`
	Nullable bool   `json:"nullable"`
}

type GrafanaResponseData struct {
	Values [][]any `json:"values"`
}
