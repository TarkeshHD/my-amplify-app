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

import { Link, useLocation } from 'react-router-dom';
import { ArrowOutwardRounded, ChevronRightRounded } from '@mui/icons-material';
import { Scrollbar } from '../../components/Scrollbar';
import Logo from '../../components/Logo';
import { SideNavItem } from './SideNavItem';
import { getItems } from './config';
import { NAVBAR } from '../../config';
import { SideNavNestedItems } from './SideNavNestedItems';
import { useConfig } from '../../hooks/useConfig';

export const SideNav = (props) => {
  const { open, onClose } = props;
  const { pathname } = useLocation();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const theme = useTheme();

  const config = useConfig();
  const { data } = config;

  const items = getItems(data?.labels);

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
            href={data?.client?.contactUrl}
            sx={{ mt: 2 }}
            target="_blank"
            variant="contained"
          >
            Get Support
          </Button>
        </Box>
      </Box>
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
