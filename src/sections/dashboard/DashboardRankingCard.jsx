import PropTypes from 'prop-types';
import { Avatar, Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';
import React from 'react';
import { Stack } from '@mui/system';

export const DashboardRankingCard = ({ title, items, Icon, iconColor }) => {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" variant="overline">
          {title}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <List sx={{ padding: 0 }}>
            {items.map((item, index) => (
              <ListItem
                key={index}
                disableGutters
                sx={{
                  py: 0, // Removes vertical padding
                  my: 0, // Removes vertical margins
                  alignItems: 'flex-start', // Align items to the top of the container
                }}
              >
                <ListItemText
                  primary={`${index + 1}. ${item.name}`}
                  secondary={item.detail}
                  primaryTypographyProps={{
                    fontSize: '0.875rem', // Smaller font size for primary text
                    lineHeight: '1.25', // Adjusted line-height for primary text
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.775rem', // Smaller font size for secondary text
                    lineHeight: '1.25', // Adjusted line-height for secondary text
                  }}
                />
              </ListItem>
            ))}
          </List>
          {Icon && ( // Only render the Avatar if an icon is provided
            <Avatar
              sx={{
                backgroundColor: iconColor,
                height: 48,
                width: 48,
              }}
            >
              {Icon} {/* Render the icon */}
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
  IconComponent: PropTypes.elementType,
  iconColor: PropTypes.string,
};

DashboardRankingCard.defaultProps = {
  iconColor: 'primary.main', // Default color for the icon background
};
