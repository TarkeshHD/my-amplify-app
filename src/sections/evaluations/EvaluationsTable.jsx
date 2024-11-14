import { Box, Button, Card, MenuItem, Skeleton, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import {
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleDensePaddingButton as MRTToggleDensePaddingButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
  MaterialReactTable,
} from 'material-react-table';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { debounce, isEmpty } from 'lodash';
import { Delete, Edit, FileDownload, FilterAltOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import CustomDialog from '../../components/CustomDialog';
import CustomDateRangePicker from '../../components/DatePicker/CustomDateRangePicker';
import { SeverityPill } from '../../components/SeverityPill';
import ExportOptions from '../../components/export/ExportOptions';
import QuestionsGrid from '../../components/modules/QuestionsGrid';
import TimeGrid from '../../components/modules/TimeGrid';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import {
  capitalizeFirstLetter,
  convertTimeToDescription,
  getInitials,
  fetchScoresAndStatuses,
  convertUnixToLocalTime,
  getEvaluationAnalytics,
} from '../../utils/utils';
import QuestionsActionGrid from '../../components/modules/QuestionActionGrid';
import JsonLifeCycleEvaluationGrid from '../../components/modules/JsonLifeCycleEvaluationGrid';
import JsonLifeCycleTrainingGrid from '../../components/modules/JsonLifeCycleTrainingGrid';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';

const statusMap = {
  Pending: 'warning',
  Pass: 'success',
  Fail: 'error',
  ongoing: 'warning',
  completed: 'success',
};

const FAKE_DATA = [
  {
    id: '000102',
    module: 'Automotive Training',
    username: 'CW_01',
    session: '29-Jul-2023  -  31-Jul-2023',
    score: '7',
    status: 'Pass',
  },
  {
    id: '000102',
    module: 'Domain Training',
    username: 'CW_02',
    session: '29-Jul-2023  -  31-Jul-2023',
    score: '4',
    status: 'Fail',
  },
];

const EvaluationsTable = React.memo(
  ({ count = 0, items = FAKE_DATA, fetchingData, exportBtnClicked, exportBtnFalse, updateAnalytic, handleRefresh }) => {
    const exportBtnRef = useRef(null);
    const [exportRow, setExportRow] = useState([]);
    const [openEvaluationData, setOpenEvaluationData] = useState(null);
    const [openTrainingData, setOpenTrainingData] = useState(null);
    const [openExportOptions, setOpenExportOptions] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    const analyticsHiddenBtnRef = useRef(null);

    const auth = useAuth();
    const hasDeleteAccess = auth?.permissions?.includes('delete_evaluation');

    const navigate = useNavigate();

    const { userIdParam } = useParams();

    const config = useConfig();
    const { data } = config;

    useEffect(() => {
      if (exportBtnClicked) {
        exportBtnRef.current.click();
        exportBtnFalse();
      }
    }, [exportBtnClicked]);

    const [updatedItems, setUpdatedItems] = useState(items);
    useEffect(() => {}, [updatedItems]);
    const updateItems = async () => {
      const newItems = await Promise.all(items.map(fetchScoresAndStatuses));
      setUpdatedItems(newItems);
    };

    // Call the updateItems function to update your items
    useEffect(() => {
      updateItems();
    }, [items]);

    // Create a debounced click function
    const debouncedClickForAnalytics = useCallback(
      debounce(() => {
        if (analyticsHiddenBtnRef.current) {
          analyticsHiddenBtnRef.current.click();
        }
      }, 500), // 500ms debounce
      [],
    );

    // const scoresList =
    const columns = useMemo(() => {
      const baseColumns = [
        {
          accessorFn: (row) => `${row.moduleId?.name}${row.moduleId?.archived ? '-Deprecated' : ''}`,
          filterFn: (row, _columnId, filterValue) => {
            const moduleName = row.original?.moduleId?.name;
            const archivedSuffix = row.original?.moduleId?.archived ? '-Deprecated' : '';
            const fullModuleName = `${moduleName}${archivedSuffix}`;
            if (!filterValue || filterValue.length === 0) return true;
            return filterValue.includes(fullModuleName);
          },
          header: `${data?.labels?.module?.singular || 'Module'}`,
          filterVariant: 'multi-select',
          size: 100,
          Cell: ({ cell, column, row }) =>
            row?.original?.moduleId?.archived ? (
              <SeverityPill color={'error'} tooltipTitle={'Deprecated'}>
                <Delete sx={{ fontSize: 15, mr: 0.5 }} /> {row.original.moduleId.name}
              </SeverityPill>
            ) : (
              <Typography>{row?.original?.moduleId?.name || '-'}</Typography>
            ),
        },

        {
          size: 250,
          accessorFn: (row) => {
            const endTime = row?.endTime ? row?.endTime : undefined;
            return [row?.startTime, endTime];
          },
          header: 'Session Time',
          filterFn: (row, id, filterValue) => {
            const [startTime, endTime] = row.getValue(id);
            const [startFilterValue, endFilterValue] = filterValue;
            // When there is no filtered Date
            if (startFilterValue === true && endFilterValue === true) {
              return true;
            }

            if (startFilterValue < startTime && startTime < endFilterValue) {
              if (endTime === undefined) {
                // Start time is between, but end time is pending
                return true;
              }

              if (startFilterValue < endTime && endTime < endFilterValue) {
                // Both start time and end time are between
                return true;
              }
            }

            if (endTime !== undefined && startFilterValue < endTime && endTime < endFilterValue) {
              // End time is between
              return true;
            }

            // Neither start time nor end time are between
            return false;
          },
          sortingFn: 'datetime',
          Cell: ({ cell, column, row }) => {
            const startTime = convertUnixToLocalTime(row?.original?.startTime);
            const endTime = row?.original?.endTime ? convertUnixToLocalTime(row?.original?.endTime) : 'Pending';
            return (
              <Typography>
                {startTime} - {endTime}
              </Typography>
            );
          },
          Filter: ({ column }) => <CustomDateRangePicker column={column} />,
        },
        {
          accessorKey: 'duration', // simple recommended way to define a column
          header: 'Duration',
          filterVariant: 'multi-select',
          Cell: ({ cell, column, row }) => {
            const endTime = row?.original?.endTime ? row?.original?.endTime : undefined;
            const startTime = row?.original?.startTime;
            const duration = endTime ? endTime - startTime : undefined;

            return <Typography>{duration > 0 ? convertTimeToDescription(duration) : '-'}</Typography>;
          },
        },

        {
          accessorKey: 'score', // simple recommended way to define a column
          header: 'Score',
          filterVariant: 'multi-select',
        },
        {
          accessorFn: (row) => capitalizeFirstLetter(row.status), // simple recommended way to define a column
          header: 'status',
          Cell: ({ cell, column, row }) => {
            const status = capitalizeFirstLetter(row?.original?.status);
            debouncedClickForAnalytics();
            return <SeverityPill color={statusMap[status]}>{status}</SeverityPill>;
          },
          filterVariant: 'multi-select',
        },
        {
          accessorKey: 'userId.domainId.name', // simple recommended way to define a column
          accessorFn: (row) => `${row.userId?.domainId?.name}${row.userId?.domainId?.archived ? '-Deprecated' : ''}`,
          filterFn: (row, _columnId, filterValue) => {
            const domainName = row.original?.userId?.domainId?.name;
            const archivedSuffix = row.original?.userId?.domainId?.archived ? '-Deprecated' : '';
            const fullDomainName = `${domainName}${archivedSuffix}`;
            if (!filterValue || filterValue.length === 0) return true;
            return filterValue.includes(fullDomainName);
          },
          header: `${data?.labels?.domain?.singular || 'Domain'}`,
          filterVariant: 'multi-select',
          size: 100,
          Cell: ({ cell, column, row }) =>
            row.original?.userId?.domainId?.archived ? (
              <SeverityPill color={'error'} tooltipTitle={'Deprecated'}>
                {' '}
                <Delete sx={{ fontSize: 15, mr: 0.5 }} /> {row.original?.userId?.domainId?.name}
              </SeverityPill>
            ) : (
              <Typography>{row?.original?.userId?.domainId?.name || '-'}</Typography>
            ),
        },
        {
          accessorKey: 'userId.departmentId.name', // simple recommended way to define a column
          accessorFn: (row) =>
            `${row.userId?.departmentId?.name}${row.userId?.departmentId?.archived ? '-Deprecated' : ''}`,
          filterFn: (row, _columnId, filterValue) => {
            const departmentName = row.original?.userId?.departmentId?.name;
            const archivedSuffix = row.original?.userId?.departmentId?.archived ? '-Deprecated' : '';
            const fullDepartmentName = `${departmentName}${archivedSuffix}`;
            if (!filterValue || filterValue.length === 0) return true;
            return filterValue.includes(fullDepartmentName);
          },
          header: `${data?.labels?.department?.singular || 'Department'}`,
          filterVariant: 'multi-select',
          size: 100,
          Cell: ({ cell, column, row }) =>
            row.original?.userId?.departmentId?.archived ? (
              <SeverityPill color={'error'} tooltipTitle={'Deprecated'}>
                {' '}
                <Delete sx={{ fontSize: 15, mr: 0.5 }} /> {row.original?.userId?.departmentId?.name}
              </SeverityPill>
            ) : (
              <Typography>{row?.original?.userId?.departmentId?.name || '-'}</Typography>
            ),
        },
      ];

      // Conditionally add the userId.username column if userId is present
      if (!userIdParam) {
        baseColumns.unshift(
          {
            accessorKey: 'userId.name',
            header: `Name`,
            filterVariant: 'multi-select',
            size: 100,
            Cell: ({ cell, column, row }) => <Typography>{row?.original?.userId?.name || '-'}</Typography>,
          },
          {
            accessorFn: (row) => `${row.userId?.username}${row.userId?.archived ? '-Deprecated' : ''}`,
            filterFn: (row, _columnId, filterValue) => {
              const username = row.original.userId?.username;
              const archivedSuffix = row.original.userId?.archived ? '-Deprecated' : '';
              const fullUsername = `${username}${archivedSuffix}`;
              if (!filterValue || filterValue.length === 0) return true;
              return filterValue.includes(fullUsername);
            },
            header: `${data?.labels?.user?.singular || 'User'}`,
            filterVariant: 'multi-select',
            size: 100,
            Cell: ({ cell, column, row }) =>
              row?.original?.userId?.archived ? (
                <SeverityPill color={'error'} tooltipTitle={'Deprecated'}>
                  {' '}
                  <Delete sx={{ fontSize: 15, mr: 0.5 }} /> {row?.original?.userId?.username || '-'}
                </SeverityPill>
              ) : (
                <Typography>{row?.original?.userId?.username || '-'}</Typography>
              ),
          },
        );
      }

      return baseColumns;
    }, []);

    // Set below flag as well as use it as 'Row' Object to be passed inside forms

    const convertRowDatas = (rows) =>
      rows.map((row) => {
        const startTime = convertUnixToLocalTime(row?.original?.startTime);
        const endTime = row?.original?.endTime ? convertUnixToLocalTime(row?.original?.endTime) : 'Pending';
        const duration = row?.original?.endTime ? row?.original?.endTime - row?.original?.startTime : undefined;
        const values = row.original;
        return [
          values?.userId?.name || '-',
          values?.userId?.username || '-',
          values?.moduleId?.name || '-',
          values?.userId?.domainId?.name || '-',
          values?.departmentId?.name || '-',
          `${startTime} - ${endTime}`,
          duration > 0 ? convertTimeToDescription(duration) : '-',
          values?.score || '-',
          capitalizeFirstLetter(values?.status) || '-',
        ];
      });

    const handleExportRows = (rows, type) => {
      setOpenExportOptions(true);
      setExportRow(convertRowDatas(rows));
    };

    const onConfirmBulkDelete = async () => {
      try {
        setShowConfirmationDialog(false);
        await axios.post(`/archive/bulkArchive`, { type: 'evaluation', data: Object.keys(rowSelection) });
        toast.success('Evaluations deleted successfully');
        setRowSelection({});
        handleRefresh();
      } catch (error) {
        console.log(error);
        toast.error(error.message || 'Failed to delete evaluations');
      }
    };

    const handleRowClick = async (row) => {
      try {
        // Delegagate these to seperate function according to the conditions. !important
        const doc = row?.original;
        let response;
        if (doc?.trainingType === 'jsonLifeCycle') {
          response = await axios.get(`/training/${doc._id}`);
        } else if (!doc?.trainingType) {
          response = await axios.get(`/evaluation/${doc.id}`);
        } else {
          return;
        }
        const responseObj = response?.data?.details;

        const startTime = convertUnixToLocalTime(row?.original?.startTime);
        const endTime = row?.original?.endTime ? convertUnixToLocalTime(row?.original?.endTime) : 'Pending';
        const session = `${startTime} - ${endTime}`;

        const status = capitalizeFirstLetter(row?.original?.status);

        responseObj.status = status;
        responseObj.session = session;
        responseObj.username = row?.original?.userId?.name;
        responseObj.score = row?.original?.score;

        const { answers } = responseObj;
        if (responseObj.mode === 'mcq') {
          responseObj.evaluationDump = responseObj.evaluationDump.mcqBased.map((v, index) => ({
            ...v,
            answeredValue: answers.mcqBased.answerKey[index],
          }));
        } else if (responseObj.mode === 'questionAction') {
          responseObj.evaluationDump = responseObj.evaluationDump.questionActionBased.map((v, index) => ({
            ...v,
            answeredValue: answers.questionActionBased.answerKey[index],
          }));
        }
        if (responseObj.mode === 'jsonLifeCycle') {
          responseObj.evaluationDump = {
            ...responseObj.evaluationDump.jsonLifeCycleBased,
            chapters: responseObj.evaluationDump.jsonLifeCycleBased.chapters.map((chapter) => ({
              ...chapter,
              moments: chapter.moments.map((moment) => {
                const momentAnswer = responseObj.answers.jsonLifeCycleBased.find(
                  (answer) => answer.chapterIndex === chapter.chapterIndex && answer.momentIndex === moment.momentIndex,
                );
                return {
                  ...moment,
                  answers: momentAnswer ? momentAnswer.events : [],
                };
              }),
            })),
          };
        } else if (responseObj.mode === 'time') {
          responseObj.mistakes = responseObj?.answers?.timeBased?.mistakes;
          responseObj.scores = row?.original?.scores;
        }

        if (doc?.trainingType === 'jsonLifeCycle') {
          responseObj.trainingDumpJson = {
            ...responseObj.trainingDumpJson,
            chapters: responseObj.trainingDumpJson.chapters?.map((chapter) => ({
              ...chapter,
              moments: chapter.moments.map((moment) =>
                // CHECK Answers is not an array in this but in evaluation JSON Lifcycle case we are doing something else!??

                ({
                  ...moment,
                  totalTimeTaken: moment?.endTime ? moment.endTime - moment.startTime : undefined,
                  answers: moment?.answers?.events || [],
                }),
              ),
            })),
          };

          setOpenTrainingData({ ...responseObj, trainingType: doc?.trainingType });
        } else if (!doc?.trainingType) {
          setOpenEvaluationData({ ...responseObj, evaluationType: responseObj?.moduleId?.evaluationType });
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message || 'Failed to fetch eval-data');
        setOpenEvaluationData(false);
      }
    };

    const onDeleteRow = async (row) => {
      try {
        const id = row.id || row._id;
        await axios.post(`/evaluation/archive/${id}`);
        toast.success('Evaluation deleted successfully');
        handleRefresh();
      } catch (error) {
        console.log(error);
        toast.error(error.message || 'Failed to delete evaluation');
      }
    };

    const updateAnalytics = (tableValues) => {
      const evalautionAnalytic = getEvaluationAnalytics(tableValues);
      updateAnalytic(evalautionAnalytic);
    };

    const isColumnFiltersEmpty = (table) => {
      const columnFilters = table?.getState()?.columnFilters;
      // TODO: Need to handle filter reset and checks only with  table?.getState()?.columnFilters;
      return !columnFilters || columnFilters.every((filter) => filter.value.length === 0);
    };

    return (
      <>
        <Card>
          <MaterialReactTable
            renderToolbarInternalActions={({ table }) => (
              <Box sx={{ display: 'flex', p: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Tooltip title="Clear filter" arrow>
                  <IconButton
                    sx={{ display: !isColumnFiltersEmpty(table) ? 'block' : 'none', mt: '6px' }}
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

                <Button
                  ref={exportBtnRef}
                  sx={{ display: 'none' }}
                  disabled={table.getPrePaginationRowModel().rows.length === 0}
                  // export all rows, including from the next page, (still respects filtering and sorting)
                  onClick={() => {
                    handleExportRows(table.getPrePaginationRowModel().rows);
                  }}
                  startIcon={<FileDownload />}
                  variant="contained"
                >
                  Export Data
                </Button>
                {/* Process Button - Hidden */}
                <Button
                  ref={analyticsHiddenBtnRef}
                  sx={{ display: 'none' }}
                  disabled={table.getPrePaginationRowModel().rows.length === 0}
                  onClick={() => {
                    updateAnalytics(table.getPrePaginationRowModel().rows); // Sending table data to an outside function
                  }}
                  variant="contained"
                >
                  Analytics Hidden Button
                </Button>
              </Box>
            )}
            renderRowActionMenuItems={({ row, closeMenu, table }) => [
              <MenuItem
                key={0}
                onClick={() => {
                  onDeleteRow(row.original);
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
            ]}
            muiTableBodyRowProps={({ row }) => ({
              onClick: () => {
                handleRowClick(row);
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
            data={updatedItems}
            enableRowSelection // enable some features
            onRowSelectionChange={setRowSelection}
            getRowId={(row) => row._id}
            enableColumnOrdering
            state={{
              isLoading: fetchingData,
              rowSelection,
            }}
            initialState={{ pagination: { pageSize: 10 }, showGlobalFilter: true, showColumnFilters: true }}
            muiTablePaginationProps={{
              rowsPerPageOptions: [5, 10, 15, 20, 25],
            }}
            enableGlobalFilterModes
            positionGlobalFilter="left"
            muiSearchTextFieldProps={{
              placeholder: `Search ${updatedItems.length} rows`,
              sx: { minWidth: '300px' },
              variant: 'outlined',
            }}
            enableFacetedValues
            renderEmptyRowsFallback={() => {
              updateAnalytics([]);
            }}
          />
        </Card>

        {/* View export options */}
        <CustomDialog
          // sx={{ minWidth: '30vw' }}
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

        {/* View Evaluation Data */}
        <CustomDialog
          onClose={() => {
            setOpenEvaluationData(false);
          }}
          sx={{ minWidth: '60vw' }}
          open={Boolean(openEvaluationData)}
          title={<Typography variant="h5">{data?.labels?.evaluation?.singular || 'Evaluation'} </Typography>}
        >
          {openEvaluationData?.loading ? (
            <Box>
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Box>
          ) : openEvaluationData?.mode === 'mcq' ? (
            <QuestionsGrid showValues evalData={openEvaluationData} evaluation={openEvaluationData?.evaluationDump} />
          ) : openEvaluationData?.mode === 'time' ? (
            <TimeGrid showValues evalData={openEvaluationData} evaluation={openEvaluationData?.answers} />
          ) : openEvaluationData?.mode === 'questionAction' ? (
            <QuestionsActionGrid
              showValues
              evalData={openEvaluationData}
              evaluation={openEvaluationData?.evaluationDump}
            />
          ) : openEvaluationData?.mode === 'jsonLifeCycle' ? (
            <JsonLifeCycleEvaluationGrid evalData={openEvaluationData} />
          ) : (
            <></>
          )}
        </CustomDialog>

        {/* View Training Data */}
        <CustomDialog
          onClose={() => {
            setOpenTrainingData(false);
          }}
          sx={{ minWidth: '60vw' }}
          open={Boolean(openTrainingData)}
          title={<Typography variant="h5">{data?.labels?.training?.singular || 'Training'} </Typography>}
        >
          {openTrainingData?.loading ? (
            <Box>
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="rectangular" width={210} height={60} />
              <Skeleton variant="rounded" width={210} height={60} />
            </Box>
          ) : openTrainingData?.trainingType === 'jsonLifeCycle' ? (
            <JsonLifeCycleTrainingGrid trainingData={openTrainingData} />
          ) : (
            <></>
          )}
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
  },
);

EvaluationsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};

export default EvaluationsTable;
