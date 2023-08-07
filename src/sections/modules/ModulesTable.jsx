import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Avatar, Box, Card, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Scrollbar } from '../../components/Scrollbar';
import { getFile, getInitials } from '../../utils/utils';
import SearchNotFound from '../../components/SearchNotFound';
import CustomDialog from '../../components/CustomDialog';
import EditPasswordForm from '../../components/users/EditPasswordForm';
import QuestionsGrid from '../../components/modules/QuestionsGrid';

const FAKE_DATA = [
  {
    id: '000102',
    index: '2.2',
    name: 'Automotive Training',
    description: 'This module trains you on how to fixe leaked engine and  put new brakes',
    thumbnail: 'https://picsum.photos/200',
  },
];

export const ModulesTable = ({ count = 0, items = [...FAKE_DATA], fetchingData, handleRowSelection }) => {
  const tableRef = useRef(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'index', // simple recommended way to define a column
        header: 'Index',
      },
      {
        accessorKey: 'thumbnail', // simple recommended way to define a column
        header: 'Thumbnail',
        Cell: ({ cell, column }) => (
          <Box sx={{}}>
            <img style={{ maxWidth: 80 }} alt="celll" src={getFile(cell?.getValue()?.path)} />
          </Box>
        ),
      },
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: 'Name',
      },

      {
        accessorKey: 'description', // simple recommended way to define a column
        header: 'Description',
      },
    ],
    [],
  );

  // Table state
  const [rowSelection, setRowSelection] = useState({});

  // Set below flag as well as use it as 'Row' Object to be passed inside forms
  const [openEditPassForm, setOpenEditPass] = useState(null);
  const [openEvaluationData, setOpenEvalutationData] = useState(null);

  // State Listeners

  useEffect(() => {
    handleRowSelection(rowSelection);
  }, [rowSelection]);

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
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              setOpenEvalutationData(row);
            },
            sx: { cursor: 'pointer' },
          })}
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
            rowSelection,
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
          onRowSelectionChange={setRowSelection}
          getRowId={(originalRow) => originalRow._id}
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

      {/* View Module Data */}
      <CustomDialog
        onClose={() => {
          setOpenEvalutationData(false);
        }}
        sx={{ minWidth: '60vw' }}
        open={Boolean(openEvaluationData)}
        title={<Typography variant="h5">Module's Assessment</Typography>}
      >
        <QuestionsGrid />
      </CustomDialog>
    </>
  );
};

ModulesTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
