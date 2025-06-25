import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Button, Popover, Tooltip, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useState } from 'react';
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css'; // Import the default styles
import 'react-date-range/dist/theme/default.css';

function CustomDateRangePicker({ onChange, column }) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: 'selection',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterType, setFilterType] = useState('range'); // 'range' or 'single'

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const handleFilterTypeChange = (event, newFilterType) => {
    if (newFilterType !== null) {
      setFilterType(newFilterType);
      setDateRange({ startDate: null, endDate: null, key: 'selection' });
      column.setFilterValue(undefined);
    }
  };

  const dateChangeHandler = (ranges) => {
    setDateRange(ranges.selection);

    if (filterType === 'single') {
      if (ranges.selection.startDate) {
        const unixTimeStamp = Math.floor(ranges.selection.startDate.getTime() / 1000);
        column.setFilterValue([unixTimeStamp, null]);
        handleClose();
      }
    } else {
      // Only apply filter if both start and end dates are selected in range mode
      if (
        ranges.selection.startDate &&
        ranges.selection.endDate &&
        ranges.selection.startDate.getTime() !== ranges.selection.endDate.getTime()
      ) {
        const startUnixTimeStamp = Math.floor(ranges.selection.startDate.getTime() / 1000);
        const endUnixTimeStamp = Math.floor(ranges.selection.endDate.getTime() / 1000);
        const endOfDayTimestamp = endUnixTimeStamp + 24 * 60 * 60 - 1;
        column.setFilterValue([startUnixTimeStamp, endOfDayTimestamp]);
        handleClose();
      }
    }
  };

  const resetFilter = (e) => {
    e.stopPropagation();
    setDateRange({ startDate: null, endDate: null, key: 'selection' });
    column.setFilterValue(undefined);
  };

  const getDisplayText = () => {
    if (!dateRange.startDate) return 'FILTER BY DATE';

    if (filterType === 'single') {
      return `After ${dateRange.startDate.toLocaleDateString('en-GB')}`;
    }

    if (dateRange.startDate && dateRange.endDate && dateRange.startDate.getTime() !== dateRange.endDate.getTime()) {
      return `${dateRange.startDate.toLocaleDateString('en-GB')} - ${dateRange.endDate.toLocaleDateString('en-GB')}`;
    }

    if (dateRange.startDate) {
      return `Select end date`;
    }

    return 'FILTER BY DATE';
  };

  return (
    <div
      sx={{
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClick}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
          <span>{getDisplayText()}</span>
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
      </Box>

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
          <ToggleButtonGroup value={filterType} exclusive onChange={handleFilterTypeChange} size="small" sx={{ mb: 2 }}>
            <ToggleButton value="single">Single Date</ToggleButton>
            <ToggleButton value="range">Date Range</ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            {filterType === 'single'
              ? 'Select a date to show records after this date (includes pending records)'
              : 'Select a date range to show completed records within this period'}
          </Typography>

          <div>
            <DateRange
              ranges={[dateRange]}
              onChange={dateChangeHandler}
              months={1}
              showDateDisplay={false}
              showMonthAndYearPickers={true}
              rangeColors={['#1976d2']}
            />
          </div>
        </Box>
      </Popover>
    </div>
  );
}

export default CustomDateRangePicker;
