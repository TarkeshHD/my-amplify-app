import { Box, Button, Card, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import {
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleDensePaddingButton as MRTToggleDensePaddingButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
  MaterialReactTable,
} from 'material-react-table';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Delete, Edit, FileDownload } from '@mui/icons-material';

import CustomDateRangePicker from '../../components/DatePicker/CustomDateRangePicker';

import { useConfig } from '../../hooks/useConfig';
import { useNavigate } from 'react-router-dom';
import { addToHistory } from '../../utils/utils';

export const SessionTable = ({
  count = 0,
  items,
  fetchingData,
  exportBtnClicked,
  exportBtnFalse,
  sessionHeading = 'Upcoming',
}) => {
  const navigate = useNavigate();

  const config = useConfig();
  const { data } = config;

  const [updatedItems, setUpdatedItems] = useState(items);
  useEffect(() => {
    setUpdatedItems(items);
  }, [items]);

  // const scoresList =
  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: `Name`,
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.name || '-'}</Typography>;
        },
      },
      {
        id: 'owner.name',
        header: `Owner`,
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.owner?.name || '-'}</Typography>;
        },
      },
      {
        // accessorKey: 'name',
        id: 'venue',
        header: `Venue`,
        // filterVariant: 'multi-select',s
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.venue || '-'}</Typography>;
        },
      },
      {
        id: 'modules',
        Header: `${data?.labels?.module?.singular || 'Modules'}`,
        filterVariant: 'multi-select',
        // size: 200,
        Cell: ({ row }) => {
          const moduleList = row?.original?.modules.map((module) => module.name);
          if (moduleList.length === 0) return <Typography>-</Typography>;

          return (
            <ul style={{ margin: 0, padding: 15, textAlign: 'left', fontSize: 16 }}>
              {moduleList.map((moduleName, index) => (
                <li key={index}>{moduleName}</li>
              ))}
            </ul>
          );
        },
      },
      {
        id: 'users',
        Header: 'Users',
        Cell: ({ row }) => {
          const usersList = row?.original?.users.map((user) => user.id.username);

          if (usersList.length === 0) return <Typography>-</Typography>;

          return (
            <ul style={{ margin: 0, padding: 15, textAlign: 'left', fontSize: 16 }}>
              {usersList.map((userName, index) => (
                <li key={index}>{userName}</li>
              ))}
            </ul>
          );
        },
      },

      {
        size: 250,
        header: 'Session Time',
        Cell: ({ cell, column, row }) => {
          const tz = moment.tz.guess();
          const startTime = moment.unix(row?.original?.startDate).tz(tz).format('DD/MM/YYYY HH:mm');
          const endTime = row?.original?.endDate
            ? moment.unix(row?.original?.endDate).tz(tz).format('DD/MM/YYYY HH:mm')
            : 'Pending';
          return (
            <Typography>
              {startTime} - {endTime}
            </Typography>
          );
        },
        Filter: ({ column }) => <CustomDateRangePicker column={column} />,
      },
    ],
    [],
  );

  const handleRowClick = async (row) => {
    addToHistory();
    navigate(`/session-details/${row?.original?._id}`);
  };

  return (
    <>
      <Card>
        <MaterialReactTable
          renderToolbarInternalActions={({ table }) => (
            <Box sx={{ display: 'flex', p: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {/* <MRTToggleFiltersButton table={table} /> */}
              {/* <MRTShowHideColumnsButton table={table} /> */}
              {/* <MRTFullScreenToggleButton table={table} /> */}
            </Box>
          )}
          renderRowActionMenuItems={({ row, closeMenu, table }) => [
            <MenuItem
              key={0}
              onClick={() => {
                onDeleteRow(row.original);
                // onDeleteRow();
                closeMenu();
              }}
              sx={{ color: 'error.main' }}
            >
              <Stack spacing={2} direction={'row'}>
                <Delete />
                <Typography>Delete</Typography>
              </Stack>
            </MenuItem>,
            <MenuItem
              key={1}
              onClick={() => {
                // onEditRow();
                closeMenu();
              }}
            >
              <Stack spacing={2} direction={'row'}>
                <Edit />
                <Typography>Edit</Typography>
              </Stack>
            </MenuItem>,
          ]}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              handleRowClick(row);
            },
            sx: { cursor: 'pointer' },
          })}
          displayColumnDefOptions={{
            'mrt-row-actions': {
              header: null,
            },
          }}
          positionActionsColumn="last"
          columns={columns}
          data={updatedItems}
          state={{
            isLoading: fetchingData,
          }}
          initialState={{ pagination: { pageSize: 5 }, showGlobalFilter: true, showColumnFilters: false }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [5, 10, 15, 20, 25],
          }}
          //   enableGlobalFilterModes
          positionGlobalFilter="left"
          muiSearchTextFieldProps={{
            placeholder: `Search ${updatedItems.length} rows`,
            sx: { minWidth: '300px' },
            variant: 'outlined',
          }}
          enableColumnActions={false}
          //   enableFacetedValues

          renderEmptyRowsFallback={({ table }) => (
            <table style={{ width: '100%', textAlign: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
              <tbody>
                <tr>
                  <td colSpan={100} style={{ padding: '20px', fontWeight: 600 }}>
                    No {sessionHeading} Sessions Available
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        />
      </Card>
    </>
  );
};

// SessionTable.propTypes = {
//   count: PropTypes.number,
//   items: PropTypes.array,
//   fetchingData: PropTypes.bool,
// };
