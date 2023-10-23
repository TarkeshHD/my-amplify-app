import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, ButtonGroup, Toolbar, Typography } from '@mui/material';
import { useCallback } from 'react';

// Custom toolbar for calendar
const CustomToolbar = ({ view, onView, onNavigate, label }) => {
  const buttonStyle = { fontSize: '0.8rem' };
  // onNavigate: (navigate: Navigate) => void;
  // onView: (view: View) => void;
  // label: string;
  // view: View;
  // Getting all the props from the calendar component

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
      }}
    >
      <ButtonGroup variant="contained" aria-label="left-buttons">
        <Button onClick={() => onNavigate('TODAY')} style={buttonStyle}>
          Today
        </Button>
        <Button onClick={() => onNavigate('PREV')} style={buttonStyle}>
          Back
        </Button>
        <Button onClick={() => onNavigate('NEXT')} style={buttonStyle}>
          Next
        </Button>
      </ButtonGroup>

      <div style={{ flex: 1, textAlign: 'center' }}>
        <span>{label}</span>
      </div>

      <ButtonGroup variant="outlined" aria-label="right-buttons">
        <Button
          onClick={() => onView('month')}
          variant={view === 'month' ? 'contained' : 'outlined'}
          style={buttonStyle}
        >
          Month
        </Button>
        <Button onClick={() => onView('week')} variant={view === 'week' ? 'contained' : 'outlined'} style={buttonStyle}>
          Week
        </Button>
        <Button onClick={() => onView('day')} variant={view === 'day' ? 'contained' : 'outlined'} style={buttonStyle}>
          Day
        </Button>
      </ButtonGroup>
    </div>
  );
};

export const MyCalendar = ({ myEventsList, handleSlotSelect, handleEventSelect }) => {
  // When the user clicks on a date, we want to pop up event creation form
  const onDrillDown = useCallback((newDate) => {
    handleSlotSelect(newDate);
  }, []);

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        components={{
          toolbar: CustomToolbar,
        }}
        style={{ height: 500 }}
        onSelectSlot={(slotInfo) => {
          handleSlotSelect(slotInfo.start);
        }}
        selectable
        onShowMore={(events, date) => {}}
        onSelectEvent={(event) => {
          handleEventSelect(event);
        }}
        onDrillDown={onDrillDown}
      />
    </div>
  );
};
