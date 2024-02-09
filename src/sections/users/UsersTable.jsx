import { Delete, Edit } from '@mui/icons-material';
import { Avatar, Box, Button, Card, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import CustomDialog from '../../components/CustomDialog';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import ExportOptions from '../../components/export/ExportOptions';
import EditPasswordForm from '../../components/users/EditPasswordForm';
import { useConfig } from '../../hooks/useConfig';
import { addToHistory, getInitials } from '../../utils/utils';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import TraineeForm from '../../components/users/TraineeForm';
import AdminForm from '../../components/users/AdminForm';
import SuperAdminForm from '../../components/users/SuperAdminForm';

export const UsersTable = ({
  count = 0,
  items = [],
  fetchingData,
  exportBtnClicked,
  exportBtnFalse,
  domains,
  departments,
}) => {
  const exportBtnRef = useRef(null);
  const config = useConfig();
  const [openExportOptions, setOpenExportOptions] = useState(false);
  const [exportRow, setExportRow] = useState([]);
  const { data } = config;

  const navigate = useNavigate();

  useEffect(() => {
    if (exportBtnClicked) {
      exportBtnRef.current.click();
      exportBtnFalse();
    }
  }, [exportBtnClicked]);

  const columns = useMemo(
    () =>
      [
        {
          accessorKey: 'name', // simple recommended way to define a column
          header: 'Name',
          filterVariant: 'multi-select',
        },
        {
          accessorKey: 'username', // simple recommended way to define a column
          header: 'Username',
          filterVariant: 'multi-select',
        },
        {
          accessorKey: 'role', // simple recommended way to define a column
          header: 'Role',
          filterVariant: 'multi-select',
        },
        {
          accessorFn: (row) => row?.domainId?.name || 'NA', // simple recommended way to define a column
          header: `${data?.labels?.domain?.singular || 'Domain'}`,
          filterVariant: 'multi-select',
        },
        data?.features?.traineeType?.state === 'on'
          ? {
              accessorKey: 'traineeType', // simple recommended way to define a column
              header: `${data?.features?.traineeType?.label?.singular || 'Trainee Type'}`,
              filterVariant: 'multi-select',
              size: 100,
              Cell: ({ cell, column, row }) => {
                return <Typography>{row?.original?.traineeType || 'NA'}</Typography>;
              },
            }
          : null,
        {
          accessorFn: (row) => row?.departmentId?.name || 'NA', // simple recommended way to define a column
          header: `${data?.labels?.department?.singular || 'Department'}`,
          filterVariant: 'multi-select',
        },
      ].filter((column) => column !== null), // Filter out null columns
    [],
  );

  // Set below flag as well as use it as 'Row' Object to be passed inside forms
  const [openEditPassForm, setOpenEditPass] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(null);

  const convertRowDatas = (rows) => {
    return rows.map((row) => {
      const values = row?.original;
      const convertedValue = [
        values?.name || 'NA',
        values?.username || 'NA',
        values?.role || 'NA',
        values?.domainId?.name || 'NA',
      ];

      // Add trainee Type values, if it exist
      if (data?.features?.traineeType?.state === 'on') {
        convertedValue.push(values?.traineeType || 'NA');
      }
      convertedValue.push(values?.departmentId?.name || 'NA');
      return convertedValue;
    });
  };

  const handleExportRows = (rows, type) => {
    setOpenExportOptions(true);
    setExportRow(convertRowDatas(rows));
  };

  const onDeleteRow = async (row) => {
    try {
      // Delete row
      const response = await axios.delete(`/user/archive/${row?.original?.id}`);
      toast.success('User deleted successfully');
      setTimeout(() => {
        navigate(0);
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const user = useAuth();

  const onEditRow = (row) => {
    if (user.user.role === 'admin' && row.original.role !== 'user') {
      toast.error('You are not authorized to edit this user');
      return;
    }
    setOpenEditForm(row);
  };

  const handleRowClick = (row) => {
    addToHistory();
    // Navigate to user evaluation page with user id
    navigate(`/evaluations/${row.original.id}`);
  };

  return (
    <>
      <Card>
        <MaterialReactTable
          renderToolbarInternalActions={({ table }) => (
            <Box sx={{}}>
              <Button
                ref={exportBtnRef}
                sx={{ display: 'none' }}
                disabled={table.getPrePaginationRowModel().rows.length === 0}
                // export all rows, including from the next page, (still respects filtering and sorting)
                onClick={() => {
                  handleExportRows(table.getPrePaginationRowModel().rows);
                }}
              ></Button>
            </Box>
          )}
          renderRowActionMenuItems={({ row, closeMenu, table }) => [
            <MenuItem
              key={0}
              onClick={() => {
                onDeleteRow(row);
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
                onEditRow(row);
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
                closeMenu();
                if (row.original.role === 'user') {
                  toast.error("Trainee's password cannot be edited");
                  return;
                }
                setOpenEditPass(row);
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
          initialState={{ pagination: { pageSize: 5 }, showGlobalFilter: true, showColumnFilters: true }}
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
          enableFacetedValues
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              handleRowClick(row);
            },
            sx: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* View export options */}
      <CustomDialog
        onClose={() => {
          setOpenExportOptions(false);
        }}
        open={Boolean(openExportOptions)}
        title={<Typography variant="h5">Export Options</Typography>}
      >
        <ExportOptions
          headers={columns.map((column) => column.header)}
          exportRow={exportRow}
          closeExportOptions={() => setOpenExportOptions(false)}
        />
      </CustomDialog>

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

      {/* Edit User Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditForm(false);
        }}
        open={Boolean(openEditForm)}
        title={<Typography variant="h5">Edit User</Typography>}
      >
        {openEditForm?.original?.role === 'user' ? (
          <TraineeForm isEdit={true} currentUser={openEditForm?.original} domains={domains} departments={departments} />
        ) : openEditForm?.original?.role === 'admin' ? (
          <AdminForm isEdit={true} currentUser={openEditForm?.original} domains={domains} />
        ) : (
          <SuperAdminForm isEdit={true} currentUser={openEditForm?.original} />
        )}
        {/* <EditUserForm user={openEditForm?.original} /> */}
      </CustomDialog>
    </>
  );
};

UsersTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
