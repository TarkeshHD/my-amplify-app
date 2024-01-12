import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';
import { secondsToHHMMSS } from './TimeGrid';
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@material-ui/core';

const tableData = [
  { description: 'Task 1', timeTaken: '00:15:30' },
  { description: 'Task 2', timeTaken: '00:10:45' },
  { description: 'Task 3', timeTaken: '00:05:00' },
  { description: 'Task 4', timeTaken: '00:20:00' },
  // Add more data as needed
];

const styles = {
  container: {
    maxHeight: '300px',
    margin: '3px 0',
    overflowY: 'auto',
  },
  headerCell: {
    backgroundColor: '#f0f0f0',
    fontSize: '16px', // Larger font size for header
    borderBottom: '1px solid #ddd', // Add separating line for header
  },
  headerDescriptionCell: {
    borderRight: '1px solid #ddd',
    width: '70%',
  },
  dataCell: {
    // Add separating line for rows
    borderBottom: '1px solid #ddd',
  },
  descriptionCell: {
    width: '75%',

    borderRight: '1px solid #ddd',
  },
  timeCell: {
    width: '25%',
    borderBottom: '1px solid #ddd',
  },

  // Make description column wider
};

const TimeCard = ({ tableData, status, message = undefined }) => {
  let messageForNoMistakes = '';
  if (!message) {
    messageForNoMistakes =
      status === 'Pass'
        ? 'You got everything right! Kudos! 👏'
        : 'No mistakes made! 👍, but you have to improve your speed! ⚡';
  } else {
    messageForNoMistakes = message;
  }

  const tableValues = tableData?.map((row, index) => (
    <TableRow key={index}>
      <TableCell style={{ ...styles.descriptionCell, ...styles.dataCell }}>{row.description}</TableCell>
      <TableCell style={{ ...styles.timeCell, ...styles.dataCell }}>{secondsToHHMMSS(row.timeOfMistake)}</TableCell>
    </TableRow>
  ));
  return (
    <TableContainer component={Paper} style={styles.container}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ ...styles.headerCell, ...styles.headerDescriptionCell }}>
              <Typography variant="caption">Mistake</Typography>
            </TableCell>
            <TableCell style={styles.headerCell}>
              <Typography variant="caption">Event Timestamp</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData?.length === 0 ? (
            <tableCell>
              <Typography variant="body1" style={{ padding: '30px 0', textAlign: 'right' }}>
                {messageForNoMistakes}
              </Typography>
            </tableCell>
          ) : (
            tableValues
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TimeCard;
