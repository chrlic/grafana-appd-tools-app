package main

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"

	"github.com/gorilla/mux"

	"github.com/google/cel-go/cel"
)

// Make sure App implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. Plugin should not implement all these interfaces - only those which are
// required for a particular task.
var (
	_ backend.CallResourceHandler   = (*App)(nil)
	_ instancemgmt.InstanceDisposer = (*App)(nil)
	_ backend.CheckHealthHandler    = (*App)(nil)
)

// App is an example app backend plugin which can respond to data queries.
type App struct {
	backend.CallResourceHandler
	config *AppConfig
}

// NewApp creates a new example *App instance.
func NewApp(ctx context.Context, settings backend.AppInstanceSettings) (instancemgmt.Instance, error) {
	var app App

	jsonDataRaw := settings.JSONData
	var config AppConfig
	err := json.Unmarshal(jsonDataRaw, &config)
	if err != nil {
		log.DefaultLogger.Error("Can't parse configuration data", "error", err)
		return nil, err
	}

	log.DefaultLogger.Info("Configuration: ", "config", config)

	app.UpdateConfig(config)

	// Use a httpadapter (provided by the SDK) for resource calls. This allows us
	// to use a *http.ServeMux for resource calls, so we can map multiple routes
	// to CallResource without having to implement extra logic.
	mux := mux.NewRouter()
	app.registerRoutes(mux)
	app.CallResourceHandler = httpadapter.New(mux)

	return &app, nil
}

func (a *App) VerifyConfig(config AppConfig) error {
	for _, chr := range config.Rules {
		env, err := cel.NewEnv(cel.Variable("name", cel.StringType))
		// Check err for environment setup errors.
		if err != nil {
			log.DefaultLogger.Error("Cannot create cel-go environment")
		}
		_, iss := env.Compile(chr.CombinedHealthExpression)
		// Check iss for compilation errors.
		if iss.Err() != nil {
			log.DefaultLogger.Error("Cannot compile expression for CHR",
				"CHR", chr.Name, "error", iss.String(), "expression", chr.CombinedHealthExpression)
			return iss.Err()
		}
	}
	return nil
}

func (a *App) UpdateConfig(config AppConfig) error {
	err := a.VerifyConfig(config)
	if err != nil {
		return err
	}

	for _, chr := range config.Rules {
		env, err := cel.NewEnv(cel.Variable("name", cel.StringType))
		// Check err for environment setup errors.
		if err != nil {
			log.DefaultLogger.Error("Cannot create cel-go environment")
		}
		ast, iss := env.Compile(chr.CombinedHealthExpression)
		// Check iss for compilation errors.
		if iss.Err() != nil {
			log.DefaultLogger.Error("Cannot compile expression for CHR",
				"CHR", chr.Name, "error", iss, "expression", chr.CombinedHealthExpression)
		}
		prg, err := env.Program(ast)
		if err != nil {
			log.DefaultLogger.Error("Cannot create program fo expression for CHR",
				"CHR", chr.Name, "error", err, "expression", chr.CombinedHealthExpression)
		}
		chr.CompiledExpression = prg

		a.config = &config
	}
	return nil
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created.
func (a *App) Dispose() {
	// cleanup
}

// CheckHealth handles health checks sent from Grafana to the plugin.
func (a *App) CheckHealth(_ context.Context, _ *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "ok",
	}, nil
}
