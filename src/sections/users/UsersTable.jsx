import { Delete, Edit } from '@mui/icons-material';
import { MenuItem, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash';

import CustomDialog from '../../components/CustomDialog';
import ExportOptions from '../../components/export/ExportOptions';
import EditPasswordForm from '../../components/users/EditPasswordForm';
import { useConfig } from '../../hooks/useConfig';
import { addToHistory } from '../../utils/utils';
import axios from '../../utils/axios';
import { useAuth } from '../../hooks/useAuth';
import TraineeForm from '../../components/users/TraineeForm';
import AdminForm from '../../components/users/AdminForm';
import SuperAdminForm from '../../components/users/SuperAdminForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import CustomGrid from '../../components/grid/CustomGrid';

export const UsersTable = ({
  count = 0,
  items = [],
  fetchingData,
  exportBtnClicked,
  exportBtnFalse,
  domains,
  departments,
  handleRefresh,
  handleRowSelection,
  onUrlParamsChange,
}) => {
  console.log('FETCHING DATA', fetchingData);
  const exportBtnRef = useRef(null);
  const config = useConfig();
  const [openExportOptions, setOpenExportOptions] = useState(false);
  const [exportRow, setExportRow] = useState([]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const auth = useAuth();
  const hasDeleteAccess = auth?.permissions?.includes('delete_user');
  const { data } = config;

  const navigate = useNavigate();

  useEffect(() => {
    if (exportBtnClicked) {
      exportBtnRef.current.click();
      exportBtnFalse();
    }
  }, [exportBtnClicked]);

  useEffect(() => {
    if (!isEmpty(rowSelection)) {
      // Get the full row data based on the selected IDs
      const selectedRows = Object.keys(rowSelection).map(
        (id) => items.find((row) => row._id === id), // Match the ID with the original data
      );

      handleRowSelection(selectedRows); // Pass the full row data
    } else {
      handleRowSelection([]); // Reset the selection if no rows are selected
    }
  }, [rowSelection, items]);

  const columns = useMemo(
    () =>
      [
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
          filterVariant: 'multi-select',
          filterSelectOptions: data?.roles.map((role) => ({ text: role, value: role })),
        },
        {
          accessorFn: (row) => row?.domainId?.name || 'NA', // simple recommended way to define a column
          header: `${data?.labels?.domain?.singular || 'Domain'}`,
          filterVariant: 'multi-select',
          enableSorting: false,
          filterSelectOptions: domains?.map((domain) => ({ text: domain?.name, value: domain?._id })),
        },
        data?.features?.traineeType?.state === 'on'
          ? {
              accessorKey: 'traineeType', // simple recommended way to define a column
              header: `${data?.features?.traineeType?.label?.singular || 'Trainee Type'}`,
              filterVariant: 'multi-select',
              size: 100,
              Cell: ({ cell, column, row }) => <Typography>{row?.original?.traineeType || 'NA'}</Typography>,
            }
          : null,
        {
          accessorFn: (row) => row?.departmentId?.name || 'NA', // simple recommended way to define a column
          header: `${data?.labels?.department?.singular || 'Department'}`,
          filterVariant: 'multi-select',
          enableSorting: false,
          filterSelectOptions: departments?.map((department) => ({ text: department?.name, value: department?._id })),
        },
      ].filter((column) => column !== null), // Filter out null columns
    [domains, departments],
  );

  // Set below flag as well as use it as 'Row' Object to be passed inside forms
  const [openEditPassForm, setOpenEditPass] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(null);

  const convertRowDatas = (rows) =>
    rows.map((row) => {
      const values = row;
      const convertedValue = {
        name: values?.name || 'NA',
        username: values?.username || 'NA',
        role: values?.role || 'NA',
        domainName: values?.domainId?.name || 'NA',
        departmentName: values?.departmentId?.name || 'NA',
      };

      // Add trainee Type values, if it exist
      if (data?.features?.traineeType?.state === 'on') {
        convertedValue.traineeType = values?.traineeType || 'NA';
      }
      return convertedValue;
    });

  const handleExportRows = (rows, type) => {
    setOpenExportOptions(true);
    setExportRow(convertRowDatas(rows));
  };

  const onDeleteRow = async (row) => {
    try {
      // Delete row
      const response = await axios.delete(`/user/archive/${row?.original?.id}`);
      toast.success('User deleted successfully');
      handleRefresh();
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

  const onConfirmBulkDelete = async () => {
    try {
      setShowConfirmationDialog(false);
      await axios.post(`/archive/bulkArchive`, { type: 'user', data: Object.keys(rowSelection) });
      toast.success('Users deleted successfully');
      setRowSelection({});
      handleRefresh();
    } catch (error) {
      setShowConfirmationDialog(false);
      console.log(error);
      toast.error(error.message || 'Failed to delete users');
    }
  };

  const onCloseEditUserForm = () => {
    setOpenEditForm(false);
    handleRefresh();
  };

  const onCloseEditPasswordForm = () => {
    setOpenEditPass(false);
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
  ];

  return (
    <>
      <CustomGrid
        data={items}
        onUrlParamsChange={onUrlParamsChange}
        rowCount={count}
        columns={columns}
        rowActionMenuItems={rowActionMenuItems}
        setRowSelection={setRowSelection}
        rowSelection={rowSelection}
        fetchingData={fetchingData}
        handleRowClick={handleRowClick}
        setShowConfirmationDialog={setShowConfirmationDialog}
        hasDeleteAccess={hasDeleteAccess}
        handleExportRows={handleExportRows}
        exportBtnRef={exportBtnRef}
        tableSource="users"
      />

      {/* View export options */}
      <CustomDialog
        onClose={() => {
          setOpenExportOptions(false);
        }}
        open={Boolean(openExportOptions)}
        title={<Typography variant="h5">Export Options</Typography>}
      >
        <ExportOptions source={'users'} exportRow={exportRow} closeExportOptions={() => setOpenExportOptions(false)} />
      </CustomDialog>

      {/* Edit Password Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditPass(false);
        }}
        open={Boolean(openEditPassForm)}
        title={<Typography variant="h5">Edit Password</Typography>}
      >
        <EditPasswordForm user={openEditPassForm?.original} handleClose={onCloseEditPasswordForm} />
      </CustomDialog>

      {/* Edit User Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditForm(false);
        }}
        open={Boolean(openEditForm)}
        title={<Typography variant="h5">Edit User</Typography>}
      >
        {(() => {
          const role = openEditForm?.original?.role;
          if (role === 'user') {
            return (
              <TraineeForm
                isEdit
                currentUser={openEditForm?.original}
                domains={domains}
                departments={departments}
                handleClose={onCloseEditUserForm}
              />
            );
          }
          if (role === 'admin') {
            return (
              <AdminForm
                isEdit
                currentUser={openEditForm?.original}
                domains={domains}
                handleClose={onCloseEditUserForm}
              />
            );
          }
          return <SuperAdminForm isEdit currentUser={openEditForm?.original} handleClose={onCloseEditUserForm} />;
        })()}
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

UsersTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
