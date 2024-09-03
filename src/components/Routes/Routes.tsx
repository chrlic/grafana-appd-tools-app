import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { PageHealthRules } from '../../pages/PageHealthRules';
import { AppConfigComponent } from '../AppConfigComponent';
import { useNavigation, prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { PageTwo } from '../../pages/PageTwo';

export const Routes = (context: any) => {
  useNavigation();

  console.log('Routes context', context);
  console.log('Routes', prefixRoute(`${ROUTES.HR}`));
  return (
    <Switch>
      <Route component={PageTwo} path={prefixRoute(`${ROUTES.Two}`)}/>
      <Route exact path={prefixRoute(`${ROUTES.Config}`)} component={AppConfigComponent} />
      {/* Default page */}
      <Route component={PageHealthRules} />
    </Switch>
  );
};
