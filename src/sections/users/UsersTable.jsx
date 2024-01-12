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
import { getInitials } from '../../utils/utils';

export const UsersTable = ({ count = 0, items = [], fetchingData, exportBtnClicked, exportBtnFalse }) => {
  const exportBtnRef = useRef(null);
  const config = useConfig();
  const [openExportOptions, setOpenExportOptions] = useState(false);
  const [exportRow, setExportRow] = useState([]);
  const { data } = config;

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
    </>
  );
};

UsersTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
