import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  List,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';

import { ArrowOutwardRounded, ChevronRightRounded } from '@mui/icons-material';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CustomDialog from '../../components/CustomDialog';
import Logo from '../../components/Logo';
import { Scrollbar } from '../../components/Scrollbar';
import SupportRequestForm from '../../components/support/SupportRequestForm';
import { NAVBAR } from '../../config';
import { useConfig } from '../../hooks/useConfig';
import { SideNavItem } from './SideNavItem';
import { SideNavNestedItems } from './SideNavNestedItems';
import { getItems } from './config';
import { useAuth } from '../../hooks/useAuth';

export const SideNav = (props) => {
  const { open, onClose } = props;
  const [openSprtForm, setOpenSprtForm] = useState(false);
  const { pathname } = useLocation();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const theme = useTheme();

  const config = useConfig();
  const { data } = config;

  const { user } = useAuth();

  const isFreeTrialUser = data?.freeTrial;

  const items = getItems(data?.labels);

  if (isFreeTrialUser) {
    const analyticsIndex = items.findIndex((item) => item.title === 'Analytics');
    const evaluationsIndex = items.findIndex((item) => item.title === 'Evaluations');
    const trainingsIndex = items.findIndex((item) => item.title === 'Trainings');

    const trainings = trainingsIndex !== -1 ? items.splice(trainingsIndex, 1)[0] : null;
    const evaluations = evaluationsIndex !== -1 ? items.splice(evaluationsIndex, 1)[0] : null;
    const analytics = analyticsIndex !== -1 ? items.splice(analyticsIndex, 1)[0] : null;

    const organizationIndex = items.findIndex((item) => item.title === 'Organization');
    if (organizationIndex !== -1) {
      items.splice(organizationIndex, 1);
    }

    if (analytics) items.unshift(analytics);
    if (evaluations) items.splice(1, 0, evaluations);
    if (trainings) items.splice(2, 0, trainings);
  }

  const content = (
    <Scrollbar
      sx={{
        height: '100%',
        '& .simplebar-content': {
          height: '100%',
        },
        '& .simplebar-scrollbar:before': {
          background: 'neutral.800',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '90vh',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'inline-flex',
              height: 78,
              width: 78,
            }}
          >
            <Logo />
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)', // for header and sub header
              borderRadius: 1,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              p: '12px',
            }}
          >
            <div>
              <Typography color="inherit" variant="subtitle1">
                {data?.client?.appName}
              </Typography>
              <Typography color="neutral.400" variant="body2">
                {data?.client?.appDescription}
              </Typography>
            </div>
            <SvgIcon fontSize="small" sx={{ color: 'neutral.500' }}>
              <ChevronRightRounded />
            </SvgIcon>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'neutral.700' }} />

        <Box
          component="nav"
          sx={{
            flexGrow: 1,
            px: 2,
            py: 3,
          }}
        >
          <Stack
            component="ul"
            spacing={0.5}
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
            }}
          >
            {items.map((item) => {
              if (item?.doNotRenderForUser?.includes(user.role) || item?.disabled) {
                return false;
              }
              const active = item.path ? pathname === item.path : false;
              const hasChildren = item.children;

              if (hasChildren) {
                return <SideNavNestedItems active={active} item={item} key={item.title} />;
              }

              return (
                <SideNavItem
                  active={active}
                  disabled={item.disabled}
                  external={item.external}
                  icon={item.icon}
                  key={item.title}
                  path={item.path}
                  title={item.title}
                />
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: 'neutral.700' }} />

        <Box
          sx={{
            px: 2,
            py: 3,
          }}
        >
          <Typography color="neutral.100" variant="subtitle2">
            Need help?
          </Typography>
          <Typography color="neutral.500" variant="body2">
            Reach out to us.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              mt: 2,
              mx: 'auto',
              width: '160px',
              '& img': {
                width: '100%',
              },
            }}
          >
            {/* <img alt="Go to pro" src="vite.svg" /> */}
          </Box>
          <Button
            component="a"
            endIcon={
              <SvgIcon fontSize="small">
                <ArrowOutwardRounded />
              </SvgIcon>
            }
            fullWidth
            // href={data?.client?.contactUrl}
            onClick={() => {
              setOpenSprtForm(true);
            }}
            sx={{ mt: 2 }}
            // target="_blank"
            variant="contained"
          >
            Get Support
          </Button>
        </Box>
      </Box>
      {/* Support Form */}
      <CustomDialog
        sx={{ minWidth: '40vw' }}
        onClose={() => {
          setOpenSprtForm(false);
        }}
        open={Boolean(openSprtForm)}
        title={<Typography variant="h5">Submit A Request</Typography>}
      >
        <SupportRequestForm />
      </CustomDialog>
    </Scrollbar>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.800', // Change color for sidebar
            color: 'common.white',
            width: NAVBAR.DASHBOARD_WIDTH,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.800',
          color: 'common.white',
          width: NAVBAR.DASHBOARD_WIDTH,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

SideNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
