import { SelectableValue } from '@grafana/data';
import { Button, Input, Label, Select, Stack } from '@grafana/ui';
import { entityKindsToEntityNames, healthRuleEntityKinds, selectWidth } from '../../constants';
import React, { memo, useEffect, useState } from 'react';
import { HealthRuleQuery } from 'types';
import { loadApplicationList, loadHealthRuleList } from 'dsQuery';


interface Props {
    rule: HealthRuleQuery;
    datasourceId: number;
    onChange: (rule: HealthRuleQuery) => void;
    onDelete: () => void;
}

export const HealthRuleForm = memo<Props>(function HealthRuleForm(props: Props) {
    const { rule, onChange, onDelete, datasourceId } = props;

    const [applicationList, setApplicationList] = useState<Array<SelectableValue<string>>>([]);
    const [healthRuleList, setHealthRuleList] = useState<Array<SelectableValue<string>>>([]);

    useEffect(() => {
        loadApplicationList(datasourceId).then((results) => {
            setApplicationList(results);
        });
    }, [datasourceId]);

    useEffect(() => {
        if (rule.healthRuleEntityKind.value === 'APP') {
            loadHealthRuleList(datasourceId, rule.healthRuleEntityKind, rule.application).then((result) => {
                setHealthRuleList(result);
            });
        } else {
            const key = rule.healthRuleEntityKind.value as keyof object;
            loadHealthRuleList(
                datasourceId,
                rule.healthRuleEntityKind,
                entityKindsToEntityNames[key],
            ).then((result) => {
                setHealthRuleList(result);
            });
        }
    }, [rule.healthRuleEntityKind, rule.application, datasourceId]);

    const onEntityKindChange = (e: SelectableValue) => {
        if (e.value === 'APP') {
            onChange({...rule, healthRuleEntityKind: e, healthRule: {}/*, application: {}*/})
        } else {
            // const key = e.value as keyof object;
            onChange({...rule, healthRuleEntityKind: e, healthRule: {}/*, application: entityKindsToEntityNames[key]*/})
        }
    }

    const onApplicationChange = (e: any) => {
        onChange({...rule, application: e, healthRule: {}})
    }

    return (
        <>
            <Stack direction='row' justifyContent='start' gap={1}>
                <Select
                    width={selectWidth}
                    value={rule.healthRuleEntityKind || undefined}
                    options={healthRuleEntityKinds}
                    onChange={onEntityKindChange}
                    placeholder="Entity Kind"
                />
                {rule.healthRuleEntityKind?.value === 'APP' && (
                    <Select
                        width={selectWidth}
                        value={rule.application || undefined}
                        options={applicationList}
                        onChange={onApplicationChange}
                        placeholder="Select Application"
                        showAllSelectedWhenOpen={true}
                        isSearchable
                    />
                )}
                {rule.healthRuleEntityKind?.value !== 'APP' && (
                    <Select width={selectWidth} disabled onChange={() => {}} placeholder=""></Select>
                )}
                <Select
                    width={selectWidth}
                    value={rule.healthRule || undefined}
                    options={healthRuleList}
                    onChange={(e) => onChange({...rule, healthRule: e})}
                    placeholder="Select HealthRule"
                    showAllSelectedWhenOpen={true}
                    isSearchable
                />
                <Label description="Normal/Warn/Crit">Metric Values</Label>
                <Input
                    width={8}
                    value={rule.normal || 0}
                    onChange={(e) => onChange({...rule, normal: +e.currentTarget.value})}
                    label="Normal"
                    type="number"
                />
                <Input
                    width={8}
                    value={rule.warning}
                    onChange={(e) => onChange({...rule, warning: +e.currentTarget.value})}
                    label="Warning"
                    type="number"
                />
                <Input
                    width={8}
                    value={rule.critical}
                    onChange={(e) => onChange({...rule, critical: +e.currentTarget.value})}
                    label="Critical"
                    type="number"
                />
                <Button onClick={onDelete}>Delete</Button>
            </Stack>
        </>
    );
});
