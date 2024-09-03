
GRAFANA_API_KEY ?= "$(shell cat ../../grafana-api-key.secure.txt)"
GRAFANA_ACCESS_POLICY_TOKEN ?= "$(shell cat ../../grafana-signing-policy-token.txt)"
GRAFANA_ROOT_URLS ?= "http://localhost:3000/"

.PHONY: cleanup
cleanup:
	-rm -r dist

.PHONY: frontend
frontend: 
	yarn build

.PHONY: signed-frontend
signed-frontend: 
	yarn build

.PHONY: backend
backend: 
	mage

.PHONY: sign
sign:
	# GRAFANA_API_KEY=${GRAFANA_API_KEY} npx @grafana/sign-plugin@latest --rootUrls ${GRAFANA_ROOT_URLS}
	GRAFANA_ACCESS_POLICY_TOKEN=${GRAFANA_ACCESS_POLICY_TOKEN} npx @grafana/sign-plugin@latest --rootUrls ${GRAFANA_ROOT_URLS}

.PHONY: all
all: cleanup frontend backend sign

.PHONY: restart
restart:
	docker restart grafana

.PHONY: redeploy
redeploy: all restart

.PHONY: release
release: all
	cd .. && zip -r appdynamics-tools-app.zip appdynamics-tools-app/dist
