import { Delete, Edit, GroupRounded, PersonRounded } from '@mui/icons-material';
import { Box, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import ConfirmationDialog from '../../components/ConfirmationDialog';
import CustomDialog from '../../components/CustomDialog';
import CustomDateRangePicker from '../../components/DatePicker/CustomDateRangePicker';
import { SeverityPill } from '../../components/SeverityPill';
import ExportOptions from '../../components/export/ExportOptions';
import CustomGrid from '../../components/grid/CustomGrid';
import JsonLifeCycleEvaluationGrid from '../../components/modules/JsonLifeCycleEvaluationGrid';
import JsonLifeCycleTrainingGrid from '../../components/modules/JsonLifeCycleTrainingGrid';
import QuestionsActionGrid from '../../components/modules/QuestionActionGrid';
import QuestionsGrid from '../../components/modules/QuestionsGrid';
import TimeGrid from '../../components/modules/TimeGrid';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import { useSharedData } from '../../hooks/useSharedData';
import axios from '../../utils/axios';
import {
  capitalizeFirstLetter,
  convertTimeToDescription,
  convertUnixToLocalTime,
  getEvaluationAnalytics,
} from '../../utils/utils';

const statusMap = {
  Pending: 'warning',
  Pass: 'success',
  Fail: 'error',
  ongoing: 'warning',
  completed: 'success',
  passed: 'success',
  failed: 'error',
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
  ({
    count = 0,
    items = FAKE_DATA,
    fetchingData,
    exportBtnClicked,
    exportBtnFalse,
    updateAnalytic,
    handleRefresh,
    onUrlParamsChange,
  }) => {
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
    const { domains, departments, modules } = useSharedData();

    const config = useConfig();
    const { data } = config;

    useEffect(() => {
      if (exportBtnClicked) {
        exportBtnRef.current.click();
        exportBtnFalse();
      }
    }, [exportBtnClicked]);

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
          filterSelectOptions: modules?.map((module) => ({
            text: module?.archived ? `${module?.name}-Deprecated` : module?.name,
            value: module?._id,
          })),
          size: 100,
          Cell: ({ cell, column, row }) =>
            row?.original?.moduleId?.archived ? (
              <Typography sx={{ color: 'darkred' }}>
                {`${row?.original?.moduleId?.name} - Deprecated` || '-'}
              </Typography>
            ) : (
              <Typography>{row?.original?.moduleId?.name || '-'}</Typography>
            ),
        },
        {
          accessorFn: (row) => (row.isMultiplayer ? 'Multiplayer' : 'Single Player'),
          filterFn: (row, _columnId, filterValue) => {
            const mode = row.original?.isMultiplayer ? 'Multiplayer' : 'Single Player';
            if (!filterValue || filterValue.length === 0) return true;
            return filterValue.includes(mode);
          },
          header: `Player Mode`,
          filterVariant: 'multi-select',
          filterSelectOptions: [
            { text: 'Single Player', value: 'Single Player' },
            { text: 'Multiplayer', value: 'Multiplayer' },
          ],
          size: 120,
          Cell: ({ row }) => {
            const mode = row.original?.isMultiplayer ? 'Multiplayer' : 'Single Player';
            const isDeprecated = row?.original?.moduleId?.archived;

            // Custom approach without using SeverityPill's color prop
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {row.original?.isMultiplayer ? (
                  <GroupRounded
                    fontSize="small"
                    sx={{
                      color: isDeprecated ? '#f44336' : '#7b1fa2',
                      fontSize: '0.875rem'
                    }}
                  />
                ) : (
                  <PersonRounded
                    fontSize="small"
                    sx={{
                      color: isDeprecated ? '#f44336' : '#1976d2',
                      fontSize: '0.875rem'
                    }}
                  />
                )}

                {isDeprecated ? (
                  <Typography sx={{ color: '#f44336', fontSize: '0.75rem', fontWeight: 500 }}>
                    {`${mode} - Deprecated`}
                  </Typography>
                ) : (
                  <Box
                    component="span"
                    sx={{
                      backgroundColor: row.original?.isMultiplayer ? 'rgba(123, 31, 162, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                      color: row.original?.isMultiplayer ? '#7b1fa2' : '#1976d2',
                      borderRadius: '16px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {mode}
                  </Box>
                )}
              </Box>
            );
          },
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
          enableColumnFilter: false,
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
          enableColumnFilter: false,
          enableSorting: false,
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
          filterSelectOptions: Object.keys(statusMap).map((status) => ({
            text: status.toUpperCase(),
            value: status.toLowerCase(),
          })),
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
          enableSorting: false,
          filterSelectOptions: domains?.map((domain) => ({
            text: domain?.archived ? `${domain?.name}-Deprecated` : domain?.name,
            value: domain?._id,
          })),
          size: 100,
          Cell: ({ cell, column, row }) =>
            row.original?.userId?.domainId?.archived ? (
              <Typography sx={{ color: 'darkred' }}>
                {`${row?.original?.userId?.domainId?.name} - Deprecated` || '-'}
              </Typography>
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
          enableSorting: false,
          filterVariant: 'multi-select',
          filterSelectOptions: departments?.map((department) => ({
            text: department?.archived ? `${department?.name}-Deprecated` : department?.name,
            value: department?._id,
          })),
          size: 100,
          Cell: ({ cell, column, row }) =>
            row.original?.userId?.departmentId?.archived ? (
              <Typography sx={{ color: 'darkred' }}>
                {`${row?.original?.userId?.departmentId?.name} - Deprecated` || '-'}
              </Typography>
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
            size: 100,
            enableSorting: false,
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
            size: 100,
            enableSorting: false,
            Cell: ({ cell, column, row }) =>
              row?.original?.userId?.archived ? (
                <Typography sx={{ color: 'darkred' }}>
                  {`${row?.original?.userId?.username} - Deprecated` || '-'}
                </Typography>
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
        const startTime = convertUnixToLocalTime(row?.startTime);
        const endTime = row?.endTime ? convertUnixToLocalTime(row?.endTime) : 'Pending';
        const duration = row?.endTime ? row?.endTime - row?.startTime : undefined;
        const values = row;
        return {
          name: values?.userId?.name || '-',
          username: values?.userId?.username || '-',
          moduleName: values?.moduleId?.name || '-',
          domainName: values?.userId?.domainId?.name || '-',
          departmentName: values?.userId?.departmentId?.name || '-',
          session: `${startTime} - ${endTime}`,
          duration: duration > 0 ? convertTimeToDescription(duration) : '-',
          score: values?.score || '-',
          status: capitalizeFirstLetter(values?.status) || '-',
        };
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
          response = await axios.get(`/training/${row.id}`);
        } else if (!doc?.trainingType) {
          response = await axios.get(`/evaluation/${row.id}`);
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
        responseObj.isMultiplayer = row?.original?.isMultiplayer;

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

    const rowActionMenuItems = ({ row, closeMenu, table }) => [
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
          handleExportRows={handleExportRows}
          exportBtnRef={exportBtnRef}
          enableRowClick
          enableFacetedValues
          enableAnalyticsHiddenButton
          analyticsHiddenBtnRef={analyticsHiddenBtnRef}
          onUrlParamsChange={onUrlParamsChange}
          rowCount={count}
          tableSource="evaluations"
        />

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
            source={'evaluations'}
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
