import { Avatar, Box, Card, MenuItem, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { getInitials } from '../../utils/utils';
import { Stack } from '@mui/system';
import { Delete, Edit } from '@mui/icons-material';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CustomDialog from '../../components/CustomDialog';
import DomainForm from '../../components/domains/DomainForm';
import EditDomainPasswordForm from '../../components/domains/EditDomainPasswordForm';
import { set } from 'lodash';

export const DomainsTable = ({ count = 0, items = [], fetchingData, domains = { domains } }) => {
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

  const onDeleteRow = async (row) => {
    try {
      await axios.delete(`/domain/${row?.original?._id}`);
      toast.success('Domain deleted successfully');
      setTimeout(() => {
        navigate(0);
      }, 1000);
    } catch (error) {
      toast.error(error.message || 'Failed to delete domain');
      console.log(error);
    }
  };

  return (
    <>
      <Card>
        <MaterialReactTable
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
          enableExpanding
          getSubRows={(row) => row.nestedDomains}
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
        <DomainForm isEdit={true} currentDomain={openEditForm?.original} domains={editFormDomains} />
      </CustomDialog>
    </>
  );
};

DomainsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
