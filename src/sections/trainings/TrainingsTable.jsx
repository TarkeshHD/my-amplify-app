import { Box, Button, Card, MenuItem, Typography, IconButton, Tooltip, Skeleton } from '@mui/material';
import {
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleDensePaddingButton as MRTToggleDensePaddingButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
  MaterialReactTable,
} from 'material-react-table';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { debounce, isEmpty } from 'lodash';
import { Delete, FileDownload, FilterAltOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack } from '@mui/system';

import CustomDialog from '../../components/CustomDialog';
import axios from '../../utils/axios';
import CustomDateRangePicker from '../../components/DatePicker/CustomDateRangePicker';
import { SeverityPill } from '../../components/SeverityPill';
import ExportOptions from '../../components/export/ExportOptions';

import { useConfig } from '../../hooks/useConfig';
import JsonLifeCycleEvaluationGrid from '../../components/modules/JsonLifeCycleEvaluationGrid';
import JsonLifeCycleTrainingGrid from '../../components/modules/JsonLifeCycleTrainingGrid';
import { convertTimeToDescription, convertUnixToLocalTime, getTrainingAnalytics } from '../../utils/utils';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import CustomGrid from '../../components/grid/CustomGrid';

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
  updateAnalytic,
  handleRefresh,
}) => {
  const exportBtnRef = useRef(null);
  const [exportRow, setExportRow] = useState([]);
  const [openTrainingData, setOpenTrainingData] = useState(null);
  const [openExportOptions, setOpenExportOptions] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const analyticsHiddenBtnRef = useRef(null);

  const auth = useAuth();
  const hasDeleteAccess = auth?.permissions?.includes('delete_training');

  const { userIdParam } = useParams();
  const navigate = useNavigate();

  const config = useConfig();
  const { data } = config;

  useEffect(() => {
    if (exportBtnClicked) {
      exportBtnRef.current.click();
      exportBtnFalse();
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
              {' '}
              <Delete sx={{ fontSize: 15 }} /> {row.original.moduleId.name}
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
        filterVariant: 'multi-select',
        Cell: ({ cell, column, row }) => {
          const endTime = row?.original?.endTime ? row?.original?.endTime : undefined;
          const startTime = row?.original?.startTime;
          const duration = endTime ? endTime - startTime : undefined;
          return <Typography>{duration > 0 ? convertTimeToDescription(duration) : '-'}</Typography>;
        },
      },
      {
        accessorKey: 'status', // simple recommended way to define a column
        header: 'status',
        Cell: ({ cell, column, row }) => {
          const status = row?.original?.status;
          return <SeverityPill color={statusMap[status]}>{status}</SeverityPill>;
        },
        filterVariant: 'multi-select',
      },
      // {
      //   accessorKey: 'userId.domainId.name', // simple recommended way to define a column
      //   header: `${data?.labels?.domain?.singular || 'Domain'}`,
      //   filterVariant: 'multi-select',
      //   size: 100,
      //   Cell: ({ cell, column, row }) => <Typography>{row?.original?.userId?.domainId?.name || '-'}</Typography>,
      // },
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
      const startTime = convertUnixToLocalTime(row?.original?.startTime);
      const endTime = row?.original?.endTime ? convertUnixToLocalTime(row?.original?.endTime) : 'Pending';
      const duration = row?.original?.endTime ? row?.original?.endTime - row?.original?.startTime : undefined;
      const values = row.original;
      return [
        values?.userId?.name || '-',
        values?.userId?.username || '-',
        values?.moduleId?.name || '-',
        values?.userId?.domainId?.name || '-',
        values?.userId?.departmentId?.name || '-',
        `${startTime} - ${endTime}`,
        duration > 0 ? convertTimeToDescription(duration) : '-',
        values?.status || '-',
      ];
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
      const startTime = convertUnixToLocalTime(row?.original?.startTime);
      const endTime = row?.original?.endTime ? convertUnixToLocalTime(row?.original?.endTime) : 'Pending';
      const session = `${startTime} - ${endTime}`;

      const status = row?.original?.status;

      responseObj.status = status;
      responseObj.session = session;
      responseObj.username = row?.original?.userId?.name;

      responseObj.trainingType = row?.original?.trainingType;

      const { answers } = responseObj;
      if (row?.original?.trainingType === 'jsonLifeCycle') {
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
      handleRefresh();
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
      setTimeout(() => {
        navigate(0);
      }, 700);
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
          initialState={{ pagination: { pageSize: 5 }, showGlobalFilter: true, showColumnFilters: true }}
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
          ]}
        />
      </Card>
      =======
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
        updateAnalytics={updateAnalytics}
        enableRowClick
        enableFacetedValues
        enableAnalyticsHiddenButton
        analyticsHiddenBtnRef={analyticsHiddenBtnRef}
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
          headers={columns.map((column) => column.header)}
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
      ></ConfirmationDialog>
      />
    </>
  );
};

TrainingsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
