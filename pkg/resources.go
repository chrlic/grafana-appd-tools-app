package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"

	"github.com/gorilla/mux"
)

// /api/plugins/app-with-backend/resources/ping

// handlePing is an example HTTP GET resource that returns a {"message": "ok"} JSON response.
func (a *App) handlePing(w http.ResponseWriter, req *http.Request) {
	ctxLogger := log.DefaultLogger.FromContext(req.Context())
	w.Header().Add("Content-Type", "application/json")
	if _, err := w.Write([]byte(`{"message": "pong"}`)); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	ctxLogger.Info("ping received")
	w.WriteHeader(http.StatusOK)
}

// handleEcho is an example HTTP POST resource that accepts a JSON with a "message" key and
// returns to the client whatever it is sent.
func (a *App) handleEcho(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		Message string `json:"message"`
	}
	if err := json.NewDecoder(req.Body).Decode(&body); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(body); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (a *App) handleConfig(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var config AppConfig
	if err := json.NewDecoder(req.Body).Decode(&config); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.DefaultLogger.Info("Configuration updated", "config", config)

	a.config = &config

	w.Header().Add("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode("{result: success}"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (a *App) handleHealthQuery(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	config := a.config
	vars := mux.Vars(req)
	chRule := vars["chrule"]
	urlQuery := req.URL.Query()

	maxDataPoints := 1000
	if urlQuery.Get("maxDataPoints") != "" {
		maxDataPoints, _ = strconv.Atoi(urlQuery.Get("maxDataPoints"))
	}

	fromStr := urlQuery.Get("from")
	toStr := urlQuery.Get("to")
	lastStr := urlQuery.Get("last")

	if lastStr != "" {

	} else {
		if fromStr == "" {
			fromStr = fmt.Sprintf("%d", time.Now().UnixMilli()-(1000*60*60)) // -1h
		}
		if toStr == "" {
			toStr = fmt.Sprintf("%d", time.Now().UnixMilli())
		}
	}

	log.DefaultLogger.Info("Handling CHR request", "url", req.URL.Path, "query", req.URL.Query(), "chr", chRule)

	var rule CombinedHealthRule
	found := false
	for _, r := range config.Rules {
		if r.UrlId == chRule {
			rule = r
			found = true
		}
	}

	w.Header().Add("Content-Type", "application/json")
	if !found {
		http.Error(w, fmt.Errorf("cannot find combined health rule %s", chRule).Error(), http.StatusInternalServerError)
		return
	}

	log.DefaultLogger.Info("Handling CHR request - 1")

	queries := []AppDynamicsDatasourceQuery{}
	for i, query := range rule.HealthRuleQueries {
		adq := AppDynamicsDatasourceQuery{
			DatasourceID:  asInt(rule.Datasource.Value),
			Datasource:    rule.Datasource,
			EntityKind:    query.HealthRuleEntityKind,
			EntityName:    query.Application,
			MaxDataPoints: maxDataPoints,
			HealthRule:    query.HealthRule,
			HealthRuleProps: HealthRuleProps{
				Normal:   query.Normal,
				Warning:  query.Warning,
				Critical: query.Critical,
			},
			HealthRuleSplitByNull: query.SplitOnChange,
			HealthRuleIntervals:   query.SingleSeries,
			MetricAggregation: SelectableValue{
				Value: "Value",
				Label: "Value",
			},
			MetricKind: SelectableValue{
				Value: "HRULE",
				Label: "Health Rule",
			},
			MetricPath: "",
			RefID:      string('A' + i),
			ShiftBy: SelectableValue{
				Value: "Current",
				Label: "0",
			},
		}
		queries = append(queries, adq)
	}

	log.DefaultLogger.Info("Handling CHR request - 2")

	query := GrafanaQuery{
		Queries: queries,
		From:    fromStr,
		To:      toStr,
	}

	jsonData, err := json.Marshal(&query)
	if err != nil {
		log.DefaultLogger.Error("Error marshalling query data:", "error", err)
		return
	}

	log.DefaultLogger.Info("Handling CHR request - 3", "query", string(jsonData))

	url := config.BackendHostUrl + "/api/ds/query?ds_type=appdynamics-be-ds-plugin"

	httpReq, err := http.NewRequest("POST", url, bytes.NewReader(jsonData))
	if err != nil {
		log.DefaultLogger.Error("Error creating request:", "error", err)
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+a.config.ApiToken)

	client := http.Client{}
	response, err := client.Do(httpReq)
	if err != nil {
		log.DefaultLogger.Error("Error making request:", "error", err)
		return
	}

	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		log.DefaultLogger.Error("Error reading response body:", "error", err)
		return
	}

	log.DefaultLogger.Info("Response body:", "body", string(body))

	if err := json.NewEncoder(w).Encode("{result: success}"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// registerRoutes takes a *http.ServeMux and registers some HTTP handlers.
func (a *App) registerRoutes(mux *mux.Router) {
	mux.HandleFunc("/ping", a.handlePing)
	mux.HandleFunc("/echo", a.handleEcho)
	mux.HandleFunc("/config", a.handleConfig)
	mux.HandleFunc("/health/{chrule}", a.handleHealthQuery)
}
