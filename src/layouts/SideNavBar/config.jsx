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

export const items = [
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
    title: 'Users',
    path: '/users',
    icon: (
      <SvgIcon fontSize="small">
        <GroupRounded />
      </SvgIcon>
    ),
  },
  {
    title: 'Modules',
    path: '/modules',
    icon: (
      <SvgIcon fontSize="small">
        <ModelTraining />
      </SvgIcon>
    ),
  },
  {
    title: 'Evaluations',
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
        title: 'Domains',
        path: '/domains',
        icon: (
          <SvgIcon fontSize="small">
            <Domain />
          </SvgIcon>
        ),
      },
      {
        title: 'Departments',
        path: '/departments',
        icon: (
          <SvgIcon fontSize="small">
            <AccountTreeRounded />
          </SvgIcon>
        ),
      },
    ],
  },

  // {
  //   title: 'Settings',
  //   path: '/settings',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <SettingsRounded />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Login',
  //   path: '/auth/login',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <LockRounded />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Register',
  //   path: '/auth/register',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <PersonAddRounded />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: 'Error',
  //   path: '/404',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ErrorRounded />
  //     </SvgIcon>
  //   ),
  // },
];
