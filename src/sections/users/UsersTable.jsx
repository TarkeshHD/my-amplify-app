import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Avatar, Box, Card, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Scrollbar } from '../../components/Scrollbar';
import { getInitials } from '../../utils/utils';
import SearchNotFound from '../../components/SearchNotFound';
import CustomDialog from '../../components/CustomDialog';
import EditPasswordForm from '../../components/users/EditPasswordForm';

export const UsersTable = ({ count = 0, items = [], fetchingData }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: 'Name',
      },
      {
        accessorKey: 'username', // simple recommended way to define a column
        header: 'Username',
      },
      {
        accessorKey: 'role', // simple recommended way to define a column
        header: 'Role',
      },
      {
        accessorFn: (row) => row?.domainId?.name || 'NA', // simple recommended way to define a column
        header: 'Domain',
      },
      {
        accessorFn: (row) => row?.departmentId?.name || 'NA', // simple recommended way to define a column
        header: 'Department',
      },
    ],
    [],
  );

  // Set below flag as well as use it as 'Row' Object to be passed inside forms
  const [openEditPassForm, setOpenEditPass] = useState(null);

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
            <MenuItem
              key={3}
              onClick={() => {
                // onEditRow();
                setOpenEditPass(row);
                closeMenu();
              }}
            >
              <Stack spacing={2} direction={'row'}>
                <Edit />
                <Typography>Edit Password</Typography>
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

      {/* Edit Password Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditPass(false);
        }}
        open={Boolean(openEditPassForm)}
        title={<Typography variant="h5">Edit Password</Typography>}
      >
        <EditPasswordForm user={openEditPassForm?.original} />
      </CustomDialog>
    </>
  );
};

UsersTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
