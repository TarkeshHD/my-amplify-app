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

const MainStyle = styled('main', {
  shouldForwardProp: (prop) => prop !== 'collapseClick',
})(({ collapseClick, theme }) => ({
  flexGrow: 1,
  paddingTop: HEADER.MOBILE_HEIGHT + 24,
  paddingBottom: HEADER.MOBILE_HEIGHT + 24,
  [theme.breakpoints.up('md')]: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    paddingBottom: HEADER.DASHBOARD_DESKTOP_HEIGHT + 24,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH}px)`,
    // marginLeft: NAVBAR.DASHBOARD_COLLAPSE_WIDTH,
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
    marginLeft: 0,
    paddingTop: HEADER.DASHBOARD_DESKTOP_HEIGHT + 54,
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
    <Box sx={{ display: 'flex' }}>
      <SideNav onClose={handleDrawerClose} open={open} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </Box>
  );
};

export default DashboardLayout;
