import { IconButton, Box, Card, MenuItem, Typography, Tooltip } from '@mui/material';
import {
  MaterialReactTable,
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
} from 'material-react-table';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Stack } from '@mui/system';
import { Delete, Edit, FilterAltOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { set, isEmpty } from 'lodash';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { getInitials } from '../../utils/utils';
import axios from '../../utils/axios';
import CustomDialog from '../../components/CustomDialog';
import DomainForm from '../../components/domains/DomainForm';
import EditDomainPasswordForm from '../../components/domains/EditDomainPasswordForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import CustomGrid from '../../components/grid/CustomGrid';

export const DomainsTable = ({ count = 0, items = [], fetchingData, domains = { domains }, handleRefresh }) => {
  const navigate = useNavigate();
  const [editFormDomains, setEditFormDomains] = useState(null);
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: 'Name',
      },
    ],
    [items],
  );

  const [openEditPassForm, setOpenEditPassForm] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const auth = useAuth();
  const hasDeleteAccess = auth?.permissions?.includes('delete_domain');

  const onDeleteRow = async (row) => {
    try {
      await axios.delete(`/domain/${row?.original?._id}`);
      toast.success('Domain deleted successfully');
      handleRefresh();
    } catch (error) {
      toast.error(error.message || 'Failed to delete domain');
      console.log(error);
    }
  };

  const onConfirmBulkDelete = async () => {
    try {
      setShowConfirmationDialog(false);
      await axios.post(`/archive/bulkArchive`, { type: 'domain', data: Object.keys(rowSelection) });
      toast.success('Domains deleted successfully');
      setRowSelection({});
      handleRefresh();
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete domains');
    }
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
        // Removing the current domain from the domain lists
        const currentDomains = domains.filter((domain) => domain._id !== row.original._id);
        setEditFormDomains(currentDomains);
        setOpenEditForm(row);
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
        setOpenEditPassForm(row);
      }}
    >
      <Stack spacing={2} direction={'row'}>
        <Edit />
        <Typography>Edit Password</Typography>
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
        enableExpanding
      />

      {/* Edit Password Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditPassForm(false);
        }}
        open={Boolean(openEditPassForm)}
        title={<Typography variant="h5">Edit Password</Typography>}
      >
        <EditDomainPasswordForm user={openEditPassForm?.original} />
      </CustomDialog>

      {/* Edit Domain Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditForm(false);
        }}
        open={Boolean(openEditForm)}
        title={<Typography variant="h5">Edit Domain</Typography>}
      >
        <DomainForm isEdit currentDomain={openEditForm?.original} domains={editFormDomains} />
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

DomainsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
