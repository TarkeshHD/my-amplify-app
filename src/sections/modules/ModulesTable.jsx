import { Delete, Edit, QuestionAnswer, Quiz } from '@mui/icons-material';
import TimerIcon from '@mui/icons-material/Timer';
import { Avatar, Box, Card, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import CustomDialog from '../../components/CustomDialog';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import AssignModulesForm from '../../components/modules/AssignModulesForm';
import ModuleQuestionForm from '../../components/modules/ModuleQuestionsForm';
import ModuleTimeForm from '../../components/modules/ModuleTimeForm';
import QuestionsGrid from '../../components/modules/QuestionsGrid';
import { getFile, getInitials } from '../../utils/utils';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const FAKE_DATA = [
  {
    id: '000102',
    index: '2.2',
    name: 'Automotive Training',
    description: 'This module trains you on how to fixe leaked engine and  put new brakes',
    thumbnail: 'https://picsum.photos/200',
  },
];

export const ModulesTable = ({
  count = 0,
  items = [...FAKE_DATA],
  fetchingData,
  handleRowSelection,
  domains = [],
  departments = [],
  users = [],
}) => {
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
  const [openAssignModules, setOpenAssignModules] = useState(null);
  const [openEvaluationData, setOpenEvalutationData] = useState(null);
  const [openQuestionsForm, setOpenQuestionsForm] = useState(null);
  const [openTimeForm, setOpenTimeForm] = useState(null);

  const navigate = useNavigate();

  const onDeleteRow = async (row) => {
    try {
      await axios.post(`/module/archive/${row.id}`);
      toast.success('Module deleted successfully');
      setTimeout(() => {
        navigate(0);
      }, 700);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete evaluation');
    }
  };

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
                onDeleteRow(row.original);
                closeMenu();
              }}
              sx={{ color: 'error.main' }}
            >
              <Stack spacing={2} direction={'row'}>
                <Delete />
                <Typography>Delete</Typography>
              </Stack>
            </MenuItem>,
            row.original.evaluationType === 'question' ? (
              <MenuItem
                key={1}
                onClick={() => {
                  // onEditRow();
                  setOpenQuestionsForm(row.original);
                  closeMenu();
                }}
              >
                <Stack spacing={2} direction={'row'}>
                  <Quiz />
                  <Typography>Add/Edit Questions </Typography>
                </Stack>
              </MenuItem>
            ) : (
              <MenuItem
                key={4}
                onClick={() => {
                  // onEditRow();
                  setOpenTimeForm(row.original);
                  closeMenu();
                }}
              >
                <Stack spacing={2} direction={'row'}>
                  <TimerIcon />
                  <Typography>Add/Edit Time Evaluation</Typography>
                </Stack>
              </MenuItem>
            ),
            <MenuItem
              key={3}
              onClick={() => {
                // onEditRow();
                setOpenAssignModules(row.original);
                closeMenu();
              }}
            >
              <Stack spacing={2} direction={'row'}>
                <Edit />
                <Typography>Assigned Entities</Typography>
              </Stack>
            </MenuItem>,
          ]}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              setOpenEvalutationData(row.original);
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

      {/* Questions Form */}
      <CustomDialog
        onClose={() => {
          setOpenQuestionsForm(false);
        }}
        sx={{ minWidth: '40vw' }}
        open={Boolean(openQuestionsForm)}
        title={<Typography variant="h5">Questions</Typography>}
      >
        <ModuleQuestionForm isEdit={openQuestionsForm?.evaluation?.length !== 0} currentModule={openQuestionsForm} />
      </CustomDialog>

      {/* Assign Modules Form */}
      <CustomDialog
        onClose={() => {
          setOpenAssignModules(false);
        }}
        open={Boolean(openAssignModules)}
        title={<Typography variant="h5">Edit Assigned Values</Typography>}
      >
        <AssignModulesForm
          domains={domains}
          departments={departments}
          selectedModules={[openAssignModules?.id]}
          isEdit
          moduleAccess={openAssignModules?.moduleAccessId}
          users={users}
        />
      </CustomDialog>

      {/* Time Form */}

      <CustomDialog
        onClose={() => {
          setOpenTimeForm(false);
        }}
        sx={{ minWidth: '40vw' }}
        open={Boolean(openTimeForm)}
        title={<Typography variant="h5">Time Form</Typography>}
      >
        <ModuleTimeForm isEdit={openTimeForm?.evaluation?.length !== 0} currentModule={openTimeForm} />
      </CustomDialog>

      {/* View Module Data */}
      <CustomDialog
        onClose={() => {
          setOpenEvalutationData(false);
        }}
        sx={{ minWidth: '60vw' }}
        open={Boolean(openEvaluationData)}
        title={
          <>
            <Typography variant="h5">Module's Assessment</Typography>
          </>
        }
      >
        {openEvaluationData?.evaluationType === 'question' ? (
          <QuestionsGrid evaluation={openEvaluationData?.evaluation} />
        ) : (
          <ModuleTimeForm isEdit={false} currentModule={openEvaluationData} fieldDisabled={true} />
        )}
      </CustomDialog>
    </>
  );
};

ModulesTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
