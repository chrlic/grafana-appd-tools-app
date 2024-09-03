import { SelectableValue } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { Button, Divider, InlineField, Input, Text, Select, Stack, TextArea, Tooltip, Alert } from '@grafana/ui';
import React, { useState } from 'react';
import { CombinedHealthRuleProps, HealthRuleQuery } from 'types';
import { HealthRuleForm } from './HealthRuleForm';
import { appDynamicsDatasourceIdString, defaultHealthRule } from '../../constants';
import { usePluginProps } from 'utils/utils.plugin';
import { slugify } from 'utils/utils';

interface Props {
    disabled: boolean;
    rule: CombinedHealthRuleProps;
    onChange: (rule: CombinedHealthRuleProps) => void;
}

export const CombinedHealthRule = function (props: Props) {
    const { rule, onChange, disabled } = props;

    const pluginProps = usePluginProps();
    const [alert, setAlert] = useState<string>('');

    const selectWidth = 50;

    const getDatasources = () => {
        const datasources = getDataSourceSrv().getList();
        const dsList: SelectableValue[] = datasources
            .filter((ds) => ds.type === appDynamicsDatasourceIdString)
            .map((ds) => {
                return {
                    value: ds.id,
                    label: ds.name
                }
            });
        return dsList;
    };

    const onHealthRuleQueryAdd = () => {
        onChange({...rule, healthRuleQueries: [...rule.healthRuleQueries, defaultHealthRule]})
    };

    const onHealthRuleQueryDelete = (i: number) => {
        const queries = rule.healthRuleQueries;
        queries.splice(i, 1);
        onChange({...rule, healthRuleQueries: queries});
    };

    const onHealthRuleChange = (hrQuery: HealthRuleQuery, i: number) => {
        const queries = rule.healthRuleQueries;
        queries[i] = hrQuery;
        onChange({...rule, healthRuleQueries: queries});
    };

    const uriPath = (str: string) => {
        let path = "/api/plugins/" + pluginProps?.meta.id + '/resources/health/' + str;
        return path
    }

    const uriTooltip = `URI path can be used with following queries:
    - result=single/average/timeseries (default = single)
    - from=date from in ms
    - to=date to in ms
    `;

    const toClipboard = (str: string)  => {
        navigator.clipboard.writeText(str);
        // Alert the copied text
        setAlert(str);
        setTimeout(function() { setAlert(''); }, 2000);
      }
      
    if (disabled) {
        return (<></>);
    } else {
        return (
            <Stack direction='column' justifyContent='start' alignItems='flex-start' gap={1}>
                <Text element='h4'>Combined Health Rule</Text>
                <Stack direction='row' justifyContent='start' gap={1}>
                    <InlineField label="Name:">
                        <Input
                            value={rule?.name}
                            placeholder="Combined Health Rule Name"
                            onChange={(e) => onChange({ ...rule, name: e.currentTarget.value, urlId: slugify(e.currentTarget.value) })}
                        />
                    </InlineField>
                    <Tooltip content={uriTooltip} placement="bottom">
                        <Button
                            variant='secondary'
                            icon='copy'
                            onClick={() => toClipboard(uriPath(rule?.urlId))}
                        >
                            {'URI Path for result: ' + uriPath(rule?.urlId)}
                        </Button>
                    </Tooltip>
                </Stack>
                { alert !== '' &&
                        <Alert title='Copied to clipboard:' severity={'success'}>
                            {alert}
                        </Alert>
                }
                <Stack direction='row' justifyContent='start' gap={1}>
                    <InlineField label="Datasource:">
                        <Select
                            value={rule?.datasource}
                            width={selectWidth}
                            options={getDatasources()}
                            onChange={(e) => onChange({ ...rule, datasource: e, healthRuleQueries: []})}
                        />
                    </InlineField>
                </Stack>
                <Divider direction='horizontal' spacing={2}/>
                <Button onClick={onHealthRuleQueryAdd} size='md'>Add Query</Button>
                <Text element='h4'>Health Rule Queries:</Text>
                {
                    rule.healthRuleQueries.map((r, i) => {
                        return(
                            <>
                                <HealthRuleForm
                                    key={'hrf-key-' + i}
                                    rule={r}
                                    onChange={(rule) => onHealthRuleChange(rule, i)}
                                    onDelete={() => onHealthRuleQueryDelete(i)}
                                    datasourceId={rule.datasource.value}
                                />
                            </>
                        );
                    })
                }
                <TextArea
                    value={rule.combinedHealthExpression}
                    invalid={false}
                    placeholder="Combined Health Expression"
                    cols={20}
                    rows={5}
                    onChange={(e) => onChange({ ...rule, combinedHealthExpression: e.currentTarget.value })}
                />
            </Stack>
        );
    }
};
