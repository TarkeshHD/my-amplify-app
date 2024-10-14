import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';
import moment from 'moment-timezone';
import { convertUnixToLocalTime } from '../../utils/utils';

const styles = {
  container: {
    maxHeight: '280px',
    margin: '3px',
    overflowY: 'auto',
  },
  headerCell: {
    backgroundColor: '#f0f0f0',
    fontSize: '16px', // Larger font size for header
    borderBottom: '1px solid #ddd', // Add separating line for header
    position: 'sticky',
    top: 0,
    zIndex: 1, // Ensure the header is above the other cells
  },
  headerDescriptionCell: {
    borderRight: '1px solid #ddd',
    width: '50%',
  },
  dataCell: {
    // Add separating line for rows
    borderBottom: '1px solid #ddd',
  },
  descriptionCell: {
    width: '50%',
    borderRight: '1px solid #ddd',
  },
  timeCell: {
    width: '25%',
    borderBottom: '1px solid #ddd',
  },
  messageForNoMistakes: {
    padding: '30px 0',
    textAlign: 'center', // Adjusted to center for better display
  },
};

const DeviceCard = ({ tableData, content }) => {
  const messageIfEmpty = tableData?.length === 0 ? `No ${content} History` : '';

  const tableValues = tableData?.map((row, index) => (
    <TableRow
      key={index}
      sx={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          borderRadius: '10px',
          backgroundColor: '#d4d4d4',
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '10px',
          backgroundColor: '#6e6e6e',
          height: '5px',
        },
      }}
    >
      <TableCell style={{ ...styles.descriptionCell, ...styles.dataCell }}>{row?.name || row?.ip}</TableCell>
      <TableCell style={{ ...styles.timeCell, ...styles.dataCell }}>{convertUnixToLocalTime(row.time)}</TableCell>
    </TableRow>
  ));

  return (
    <TableContainer
      component={Paper}
      style={styles.container}
      sx={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          borderRadius: '10px',
          backgroundColor: '#d4d4d4',
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '10px',
          backgroundColor: '#6e6e6e',
          height: '5px',
        },
        margin: '5px 10p',
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell style={{ ...styles.headerCell, ...styles.headerDescriptionCell }}>
              <Typography variant="caption">{content}</Typography>
            </TableCell>
            <TableCell style={styles.headerCell}>
              <Typography variant="caption">Date & Time</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} style={styles.messageForNoMistakes}>
                <Typography variant="body1">{messageIfEmpty}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            tableValues
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeviceCard;
