import { SelectableValue } from "@grafana/data";
import { getBackendSrv } from "@grafana/runtime";

export const loadApplicationList = (datasourceId: number): Promise<Array<SelectableValue<string>>> => {
    console.log('loadApplicationList', datasourceId);
    const queries = {
      queries: [
        {
          queryKind: { label: 'Applications', value: 'Applications' },
          metricKind: { label: 'Application', value: 'APP' },
          refId: 'A',
          withStreaming: true,
          datasourceId: datasourceId,
          intervalMs: 1000,
          maxDataPoints: 1000,
        },
      ],
      from: '' + Date.now(),
      to: '' + Date.now(),
    };

    // console.log('Backend srv', getBackendSrv());
    const responsePromise = getBackendSrv().post('api/ds/query', queries);
    return responsePromise.then((response) => {
      // console.log('Returned', response);
      const applications: Array<SelectableValue<string>> = [];
      const results = response.results;
      const frames = results?.A?.frames;
      let applicationList: string[] = [];
      if (frames !== undefined) {
        applicationList = frames[0]?.data?.values[0];
      }
      // console.log('Backend srv - applications', applicationList);
      applicationList = applicationList.sort();
      for (let i = 0; i < applicationList.length; i++) {
        let app = {
          value: applicationList[i],
          label: applicationList[i],
        };
        applications.push(app);
      }
      console.log('Backend srv - applications', applications);
      return applications;
    });
  };

  export const loadHealthRuleList = (datasourceId: number, entityKind: SelectableValue, application: SelectableValue): Promise<Array<SelectableValue<string>>> => {
    console.log('loadHealthRuleList', datasourceId, entityKind, application);
    const queries = {
      queries: [
        {
          queryKind: { label: 'HealthRules', value: 'HealthRules' },
          metricKind: { label: 'HealthRules', value: 'HealthRules' },
          entityKind: entityKind,
          entityName: application,
          refId: 'A',
          withStreaming: true,
          datasourceId: datasourceId,
          intervalMs: 1000,
          maxDataPoints: 1000,
        },
      ],
      from: '' + Date.now(),
      to: '' + Date.now(),
    };

    // console.log('Backend srv', getBackendSrv());
    const responsePromise = getBackendSrv().post('api/ds/query', queries);
    return responsePromise.then((response) => {
      // console.log('Returned', response);
      const results = response.results;
      const frames = results?.A?.frames;
      const hrs = [];

      let hrList: string[] = [];
      if (frames !== undefined) {
        hrList = frames[0]?.data?.values[0];
      }

      hrList.sort();

      for (let i = 0; i < hrList.length; i++) {
        let hr: SelectableValue<string>;
        console.log('Parsing', hrList[i]);
        hr = JSON.parse(hrList[i]);
        hrs.push(hr);
      }

      return hrs;
    });
  };

export function loadEntityList(datasourceId: number): Promise<Array<SelectableValue<any>>> {
    const queries = {
      queries: [
        {
          queryKind: { label: 'Entities', value: 'Entities' },
          metricKind: { label: 'Entities', value: 'Entities' },
          refId: 'A',
          withStreaming: false,
          datasourceId: datasourceId,
        },
      ],
      from: '' + Date.now(),
      to: '' + Date.now(),
    };

    // console.log('Backend srv', getBackendSrv());
    const responsePromise = getBackendSrv().post('api/ds/query', queries);
    return responsePromise.then((response) => {
      // console.log('Returned', response);
      // const entities: Array<SelectableValue<string>> = [];
      const results = response.results;
      const frames = results?.A?.frames;
      let entityList: any[] = [];
      if (frames !== undefined) {
        entityList = frames[0]?.data?.values[0];
      }
      // console.log('Backend srv - applications', applicationList);
      entityList = entityList.sort((a, b) => {
         if (a.label > b.label) {
          return 1;
         } else if (a.label === b.label) {
          return 0;
         } else {
          return -1;
         };
      });

      // entities.push(...getVariableList());
      console.log('Backend srv - entities', entityList);
      return entityList;
    });
  };
