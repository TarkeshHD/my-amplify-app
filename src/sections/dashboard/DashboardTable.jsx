import PropTypes from 'prop-types';
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  TableContainer,
  Paper,
} from '@mui/material';
import React from 'react';

export const DashboardTable = (props) => {
  const { moments = [], sx, icon, iconColor } = props;

  return (
    <Card sx={{ p: 0, ...sx }}>
      <CardContent>
        <Stack p={1.5} alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
          <Typography variant="h6">Top Failing Moments</Typography>
          {icon && (
            <Avatar
              sx={{
                backgroundColor: iconColor,
                height: 48,
                width: 48,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Stack>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="overline">Module Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="overline">Chapter Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="overline">Moment Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="overline">Fail Count</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {moments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Analytics still pending
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                moments.map((moment, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{moment.moduleName}</TableCell>
                    <TableCell>{moment.chapterName}</TableCell>
                    <TableCell>{moment.momentName}</TableCell>
                    <TableCell>{moment.failCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

DashboardTable.propTypes = {
  moments: PropTypes.arrayOf(
    PropTypes.shape({
      moduleName: PropTypes.string.isRequired,
      chapterName: PropTypes.string.isRequired,
      momentName: PropTypes.string.isRequired,
      failCount: PropTypes.number.isRequired,
    }),
  ).isRequired,
  sx: PropTypes.object,
  icon: PropTypes.element,
  iconColor: PropTypes.string,
};

DashboardTable.defaultProps = {
  sx: {},
  icon: null,
  iconColor: 'success.main',
};
