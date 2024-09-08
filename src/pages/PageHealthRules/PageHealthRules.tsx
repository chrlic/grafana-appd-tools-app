import React, { useState } from "react";
import { usePluginProps } from '../../utils/utils.plugin';
import { Button, Divider, Select, Stack } from "@grafana/ui";
import { CombinedHealthRule } from "./CombinedHealthRule";
import { AppConfig, CombinedHealthRuleProps } from "types";
import { SelectableValue } from "@grafana/data";
import { defaultAppConfig, defaultCombinedHealthRule, defaultCombinedHealthRuleNamePrefix } from "../../constants";
import _ from 'lodash';
import { getUser, slugify } from "utils/utils";
import { updateAppBackendConfig, updatePlugin } from "components/AppConfigComponent";
import { FetchResponse, getBackendSrv } from "@grafana/runtime";
import { Observable } from "rxjs";

export const PageHealthRules = (pageContext: any) => {

  const pluginProps = usePluginProps();
  console.log('PageHealthRules props', pluginProps);
  getUser();

  const initialAppConfig: AppConfig = defaultAppConfig;
  initialAppConfig.rules = pluginProps?.meta.jsonData?.rules !== undefined ? pluginProps?.meta.jsonData.rules : [];
  initialAppConfig.apiToken = pluginProps?.meta.jsonData?.apiToken;

  const [appConfig, setAppConfig] = useState<AppConfig>(initialAppConfig);
  const [selectedCHR, setSelectedCHR] = useState<number>(0);

  console.log('PageHealthRules appConfig', appConfig);

  const selectWidth = 50;

  const onSelectedCHR = (chr: SelectableValue) => {
    console.log('onSelectedCHR', chr);
    const chrName = chr.label;
    for (let i = 0; i < appConfig.rules.length; i++) {
      if (appConfig.rules[i].name === chrName) {
        setSelectedCHR(i);
        break;
      }
    }
  };

  const addCHR = () => {
    setSelectedCHR(appConfig.rules.length);
    const newCHR = _.cloneDeep(defaultCombinedHealthRule);
    newCHR.name = defaultCombinedHealthRuleNamePrefix + ' ' + (appConfig.rules.length + 1);
    newCHR.urlId = slugify(newCHR.name);
    setAppConfig({...appConfig, rules: [...appConfig.rules, newCHR]});
  };

  const deleteCHR = () => {
    const rules = appConfig.rules;
    rules.splice(selectedCHR, 1);
    setSelectedCHR(0);
    setAppConfig({...appConfig, rules: rules});
  };

  const onCHRChange = (chr: CombinedHealthRuleProps) => {
    console.log('onCHRChange', chr);
    const rules = appConfig.rules;
    rules[selectedCHR] = chr;
    setAppConfig({...appConfig, rules: rules});
  }

  const saveAppConfig = () => {
    // todo - filter for empty CRHs and don't save them
    console.log('Save App Config', appConfig);
    updatePlugin(
      pluginProps?.meta.id || '',
      {
        ...pluginProps?.meta,
        jsonData: appConfig,
      }
    );
    updateAppBackendConfig(pluginProps?.meta.id || '', appConfig);
  };

  const verifyAppConfig = () => {
    const response = getBackendSrv().post(`/api/plugins/${pluginProps?.meta.id}/verify`, appConfig);
    response.then((response) => {
      if (response.status === 'failure') {

      } else {
        
      }
    })
  
  };
  
  return (
    <Stack direction='column' gap={1} justifyContent='start'>
      <Stack direction='row' gap={1} justifyContent='start'>
        <Select
          placeholder="Select Combined Health Rule"
          value={appConfig?.rules[selectedCHR]?.name || ''}
          width={selectWidth}
          options={appConfig?.rules.map((rule) => { return { value: rule.name, label: rule.name }})}
          onChange={(e) => onSelectedCHR(e)}
        />
        <Button onClick={addCHR}>Add</Button>
        <Button onClick={deleteCHR}>Delete</Button>
        <Button onClick={verifyAppConfig}>Verify</Button>
        <Button onClick={saveAppConfig}>Save</Button>
      </Stack>
      <Divider direction='horizontal' spacing={1} />
      <CombinedHealthRule
          disabled={appConfig.rules[selectedCHR] === undefined}
          rule={appConfig.rules[selectedCHR]}
          onChange={onCHRChange}
      />
    </Stack>
  );
}; 


function lastValueFrom(response: Observable<FetchResponse<unknown>>) {
  throw new Error("Function not implemented.");
}

