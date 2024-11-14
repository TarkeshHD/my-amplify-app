import { Delete, FilterAltOff, Edit } from '@mui/icons-material';
import { Box, Card, IconButton, MenuItem, Stack, Typography, Tooltip } from '@mui/material';
import {
  MaterialReactTable,
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
} from 'material-react-table';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { isEmpty } from 'lodash';

import CustomDialog from '../../components/CustomDialog';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { useConfig } from '../../hooks/useConfig';
import { getInitials } from '../../utils/utils';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import DepartmentForm from '../../components/departments/DepartmentForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';

export const DepartmentsTable = ({ count = 0, items = [], fetchingData, domains, handleRefresh }) => {
  const config = useConfig();
  const { data } = config;
  const [openEditForm, setOpenEditForm] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const auth = useAuth();
  const hasDeleteAccess = auth?.permissions?.includes('delete_department');

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: `${data?.labels?.department?.singular || 'Department'}`,
      },
      {
        accessorFn: (row) => row?.domainId?.name || 'NA', // simple recommended way to define a column
        header: `${data?.labels?.domain?.singular || 'Domain'}`,
      },
    ],
    [],
  );

  const onDeleteRow = async (row) => {
    try {
      await axios.delete(`/department/${row?.original?._id}`);
      toast.success('Department deleted successfully');
      handleRefresh();
    } catch (error) {
      toast.error(error.message || 'Failed to delete department');
      console.log(error);
    }
  };

  const onConfirmBulkDelete = async () => {
    try {
      setShowConfirmationDialog(false);
      await axios.post(`/archive/bulkArchive`, { type: 'department', data: Object.keys(rowSelection) });
      toast.success('Departments deleted successfully');
      setRowSelection({});
      handleRefresh();
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete departments');
    }
  };

  const onCloseDepartmentForm = async () => {
    setOpenEditForm(false);
    handleRefresh();
  };

  return (
    <>
      <Card>
        <MaterialReactTable
          renderToolbarInternalActions={({ table }) => (
            <Box sx={{ display: 'flex', p: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Tooltip title="Clear filter" arrow>
                <IconButton
                  sx={{ display: table?.getState()?.columnFilters?.length > 0 ? 'block' : 'none', mt: '6px' }}
                  onClick={() => {
                    table.resetColumnFilters();
                  }}
                >
                  <FilterAltOff color="warning" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bulk delete" arrow>
                <IconButton
                  onClick={() => setShowConfirmationDialog(true)}
                  sx={{ display: hasDeleteAccess && !isEmpty(rowSelection) ? 'block' : 'none', mt: '6px' }}
                >
                  <Delete color={isEmpty(rowSelection) ? 'grey' : 'error'} />
                </IconButton>
              </Tooltip>
              <MRTToggleFiltersButton table={table} />
              <MRTShowHideColumnsButton table={table} />
              <MRTFullScreenToggleButton table={table} />
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
                setOpenEditForm(row);
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
          getRowId={(row) => row._id}
          onRowSelectionChange={setRowSelection}
          enableColumnOrdering
          state={{
            isLoading: fetchingData,
            rowSelection,
          }}
          initialState={{ pagination: { pageSize: 10 }, showGlobalFilter: true }}
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
      {/* Edit Domain Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditForm(false);
        }}
        open={Boolean(openEditForm)}
        title={<Typography variant="h5">Edit Department</Typography>}
      >
        <DepartmentForm
          isEdit={true}
          currentDepartment={openEditForm?.original}
          domains={domains}
          handleClose={onCloseDepartmentForm}
        />
      </CustomDialog>

      <ConfirmationDialog
        onClose={() => {
          setShowConfirmationDialog(false);
        }}
        open={showConfirmationDialog}
        title={'Delete'}
        description={'Do you want to perform this bulk delete option?'}
        onConfirm={onConfirmBulkDelete}
      />
    </>
  );
};

DepartmentsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
