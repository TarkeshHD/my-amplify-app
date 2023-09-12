import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Avatar, Box, Card, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Scrollbar } from '../../components/Scrollbar';
import { getInitials } from '../../utils/utils';
import SearchNotFound from '../../components/SearchNotFound';
import CustomDialog from '../../components/CustomDialog';

export const DepartmentsTable = ({ count = 0, items = [], fetchingData }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: 'Department',
      },
      {
        accessorFn: (row) => row?.domainId?.name || 'NA', // simple recommended way to define a column
        header: 'Domain',
      },
      {
        accessorKey: 'userCount', // simple recommended way to define a column
        header: 'Users',
      },
    ],
    [],
  );

  return (
    <>
      <Card>
        <MaterialReactTable
          renderRowActionMenuItems={({ row, closeMenu, table }) => [
            <MenuItem
              key={0}
              onClick={() => {
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
          enableRowActions
          displayColumnDefOptions={{
            'mrt-row-actions': {
              header: null,
            },
          }}
          positionActionsColumn="last"
          columns={columns}
          data={items}
          enableRowSelection // enable some features
          enableColumnOrdering
          state={{
            isLoading: fetchingData,
          }}
          initialState={{ pagination: { pageSize: 5 }, showGlobalFilter: true }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [5, 10, 15, 20, 25],
          }}
          enableGlobalFilterModes
          positionGlobalFilter="left"
          muiSearchTextFieldProps={{
            placeholder: `Search ${items.length} rows`,
            sx: { minWidth: '300px' },
            variant: 'outlined',
          }}
        />
      </Card>
    </>
  );
};

DepartmentsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
