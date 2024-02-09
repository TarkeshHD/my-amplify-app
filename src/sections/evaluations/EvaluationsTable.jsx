import { Box, Button, Card, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import {
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleDensePaddingButton as MRTToggleDensePaddingButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
  MaterialReactTable,
} from 'material-react-table';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Delete, Edit, FileDownload } from '@mui/icons-material';
import CustomDialog from '../../components/CustomDialog';
import CustomDateRangePicker from '../../components/DatePicker/CustomDateRangePicker';
import { SeverityPill } from '../../components/SeverityPill';
import ExportOptions from '../../components/export/ExportOptions';
import QuestionsGrid from '../../components/modules/QuestionsGrid';
import TimeGrid from '../../components/modules/TimeGrid';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { capitalizeFirstLetter, getInitials } from '../../utils/utils';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchScoresAndStatuses } from '../../utils/utils';

const statusMap = {
  Pending: 'warning',
  Pass: 'success',
  Fail: 'error',
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

export const EvaluationsTable = ({ count = 0, items = FAKE_DATA, fetchingData, exportBtnClicked, exportBtnFalse }) => {
  const exportBtnRef = useRef(null);
  const [exportRow, setExportRow] = useState([]);
  const [openEvaluationData, setOpenEvalutationData] = useState(null);
  const [openExportOptions, setOpenExportOptions] = useState(false);

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
  const updateItems = async () => {
    const newItems = await Promise.all(items.map(fetchScoresAndStatuses));
    setUpdatedItems(newItems);
  };

  // Call the updateItems function to update your items
  useEffect(() => {
    updateItems();
  }, [items]);
  // const scoresList =
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'moduleId.name', // simple recommended way to define a column
        header: `${data?.labels?.module?.singular || 'Module'}`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.moduleId?.name || '-'}</Typography>;
        },
      },
      {
        accessorKey: 'userId.domainId.name', // simple recommended way to define a column
        header: `${data?.labels?.domain?.singular || 'Domain'}`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.userId?.domainId?.name || '-'}</Typography>;
        },
      },
      {
        accessorKey: 'userId.departmentId.name', // simple recommended way to define a column
        header: `${data?.labels?.department?.singular || 'Department'}`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.userId?.departmentId?.name || '-'}</Typography>;
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
          const tz = moment.tz.guess();
          const startTime = moment.unix(row?.original?.startTime).tz(tz).format('DD/MM/YYYY HH:mm');
          const endTime = row?.original?.endTime
            ? moment.unix(row?.original?.endTime).tz(tz).format('DD/MM/YYYY HH:mm')
            : 'Pending';
          return (
            <Typography>
              {startTime} - {endTime}
            </Typography>
          );
        },
        Filter: ({ column }) => <CustomDateRangePicker column={column} />,
      },

      {
        accessorKey: 'score', // simple recommended way to define a column
        header: 'Score',
        filterVariant: 'multi-select',
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
    ];

    // Conditionally add the userId.username column if userId is present
    if (!userIdParam) {
      baseColumns.unshift({
        accessorKey: 'userId?.username' || 'Hello',
        header: `${data?.labels?.user?.singular || 'User'}`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.userId?.username || '-'}</Typography>;
        },
      });
    }

    return baseColumns;
  }, []);

  // Set below flag as well as use it as 'Row' Object to be passed inside forms

  const convertRowDatas = (rows) => {
    return rows.map((row) => {
      const tz = moment.tz.guess();
      const startTime = moment.unix(row?.original?.startTime).tz(tz).format('DD/MM/YYYY HH:mm');
      const endTime = row?.original?.endTime
        ? moment.unix(row?.original?.endTime).tz(tz).format('DD/MM/YYYY HH:mm')
        : 'Pending';
      const values = row.original;
      return [
        values?.userId?.username || '-',
        values?.moduleId?.name || '-',
        values?.userId?.domainId?.name || '-',
        values?.departmentId?.name || '-',
        `${startTime} - ${endTime}`,
        values?.score || '-',
        values?.status || '-',
      ];
    });
  };

  const handleExportRows = (rows, type) => {
    setOpenExportOptions(true);
    setExportRow(convertRowDatas(rows));
  };

  const handleRowClick = async (row) => {
    try {
      setOpenEvalutationData({ loading: true });
      const doc = row?.original;
      const response = await axios.get(`/evaluation/${doc.id}`);
      const responseObj = response?.data?.details;

      const tz = moment.tz.guess();
      const startTime = moment.unix(row?.original?.startTime).tz(tz).format('DD/MM/YYYY HH:mm');
      const endTime = row?.original?.endTime
        ? moment.unix(row?.original?.endTime).tz(tz).format('DD/MM/YYYY HH:mm')
        : 'Pending';
      const session = `${startTime} - ${endTime}`;

      let status = row?.original?.status;

      responseObj.status = status;
      responseObj.session = session;
      responseObj.username = row?.original?.userId?.name;
      responseObj.score = row?.original?.score;

      const { answers } = responseObj;
      if (responseObj.mode === 'mcq') {
        responseObj.evaluationDump = responseObj.evaluationDump.mcqBased.map((v, index) => {
          return {
            ...v,
            answeredValue: answers.mcqBased.answerKey[index],
          };
        });
      } else {
        responseObj.mistakes = responseObj?.answers?.timeBased?.mistakes;
        responseObj.scores = row?.original?.scores;
      }

      setOpenEvalutationData(responseObj);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to fetch eval-data');
      setOpenEvalutationData(false);
    }
  };

  const onDeleteRow = async (row) => {
    try {
      await axios.post(`/evaluation/archive/${row.id}`);
      toast.success('Evaluation deleted successfully');
      setTimeout(() => {
        navigate(0);
      }, 700);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to delete evaluation');
    }
  };

  return (
    <>
      <Card>
        <MaterialReactTable
          renderToolbarInternalActions={({ table }) => (
            <Box sx={{ display: 'flex', p: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
          enableColumnOrdering
          state={{
            isLoading: fetchingData,
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
          setOpenEvalutationData(false);
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
        ) : (
          <TimeGrid showValues evalData={openEvaluationData} evaluation={openEvaluationData?.answers} />
        )}
      </CustomDialog>
    </>
  );
};

EvaluationsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
