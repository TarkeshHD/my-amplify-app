import PropTypes from 'prop-types';
import { Avatar, Card, CardContent, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import React from 'react';
import { Stack } from '@mui/system';

export const DashboardRankingCard = ({ title, items, Icon, iconColor }) => {
  return (
    <Card
      sx={{
        height: '80%',
      }}
    >
      <CardContent>
        <Typography color="text.secondary" variant="overline">
          {title}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {items.length > 0 ? (
            <List sx={{ padding: 0, width: '100%' }}>
              {items.map((item, index) => (
                <ListItem
                  key={index}
                  disableGutters
                  sx={{
                    py: 0,
                    my: 0,
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemText
                    primary={`${index + 1}. ${item.name}`}
                    secondary={item.detail}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      lineHeight: '1.25',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.775rem',
                      lineHeight: '1.25',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography variant="subtitle1" color="text.secondary">
                Analytics still pending...
              </Typography>
            </Box>
          )}
          {Icon && (
            <Avatar
              sx={{
                backgroundColor: iconColor,
                height: 48,
                width: 48,
              }}
            >
              {Icon}
            </Avatar>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

DashboardRankingCard.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      detail: PropTypes.string,
    }),
  ).isRequired,
  Icon: PropTypes.element,
  iconColor: PropTypes.string,
};

DashboardRankingCard.defaultProps = {
  iconColor: 'primary.main',
};
