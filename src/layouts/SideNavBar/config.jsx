import {
  AccountTreeRounded,
  BarChartRounded,
  Domain,
  ErrorRounded,
  GroupRounded,
  LockRounded,
  ModelTraining,
  PersonAddRounded,
  PersonRounded,
  Poll,
  SettingsRounded,
  Shop2Rounded,
} from '@mui/icons-material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArchiveIcon from '@mui/icons-material/Archive';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import HomeMaxIcon from '@mui/icons-material/HomeMax';
import { SvgIcon } from '@mui/material';
import { useConfig } from '../../hooks/useConfig';
import { useAuth } from '../../hooks/useAuth';

export function getItems(labels) {
  const config = useConfig();
  const { data } = config;

  const isFreeTrialUser = data?.freeTrial;

  const auth = useAuth();
  const { user } = auth;

  const items = [
    {
      title: `${data?.features?.schedule?.state === 'on' ? 'Sessions and Analytics' : 'Analytics'}`,
      path: '/',
      doNotRenderForUser: [],
      icon: (
        <SvgIcon fontSize="small">
          <BarChartRounded />
        </SvgIcon>
      ),
    },
    {
      title: labels?.user?.plural || 'Users',
      path: '/users',
      doNotRenderForUser: ['user'],
      icon: (
        <SvgIcon fontSize="small">
          <GroupRounded />
        </SvgIcon>
      ),
    },
    {
      title: labels?.module?.plural || 'Modules',
      path: '/modules',
      doNotRenderForUser: ['user'],
      icon: (
        <SvgIcon fontSize="small">
          <ModelTraining />
        </SvgIcon>
      ),
    },
    {
      title: labels?.evaluation?.plural || 'Evaluations',
      path: '/evaluations',
      doNotRenderForUser: [],
      icon: (
        <SvgIcon fontSize="small">
          <Poll />
        </SvgIcon>
      ),
    },
    {
      title: labels?.training?.plural || 'Trainings',
      path: '/trainings',
      doNotRenderForUser: [],
      icon: (
        <SvgIcon fontSize="small">
          <FitnessCenterIcon />
        </SvgIcon>
      ),
    },
    {
      title: 'Organization',
      doNotRenderForUser: ['user'],
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

  // Add the "Knowledge Repository" item if it is enabled from the backend config.
  if (data?.features?.knowledgeRep?.state === 'on') {
    // Add the "Knowledge Repository" item as the fourth item.
    items.splice(3, 0, {
      title: 'Knowledge Repository',
      path: '/knowledge',
      doNotRenderForUser: ['user'],
      icon: (
        <SvgIcon fontSize="small">
          <EmojiObjectsIcon />
        </SvgIcon>
      ),
    });
  }

  // Enable Device Tab if Device Login is enabled
  if (data?.features?.deviceLogin?.state === 'on') {
    items.splice(5, 0, {
      title: 'Devices',
      path: '/devices',
      doNotRenderForUser: [],
      icon: (
        <SvgIcon fontSize="small">
          <HomeMaxIcon />
        </SvgIcon>
      ),
    });
  }

  // Add the "Scheduling" item if it is enabled from the backend config.
  if (data?.features?.schedule?.state === 'on') {
    // Add the "Scheduling" item as the fifth item.
    items.splice(4, 0, {
      title: 'Schedule',
      path: '/schedule',
      doNotRenderForUser: ['user'],
      icon: (
        <SvgIcon fontSize="small">
          <CalendarMonthIcon />
        </SvgIcon>
      ),
    });
  }

  // Add the "Archive" item if it is enabled from the backend config.
  if (data?.features?.archive?.state === 'on') {
    // Add the "Archive" item as the fifth item.
    items.splice(4, 0, {
      title: 'Archive',
      path: '/archive',
      doNotRenderForUser: ['user'],
      icon: (
        <SvgIcon fontSize="small">
          <ArchiveIcon />
        </SvgIcon>
      ),
    });
  }

  return items;
}
