import PropTypes from 'prop-types';
import { Notifications, Group, Search, Menu } from '@mui/icons-material';
import { Avatar, Badge, Box, IconButton, Stack, SvgIcon, Tooltip, useMediaQuery } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HEADER, NAVBAR } from '../../config';

const SIDE_NAV_WIDTH = NAVBAR.DASHBOARD_WIDTH;
const TOP_NAV_HEIGHT = HEADER.MOBILE_HEIGHT;

export const TopNav = (props) => {
  const { onNavOpen } = props;
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  return (
    <>
      <Box
        component="header"
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
          position: 'sticky',
          left: {
            lg: `${SIDE_NAV_WIDTH}px`,
          },
          top: 0,
          width: {
            lg: `calc(100% - ${SIDE_NAV_WIDTH}px)`,
          },
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{
            minHeight: TOP_NAV_HEIGHT,
            px: 2,
          }}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
            {!lgUp && (
              <IconButton onClick={onNavOpen}>
                <Menu />
              </IconButton>
            )}
            <Tooltip title="Search">
              <IconButton>
                <Search />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack alignItems="center" direction="row" spacing={2}>
            <Tooltip title="Contacts">
              <IconButton>
                <Group />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={4} color="success" variant="dot">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            {/* <Avatar
              sx={{
                cursor: 'pointer',
                height: 40,
                width: 40,
              }}
              src="/assets/avatars/avatar-anika-visser.png"
            /> */}
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

TopNav.propTypes = {
  onNavOpen: PropTypes.func,
};
