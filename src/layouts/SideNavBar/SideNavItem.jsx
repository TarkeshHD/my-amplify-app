import { Box, ButtonBase } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export const SideNavItem = (props) => {
  const { active = false, disabled, external, icon, path, title, onClick, sx = {} } = props;

  let linkProps = {};
  if (path) {
    if (external) {
      linkProps = {
        component: 'a',
        href: path,
        target: '_blank',
      };
    } else {
      linkProps = {
        component: Link,
        to: path,
      };
    }
  }

  return (
    <li>
      <ButtonBase
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          pl: '16px',
          pr: '16px',
          py: '6px',
          textAlign: 'left',
          width: '100%',
          ...(active && {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }),
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
          ...sx,
        }}
        {...linkProps}
        onClick={onClick}
      >
        {icon && (
          <Box
            component="span"
            sx={{
              alignItems: 'center',
              color: 'neutral.400',
              display: 'inline-flex',
              justifyContent: 'center',
              mr: 2,
              ...(active && {
                color: 'primary.main',
              }),
            }}
          >
            {icon}
          </Box>
        )}
        <Box
          component="span"
          sx={{
            color: 'neutral.400',
            flexGrow: 1,
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '24px',
            whiteSpace: 'nowrap',
            ...(active && {
              color: 'common.white',
            }),
            ...(disabled && {
              color: 'neutral.500',
            }),
          }}
        >
          {title}
        </Box>
      </ButtonBase>
    </li>
  );
};

SideNavItem.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  external: PropTypes.bool,
  icon: PropTypes.node,
  path: PropTypes.string,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};
