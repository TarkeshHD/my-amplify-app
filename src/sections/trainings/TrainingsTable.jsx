import { Delete, GroupRounded, PersonRounded } from '@mui/icons-material';
import { Box, MenuItem, Skeleton, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import CustomDialog from '../../components/CustomDialog';
import CustomDateRangePicker from '../../components/DatePicker/CustomDateRangePicker';
import { SeverityPill } from '../../components/SeverityPill';
import ExportOptions from '../../components/export/ExportOptions';
import axios from '../../utils/axios';

import ConfirmationDialog from '../../components/ConfirmationDialog';
import CustomGrid from '../../components/grid/CustomGrid';
import JsonLifeCycleTrainingGrid from '../../components/modules/JsonLifeCycleTrainingGrid';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import { useSharedData } from '../../hooks/useSharedData';
import {
  convertTimeToDescription,
  convertUnixToLocalTime,
  getTrainingAnalytics,
  formatSorting,
} from '../../utils/utils';

const statusMap = {
  ongoing: 'warning',
  completed: 'success',
};

const FAKE_DATA = [
  {
    id: '000102',
    module: 'Automotive Training',
    username: 'CW_01',
    session: '29-Jul-2023  -  31-Jul-2023',

    status: 'ongoing',
  },
  {
    id: '000102',
    module: 'Domain Training',
    username: 'CW_02',
    session: '29-Jul-2023  -  31-Jul-2023',
    status: 'completed',
  },
];

export const TrainingsTable = ({
  count = 0,
  items = FAKE_DATA,
  fetchingData,
  exportBtnClicked,
  exportBtnFalse,
  onUrlParamsChange,
  handleRefresh,
}) => {
  const exportBtnRef = useRef(null);
  const [exportRow, setExportRow] = useState([]);
  const [openTrainingData, setOpenTrainingData] = useState(null);
  const [openExportOptions, setOpenExportOptions] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const { departments, modules, domains, loading: sharedDataLoading } = useSharedData();

  const analyticsHiddenBtnRef = useRef(null);

  const auth = useAuth();
  const hasDeleteAccess = auth?.permissions?.includes('delete_training');

  const { userIdParam } = useParams();
  const navigate = useNavigate();

  const config = useConfig();
  const { data } = config;

  const [tableInstance, setTableInstance] = useState(null);

  // If shared data is still loading, show loading state
  if (sharedDataLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton
          variant="rounded"
          height={400}
          sx={{
            bgcolor: 'background.neutral',
            borderRadius: 2,
          }}
        />
      </Box>
    );
  }

  useEffect(() => {
    if (exportBtnClicked) {
      exportBtnRef.current.click();
    }
  }, [exportBtnClicked]);

  const [updatedItems, setUpdatedItems] = useState(items);

  useEffect(() => {
    setUpdatedItems(items);
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

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'userId.departmentId.name',
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
        filterSelectOptions: departments?.map((department) => ({ text: department?.name, value: department?._id })),
        size: 100,
        enableSorting: false,
        Cell: ({ cell, column, row }) =>
          row.original?.userId?.departmentId?.archived ? (
            <Typography sx={{ color: 'darkred' }}>
              {`${row?.original?.userId?.departmentId?.name} - Deprecated` || '-'}
            </Typography>
          ) : (
            <Typography>{row?.original?.userId?.departmentId?.name || '-'}</Typography>
          ),
      },
      {
        accessorKey: 'userId.domainId.name', // simple recommended way to define a column
        header: `${data?.labels?.domain?.singular || 'Domain'}`,
        filterVariant: 'multi-select',
        enableSorting: false,
        filterSelectOptions: domains?.map((domain) => ({ text: domain?.name, value: domain?._id })),
        size: 100,
        Cell: ({ cell, column, row }) => <Typography>{row?.original?.userId?.domainId?.name || '-'}</Typography>,
      },
      {
        accessorFn: (row) => `${row.moduleId?.name}${row.moduleId?.archived ? '-Deprecated' : ''}`,
        filterFn: (row, _columnId, filterValue) => {
          const moduleName = row.original?.moduleId?.name;
          const archivedSuffix = row.original?.moduleId?.archived ? '-Deprecated' : '';
          const fullModuleName = `${moduleName}${archivedSuffix}`;
          if (!filterValue || filterValue.length === 0) return true;
          return filterValue.includes(fullModuleName);
        },
        enableSorting: false,
        header: `${data?.labels?.module?.singular || 'Module'}`,
        filterVariant: 'multi-select',
        filterSelectOptions: modules?.map((module) => ({ text: module?.name, value: module?._id })),
        size: 100,
        Cell: ({ cell, column, row }) =>
          row?.original?.moduleId?.archived ? (
            <Typography sx={{ color: 'darkred' }}>{`${row?.original?.moduleId?.name} - Deprecated` || '-'}</Typography>
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
        header: 'Player Mode',
        filterVariant: 'multi-select',
        filterSelectOptions: [
          { text: 'Single Player', value: 'Single Player' },
          { text: 'Multiplayer', value: 'Multiplayer' },
        ],
        enableSorting: false,
        size: 120,
        Cell: ({ row }) => {
          const isMultiplayer = row.original?.isMultiplayer;
          const mode = isMultiplayer ? 'Multiplayer' : 'Single Player';
          const isDeprecated = row.original?.moduleId?.archived;
          const IconComponent = isMultiplayer ? GroupRounded : PersonRounded;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconComponent
                fontSize="small"
                sx={{
                  color: isDeprecated ? '#f44336' : isMultiplayer ? '#2e7d32' : '#0288d1',
                  fontSize: '0.875rem',
                }}
              />
              {isDeprecated ? (
                <Typography
                  sx={{
                    color: '#f44336',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {`${mode} - Deprecated`}
                </Typography>
              ) : (
                <Box
                  component="span"
                  sx={{
                    backgroundColor: isMultiplayer ? 'rgba(46, 125, 50, 0.1)' : 'rgba(2, 136, 209, 0.1)',
                    color: isMultiplayer ? '#2e7d32' : '#0288d1',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
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
        enableSorting: false,
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
          debouncedClickForAnalytics();
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
        Cell: ({ cell, column, row }) => {
          const endTime = row?.original?.endTime ? row?.original?.endTime : undefined;
          const startTime = row?.original?.startTime;
          const duration = endTime ? endTime - startTime : undefined;
          return <Typography>{duration > 0 ? convertTimeToDescription(duration) : '-'}</Typography>;
        },
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: 'status', // simple recommended way to define a column
        header: 'status',
        Cell: ({ cell, column, row }) => {
          const status = row?.original?.status;
          return <SeverityPill color={statusMap[status]}>{status}</SeverityPill>;
        },
        filterVariant: 'multi-select',
        filterSelectOptions: Object.keys(statusMap).map((status) => ({
          text: status.toUpperCase(),
          value: status.toLowerCase(),
        })),
      },
    ];

    // Conditionally add the userId.username column if userId is present
    if (!userIdParam) {
      baseColumns.unshift(
        {
          accessorKey: 'userId.name',
          header: `Name`,
          size: 100,
          Cell: ({ cell, column, row }) => <Typography>{row?.original?.userId?.name || '-'}</Typography>,
        },
        //     {
        //       accessorKey: 'userId.username',
        //       header: `${data?.labels?.user?.singular || 'User'}`,
        //       filterVariant: 'multi-select',
        //       size: 100,
        //       Cell: ({ cell, column, row }) => <Typography>{row?.original?.userId?.username || '-'}</Typography>,
        //     },
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
        status: values?.status || '-',
      };
    });

  const handleExportRows = (rows, type) => {
    setOpenExportOptions(true);
    setExportRow(convertRowDatas(rows));
  };

  const handleRowClick = async (row) => {
    try {
      setOpenTrainingData({ loading: true });

      const doc = row?.original;

      // We are skipping below stage why?, Making API call for the dump makes much more sense.
      // const response = await axios.get(`/training/${doc._id}`); // doc._id ? It should have been doc.id
      // const responseObj = response?.data?.details;

      const responseObj = {
        trainingDumpJson: doc?.trainingDumpJson,
      };

      console.log('row orginal', row?.original);
      const startTime = convertUnixToLocalTime(row?.original?.startTime);
      const endTime = row?.original?.endTime ? convertUnixToLocalTime(row?.original?.endTime) : 'Pending';
      const session = `${startTime} - ${endTime}`;

      const status = row?.original?.status;

      responseObj.status = status;
      responseObj.session = session;
      responseObj.username = row?.original?.userId?.name;
      responseObj.participants = row?.original?.participants;
      responseObj.completedParticipants = row?.original?.completedParticipants;
      responseObj.participants = row?.original?.participants;

      responseObj.trainingType = row?.original?.trainingType;
      responseObj.isMultiplayer = row?.original?.isMultiplayer;

      const { answers } = responseObj;
      if (row?.original?.trainingType === 'jsonLifeCycle') {
        responseObj.trainingDumpJson = {
          ...responseObj.trainingDumpJson,
          chapters: responseObj.trainingDumpJson.chapters?.map((chapter) => ({
            ...chapter,
            moments: chapter.moments.map((moment) => {
              // Find corresponding events for this chapter/moment from the new structure
              const correspondingAnswer = row?.original?.answers?.jsonLifeCycleBased?.find(
                (answer) => answer.chapterIndex === chapter.chapterIndex && answer.momentIndex === moment.momentIndex,
              );

              return {
                ...moment,
                totalTimeTaken: moment?.endTime ? moment.endTime - moment.startTime : undefined,
                // Use events from the new location
                answers: correspondingAnswer?.events || [],
              };
            }),
          })),
        };
      }

      setOpenTrainingData({ ...responseObj });
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to fetch eval-data');
      setOpenTrainingData(false);
    }
  };

  const onConfirmBulkDelete = async () => {
    try {
      setShowConfirmationDialog(false);
      await axios.post(`/archive/bulkArchive`, { type: 'training', data: Object.keys(rowSelection) });
      toast.success('Trainings deleted successfully');
      setRowSelection({});
      // Get current table state and pass it to handleRefresh
      const tableState = {
        pageIndex: 1, // Reset to first page after deletion
        pageSize: JSON.parse(localStorage.getItem('tablePageSize'))?.trainings || 10,
        sorting: formatSorting(tableInstance?.getState()?.sorting), // Use formatSorting utility
        filters: tableInstance?.getState()?.columnFilters || [], // Get current filters
      };
      handleRefresh(tableState);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete trainings');
    }
  };

  const onDeleteRow = async (row) => {
    try {
      const id = row.id || row._id;
      await axios.post(`/training/archive/${id}`);
      toast.success('Training deleted successfully');
      // Get current table state and pass it to handleRefresh
      const tableState = {
        pageIndex: 1, // Reset to first page after deletion
        pageSize: JSON.parse(localStorage.getItem('tablePageSize'))?.trainings || 10,
        sorting: formatSorting(tableInstance?.getState()?.sorting), // Use formatSorting utility
        filters: tableInstance?.getState()?.columnFilters || [], // Get current filters
      };
      handleRefresh(tableState);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete training');
    }
  };

  const updateAnalytics = (tableValues) => {
    const trainingAnalytic = getTrainingAnalytics(tableValues);
    updateAnalytic(trainingAnalytic);
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
  ];

  return (
    <>
      <CustomGrid
        data={updatedItems}
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
        rowCount={count}
        onUrlParamsChange={onUrlParamsChange}
        tableSource="trainings"
        exportBtnFalse={exportBtnFalse}
        onTableInstanceChange={setTableInstance}
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
          source={'trainings'}
          exportRow={exportRow}
          closeExportOptions={() => setOpenExportOptions(false)}
        />
      </CustomDialog>
      {/* View Training Data */}
      <CustomDialog
        onClose={() => {
          setOpenTrainingData(false);
        }}
        sx={{ minWidth: '60vw' }}
        open={Boolean(openTrainingData && openTrainingData?.trainingType === 'jsonLifeCycle')}
        title={<Typography variant="h5">{data?.labels?.training?.singular || 'Training'}</Typography>}
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
};

TrainingsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
