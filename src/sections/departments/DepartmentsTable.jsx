import { Delete, Edit } from '@mui/icons-material';
import { Avatar, Box, Card, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import CustomDialog from '../../components/CustomDialog';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { useConfig } from '../../hooks/useConfig';
import { getInitials } from '../../utils/utils';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import DepartmentForm from '../../components/departments/DepartmentForm';

export const DepartmentsTable = ({ count = 0, items = [], fetchingData, domains }) => {
  const config = useConfig();
  const { data } = config;
  const [openEditForm, setOpenEditForm] = useState(null);
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
      {
        accessorKey: 'userCount', // simple recommended way to define a column
        header: `${data?.labels?.user?.plural || 'Users'}`,
      },
    ],
    [],
  );

  const navigate = useNavigate();

  const onDeleteRow = async (row) => {
    try {
      await axios.delete(`/department/${row?.original?._id}`);
      toast.success('Department deleted successfully');
      setTimeout(() => {
        navigate(0);
      }, 1000);
    } catch (error) {
      toast.error(error.message || 'Failed to delete department');
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
          enableColumnOrdering
          state={{
            isLoading: fetchingData,
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
        <DepartmentForm isEdit={true} currentDepartment={openEditForm?.original} domains={domains} />
      </CustomDialog>
    </>
  );
};

DepartmentsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
