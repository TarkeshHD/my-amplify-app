/* eslint-disable react/prop-types */
import { Delete, Edit, Quiz, EditNote, DriveFileRenameOutline, FilterAltOff } from '@mui/icons-material';
import TimerIcon from '@mui/icons-material/Timer';
import { Box, Card, MenuItem, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import CustomDialog from '../../components/CustomDialog';
import AssignModulesForm from '../../components/modules/AssignModulesForm';
import ModuleQuestionForm from '../../components/modules/ModuleQuestionsForm';
import ModuleTimeForm from '../../components/modules/ModuleTimeForm';
import QuestionsGrid from '../../components/modules/QuestionsGrid';
import { getFile } from '../../utils/utils';
import axios from '../../utils/axios';
import ModuleQuestionActionForm from '../../components/modules/ModuleQuestionActionForm';
import QuestionsActionGrid from '../../components/modules/QuestionActionGrid';
import { useAuth } from '../../hooks/useAuth';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import noImagesAvailable from '../../assets/no_image_available.jpg';
import ModuleEditJsonForm from '../../components/modules/ModuleEditJsonForm';
import JsonLifeCycleEvaluationGrid from '../../components/modules/JsonLifeCycleEvaluationGrid';
import CustomGrid from '../../components/grid/CustomGrid';
import { useSharedData } from '../../hooks/useSharedData';
import { useConfig } from '../../hooks/useConfig';

export const ModulesTable = ({
  count = 0,
  items = [{}],
  fetchingData,
  handleRowSelection,
  domains = [],
  departments = [],
  users = [],
  handleRefresh,
  onUrlParamsChange,
}) => {
  const tableRef = useRef(null);

  const currentUser = useAuth();
  const { modules: moduleOptions } = useSharedData();

  const config = useConfig();
  const { data: configData } = config;
  const hideThumbnail = configData?.features?.modules?.columns?.thumbnail === 'off';

  const columns = useMemo(
    () => [
      {
        accessorKey: 'index', // simple recommended way to define a column
        header: 'Index',
      },
      {
        accessorKey: 'thumbnail', // simple recommended way to define a column
        header: 'Thumbnail',
        enableColumnFilter: false,
        enableHiding: false,
        Cell: ({ cell, column }) => (
          <Box sx={{}}>
            <img
              style={{ maxWidth: 80 }}
              alt="cell"
              src={getFile(cell?.getValue())}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop if fallback also fails
                e.target.src = noImagesAvailable; // Set the fallback image when the image fails to load
              }}
            />
          </Box>
        ),
      },
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: 'Name',
        filterVariant: 'multi-select',
        filterSelectOptions: moduleOptions
          .filter((module) => !module?.archived)
          ?.map((module) => ({ text: module?.name, value: module?.name })),
      },

      {
        accessorKey: 'description', // simple recommended way to define a column
        header: 'Description',
        enableColumnFilter: false,
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
  const [openQuestionActionForm, setOpenQuestionActionForm] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [openEditFileForm, setOpenEditFileForm] = useState(null);

  const auth = useAuth();
  const hasDeleteAccess = auth?.permissions?.includes('delete_module');

  const onDeleteRow = async (row) => {
    const id = row.id || row._id;
    try {
      await axios.post(`/module/archive/${id}`);
      toast.success('Module deleted successfully');
      handleRefresh();
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete evaluation');
    }
  };

  // State Listeners

  useEffect(() => {
    handleRowSelection(rowSelection);
  }, [rowSelection]);

  const onConfirmBulkDelete = async () => {
    try {
      setShowConfirmationDialog(false);
      await axios.post(`/archive/bulkArchive`, { type: 'module', data: Object.keys(rowSelection) });
      toast.success('Modules deleted successfully');
      setRowSelection({});
      handleRefresh();
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete modules');
    }
  };

  const handleRowClick = async (row) => {
    if (row?.original?.evaluationType === "jsonLifeCycle") {

      if (row?.original?.evaluation.length > 0) {
        setOpenEvalutationData(row.original);
      } else {
        try {
          const response = await axios.get(`/module/trainingValues/${row?.id}`);
          row.original.evaluation = [response?.data?.trainingData]
          setOpenEvalutationData(row.original);
        } catch (error) {
          toast.error('Associated Data Not Found');
          setOpenEvalutationData(false);
        }
      }
    } else {
      setOpenEvalutationData(row.original);
    }
    console.log(row, 'llllllllllllllllllllllllllllllllll');
  };

  const rowActionMenuItems = ({ row, closeMenu, table }) => [
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
    currentUser?.user?.role === 'productAdmin' && (
      <>
        {(() => {
          if (row.original.evaluationType === 'question') {
            return (
              <MenuItem
                key={1}
                onClick={() => {
                  setOpenQuestionsForm(row.original);
                  closeMenu();
                }}
              >
                <Stack spacing={2} direction={'row'}>
                  <Quiz />
                  <Typography>Edit Question Module</Typography>
                </Stack>
              </MenuItem>
            );
          }
          if (row.original.evaluationType === 'time') {
            return (
              <MenuItem
                key={4}
                onClick={() => {
                  setOpenTimeForm(row.original);
                  closeMenu();
                }}
              >
                <Stack spacing={2} direction={'row'}>
                  <TimerIcon />
                  <Typography>Edit Time Module</Typography>
                </Stack>
              </MenuItem>
            );
          }
          if (row?.original?.evaluationType === 'questionAction') {
            return (
              <MenuItem
                key={2}
                onClick={() => {
                  setOpenQuestionActionForm(row.original);
                  closeMenu();
                }}
              >
                <Stack spacing={2} direction={'row'}>
                  <EditNote />
                  <Typography>Edit Question Action Module</Typography>
                </Stack>
              </MenuItem>
            );
          }
          if (row?.original?.evaluationType === 'jsonLifeCycle') {
            return (
              <MenuItem
                key={3}
                onClick={() => {
                  setOpenEditFileForm(row.original);
                  closeMenu();
                }}
              >
                <Stack spacing={2} direction={'row'}>
                  <DriveFileRenameOutline />
                  <Typography>Edit JSON File Module</Typography>
                </Stack>
              </MenuItem>
            );
          }
          return null; // Render nothing for other evaluation types
        })()}
      </>
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
        handleRowClick={handleRowClick}
        setShowConfirmationDialog={setShowConfirmationDialog}
        hasDeleteAccess={hasDeleteAccess}
        showExportButton={false}
        onUrlParamsChange={onUrlParamsChange}
        rowCount={count}
        tableState={{ columnVisibility: { thumbnail: !hideThumbnail } }}
        tableSource="modules"
      />

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
          selectedModules={[openAssignModules?._id]}
          isEdit
          moduleAccess={openAssignModules?.moduleAccessId}
          users={users}
          handleRefresh={handleRefresh}
          setOpenAssignForm={setOpenAssignModules}
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

      {/* Question Action Form */}
      <CustomDialog
        onClose={() => {
          setOpenQuestionActionForm(false);
        }}
        sx={{ minWidth: '40vw' }}
        open={Boolean(openQuestionActionForm)}
        title={<Typography variant="h5">Question Action Form</Typography>}
      >
        <ModuleQuestionActionForm
          isEdit={openQuestionActionForm?.evaluation?.length !== 0}
          currentModule={openQuestionActionForm}
        />
      </CustomDialog>

      {/* Json File Form */}
      <CustomDialog
        onClose={() => {
          setOpenEditFileForm(false);
        }}
        sx={{ minWidth: '40vw' }}
        open={Boolean(openEditFileForm)}
        title={<Typography variant="h5">Json File Form</Typography>}
      >
        <ModuleEditJsonForm isEdit={openEditFileForm?.evaluation?.length !== 0} currentModule={openEditFileForm} />
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
        {(() => {
          if (openEvaluationData?.evaluationType === 'question') {
            return <QuestionsGrid evaluation={openEvaluationData?.evaluation} />;
          }
          if (openEvaluationData?.evaluationType === 'time') {
            return <ModuleTimeForm isEdit={false} currentModule={openEvaluationData} fieldDisabled />;
          }
          if (openEvaluationData?.evaluationType === 'questionAction') {
            return <QuestionsActionGrid evaluation={openEvaluationData?.evaluation} />;
          }
          if (openEvaluationData?.evaluationType === 'jsonLifeCycle') {
            console.log(openEvaluationData,'kkkkkkkkkkkkkkkkkkkksssssssss')
            return (
              <JsonLifeCycleEvaluationGrid
                evalData={{
                  evaluationDump: {
                    ...openEvaluationData.evaluation[0],
                    fromModule:true
                  },
                }}
                showModule:true
              />
            );
          }
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

ModulesTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
