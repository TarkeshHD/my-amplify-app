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

  const auth = useAuth();
  const { user } = auth;

  if (user?.role === 'user') {
    return [
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
        title: labels?.training?.plural || 'Trainings',
        path: '/trainings',
        icon: (
          <SvgIcon fontSize="small">
            <FitnessCenterIcon />
          </SvgIcon>
        ),
      },
    ];
  }

  const items = [
    {
      title: 'Sessions and Analytics',
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
      title: labels?.training?.plural || 'Trainings',
      path: '/trainings',
      icon: (
        <SvgIcon fontSize="small">
          <FitnessCenterIcon />
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

  // Add the "Knowledge Repository" item if it is enabled from the backend config.
  if (data?.features?.knowledgeRep?.state === 'on') {
    // Add the "Knowledge Repository" item as the fourth item.
    items.splice(3, 0, {
      title: 'Knowledge Repository',
      path: '/knowledge',
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
      icon: (
        <SvgIcon fontSize="small">
          <ArchiveIcon />
        </SvgIcon>
      ),
    });
  }

  return items;
}
