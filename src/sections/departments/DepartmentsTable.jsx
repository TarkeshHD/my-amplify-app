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

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomDialog from '../../components/CustomDialog';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { useConfig } from '../../hooks/useConfig';
import { getInitials } from '../../utils/utils';
import axios from '../../utils/axios';
import DepartmentForm from '../../components/departments/DepartmentForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import CustomGrid from '../../components/grid/CustomGrid';

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

  const rowActionMenuItems = ({ row, closeMenu, table }) => [
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
  ];

  return (
    <>
      <CustomGrid
        data={items}
        columns={columns}
        rowActionMenuItems={rowActionMenuItems}
        setRowSelection={setRowSelection}
        rowSelection={rowSelection}
        fetchingData={fetchingData}
        setShowConfirmationDialog={setShowConfirmationDialog}
        hasDeleteAccess={hasDeleteAccess}
        showExportButton={false}
      />
      {/* Edit Domain Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditForm(false);
        }}
        open={Boolean(openEditForm)}
        title={<Typography variant="h5">Edit Department</Typography>}
      >
        <DepartmentForm
          isEdit
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
