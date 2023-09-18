import {
  BarChartRounded,
  ErrorRounded,
  GroupRounded,
  LockRounded,
  PersonAddRounded,
  PersonRounded,
  SettingsRounded,
  Shop2Rounded,
  Domain,
  AccountTreeRounded,
  ModelTraining,
  Poll,
} from '@mui/icons-material';
import { SvgIcon } from '@mui/material';

export function getItems(labels) {
  const items = [
    {
      title: 'Dashboard',
      path: '/',
      icon: (
        <SvgIcon fontSize="small">
          <BarChartRounded />
        </SvgIcon>
      ),
    },
    {
      title: labels?.user?.plural || 'Users',
      path: '/users',
      icon: (
        <SvgIcon fontSize="small">
          <GroupRounded />
        </SvgIcon>
      ),
    },
    {
      title: labels?.module?.plural || 'Modules',
      path: '/modules',
      icon: (
        <SvgIcon fontSize="small">
          <ModelTraining />
        </SvgIcon>
      ),
    },
    {
      title: labels?.evaluation?.plural || 'Evaluations',
      path: '/evaluations',
      icon: (
        <SvgIcon fontSize="small">
          <Poll />
        </SvgIcon>
      ),
    },
    {
      title: 'Organization',
      children: [
        {
          title: labels?.domain?.plural || 'Domains',
          path: '/domains',
          icon: (
            <SvgIcon fontSize="small">
              <Domain />
            </SvgIcon>
          ),
        },
        {
          title: labels?.department?.plural || 'Departments',
          path: '/departments',
          icon: (
            <SvgIcon fontSize="small">
              <AccountTreeRounded />
            </SvgIcon>
          ),
        },
      ],
    },
  ];

  return items;
}
