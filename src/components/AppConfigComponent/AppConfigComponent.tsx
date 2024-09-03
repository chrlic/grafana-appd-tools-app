import React, { ChangeEvent, useState } from 'react';
import { lastValueFrom } from 'rxjs';
import { Button, FieldSet, Input, SecretInput } from '@grafana/ui';
import { PluginConfigPageProps, AppPluginMeta, PluginMeta } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { AppConfig } from '../../types';
import { defaultAppConfig } from '../../constants';

// This to avoid compiler error on assignment of {} to AppConfig without optional fields
interface AppConfigPlaceholder {
  dummy?: any
}

interface Props extends PluginConfigPageProps<AppPluginMeta<AppConfigPlaceholder>> { }

export const AppConfigComponent = ({ plugin }: Props) => {

  const { jsonData } = plugin.meta;
  const jsonDataProperlyTyped = jsonData as AppConfig;

  console.log('Configuration: ', jsonData);

  const [appConfig, setAppConfig] = useState<AppConfig>(jsonDataProperlyTyped || defaultAppConfig);

  const onApiTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
      setAppConfig({...appConfig, apiToken: event.currentTarget.value})
    };

  const onApiTokenReset = () => {
    setAppConfig({...appConfig, apiToken: ''})
  };

  const onBackendUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAppConfig({...appConfig, backendHostUrl: event.currentTarget.value})
  };

  const onSaveConfig = () => {
    updatePluginAndReload(plugin.meta.id, {
      ...plugin?.meta,
      jsonData: appConfig,
    }
);
    updateAppBackendConfig(plugin.meta.id, appConfig)
  }

  return (
    <div>
      <FieldSet label="Backend Configuration">
        <SecretInput
          isConfigured={appConfig.apiToken !== '' && appConfig.apiToken !== undefined}
          value={appConfig.apiToken || ''}
          label="Api Token"
          placeholder="Api Token"
          onReset={onApiTokenReset}
          onChange={onApiTokenChange}
        />
        <Input
          label="Backend Internal Host URL"
          onChange={onBackendUrlChange}
          value={appConfig.backendHostUrl}
          placeholder="Backend Internal Host URL"
        />
        <Button onClick={onSaveConfig}>Save</Button>
      </FieldSet>
    </div>
  );
};

const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta<AppConfig>>) => {
  try {
    await updatePlugin(pluginId, data);

    // Reloading the page as the changes made here wouldn't be propagated to the actual plugin otherwise.
    // This is not ideal, however unfortunately currently there is no supported way for updating the plugin state.
    window.location.reload();
  } catch (e) {
    console.error('Error while updating the plugin', e);
  }
};

export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta<AppConfig>>) => {
  const response = await getBackendSrv().fetch({
    url: `/api/plugins/${pluginId}/settings`,
    method: 'POST',
    data,
  });

  return lastValueFrom(response);
};

export const updateAppBackendConfig = async (pluginId: string, data: AppConfig) => {
  const response = await getBackendSrv().fetch({
    url: `/api/plugins/${pluginId}/resources/config`,
    method: 'POST',
    data,
  });

  return lastValueFrom(response);
};
