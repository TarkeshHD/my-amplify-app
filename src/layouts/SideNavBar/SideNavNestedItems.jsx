import React, { useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { Collapse, List } from '@mui/material';
import { SideNavItem } from './SideNavItem';

export const SideNavNestedItems = ({ active, item, ...props }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SideNavItem
        active={open}
        disabled={item.disabled}
        external={item.external}
        icon={open ? <ExpandLess /> : <ExpandMore />}
        key={item.title}
        title={item.title}
        onClick={() => {
          setOpen(!open);
        }}
      />
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {(item.children || []).map((item) => (
            <SideNavItem
              sx={{ pl: 4 }}
              active={active}
              disabled={item.disabled}
              external={item.external}
              icon={item.icon}
              key={item.title}
              path={item.path}
              title={item.title}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

SideNavNestedItems.propTypes = {};
