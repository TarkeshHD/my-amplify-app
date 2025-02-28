import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { Box, Button, Popover } from '@mui/material';
import React, { useState } from 'react';
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css'; // Import the default styles
import 'react-date-range/dist/theme/default.css';

function CustomDateRangePicker({ onChange, column }) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: 'selection', // specify the selection type (e.g., 'selection' or 'hover')
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const dateChangeHandler = (ranges) => {
    setDateRange(ranges.selection);

    if (ranges.selection.startDate !== ranges.selection.endDate) {
      // DD:MM:yyyyy 00:00:00
      const startUnixTimeStamp = Math.floor(ranges.selection.startDate.getTime() / 1000);
      const endUnixTimeStamp = Math.floor(ranges.selection.endDate.getTime() / 1000);
      // DD:MM:yyyyy 23:59:59
      const endOfDayTimestamp = endUnixTimeStamp + 24 * 60 * 60 - 1;
      column.setFilterValue([startUnixTimeStamp, endOfDayTimestamp]);
      handleClose();
    }
  };

  const resetFilter = (e) => {
    e.stopPropagation();
    setDateRange({ startDate: null, endDate: null, key: 'selection' });
    column.setFilterValue(undefined);
  };

  return (
    <div
      sx={{
        width: '100%',
      }}
    >
      <Button
        variant="outlined"
        onClick={handleClick}
        sx={{
          display: 'flex',
          justifyContent: 'space-between', // Align children horizontally
          alignItems: 'center', // Center children vertically
          border: 'none',
          width: '100%',
          marginTop: '0px',

          paddingTop: '0px',
          paddingBottom: '2px',
          borderRadius: '0px',
          color: 'rgba(0, 0, 0, 0.5)',
          borderColor: 'grey',
          paddingLeft: '0px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.5)',
          '&:hover': {
            border: 'none',
            borderBottom: '2px solid rgba(0, 0, 0, 1) !important',
          },
        }}
      >
        {dateRange.startDate && dateRange.endDate ? (
          <span>
            {`${dateRange.startDate.toLocaleDateString('en-GB')} - ${dateRange.endDate.toLocaleDateString('en-GB')}`}
          </span>
        ) : (
          <span>FILTER BY DATE</span>
        )}
        <div>
          <DateRangeIcon />
          <CloseIcon
            onClick={resetFilter}
            sx={{
              color: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                color: 'rgba(0, 0, 0, 1)',
                fontSize: '25px',
              },
            }}
          />
        </div>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box p={2}>
          <div>
            <DateRange ranges={[dateRange]} onChange={dateChangeHandler} />
          </div>
        </Box>
      </Popover>
    </div>
  );
}

export default CustomDateRangePicker;
