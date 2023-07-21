import React, { useEffect, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Collapse, List } from '@mui/material';
import { SideNavItem } from './SideNavItem';

export const SideNavNestedItems = ({ item, ...props }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    if (item?.children?.find((v) => v.path === pathname)) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [pathname, item.children]);
  return (
    <>
      <SideNavItem
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
              active={item.path ? pathname === item.path : false}
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
