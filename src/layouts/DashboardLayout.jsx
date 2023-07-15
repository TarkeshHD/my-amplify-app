import {
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  styled,
} from '@mui/material';
import React, { useState } from 'react';

import { ChevronLeftOutlined, ChevronRightOutlined, InboxOutlined, MailOutlined } from '@mui/icons-material';

import { Outlet } from 'react-router-dom';
import { HEADER, NAVBAR } from '../config';
import { SideNav } from './SideNavBar/SideNav';
import { TopNav } from './SideNavBar/TopNav';

const MainStyle = styled('main', {
  shouldForwardProp: (prop) => prop !== 'collapseClick',
})(({ collapseClick, theme }) => ({
  flexGrow: 1,
  paddingTop: HEADER.MOBILE_HEIGHT + 24,
  paddingBottom: HEADER.MOBILE_HEIGHT + 24,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    paddingBottom: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH}px)`,
    marginLeft: NAVBAR.DASHBOARD_WIDTH,
    transition: theme.transitions.create('margin-left', {
      duration: theme.transitions.duration.shorter,
    }),
    // ...(collapseClick && {
    //   marginLeft: NAVBAR.DASHBOARD_WIDTH,
    // }),
  },
  [theme.breakpoints.down('lg')]: {
    marginLeft: 0,
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: HEADER.MOBILE_HEIGHT,
    marginLeft: 0,
  },
}));

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  return (
    <Box>
      <TopNav onNavOpen={handleDrawerOpen} />
      <SideNav onClose={handleDrawerClose} open={open} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </Box>
  );
};

export default DashboardLayout;
