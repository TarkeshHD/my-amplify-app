import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import {
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
  MRT_ToggleDensePaddingButton as MRTToggleDensePaddingButton,
  MaterialReactTable,
} from 'material-react-table';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import { Avatar, Box, Button, Card, IconButton, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import { ExportToCsv } from 'export-to-csv';
import { Delete, Edit, FileDownload } from '@mui/icons-material';
import { Scrollbar } from '../../components/Scrollbar';
import { getInitials } from '../../utils/utils';
import SearchNotFound from '../../components/SearchNotFound';
import CustomDialog from '../../components/CustomDialog';
import EditPasswordForm from '../../components/users/EditPasswordForm';
import QuestionsGrid from '../../components/modules/QuestionsGrid';
import { SeverityPill } from '../../components/SeverityPill';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';

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
    module: 'Plant Training',
    username: 'CW_02',
    session: '29-Jul-2023  -  31-Jul-2023',
    score: '4',
    status: 'Fail',
  },
];

export const EvaluationsTable = ({ count = 0, items = [...FAKE_DATA], fetchingData }) => {
  const config = useConfig();
  const columns = useMemo(
    () => [
      {
        accessorKey: 'userId.username', // simple recommended way to define a column
        header: 'User',
        filterVariant: 'multi-select',
        size: 100,
      },
      {
        accessorKey: 'moduleId.name', // simple recommended way to define a column
        header: 'Module',
        filterVariant: 'multi-select',
        size: 100,
      },
      {
        accessorKey: 'userId.domainId.name', // simple recommended way to define a column
        header: 'Domain',
        filterVariant: 'multi-select',
        size: 100,
      },
      {
        accessorKey: 'userId.departmentId.name', // simple recommended way to define a column
        header: 'Department',
        filterVariant: 'multi-select',
        size: 100,
      },

      {
        accessorKey: 'session', // simple recommended way to define a column
        header: 'Session Time',
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
      },

      {
        accessorKey: 'score', // simple recommended way to define a column
        header: 'Score',
      },
      {
        accessorKey: 'status', // simple recommended way to define a column
        header: 'Status',
        Cell: ({ cell, column, row }) => {
          let status = 'Pending';
          if (row?.original?.endTime) {
            status = row?.original?.score >= config.data.passingMarks ? 'Pass' : 'Fail';
          }

          return <SeverityPill color={statusMap[status]}>{status}</SeverityPill>;
        },
        filterVariant: 'multi-select',
      },
    ],
    [],
  );

  // Set below flag as well as use it as 'Row' Object to be passed inside forms

  const [openEvaluationData, setOpenEvalutationData] = useState(null);

  // Helper functions
  const csvExporter = new ExportToCsv({
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    headers: columns.map((c) => c.header),
  });
  const handleExportRows = (rows) => {
    csvExporter.generateCsv(rows.map((row) => row.original));
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

      let status = 'Pending';
      if (row?.original?.endTime) {
        status = row?.original?.score >= config.data.passingMarks ? 'Pass' : 'Fail';
      }

      responseObj.status = status;
      responseObj.session = session;
      responseObj.username = responseObj.userId?.name;

      const { answers } = responseObj;
      responseObj.evaluationDump = responseObj.evaluationDump.map((v, index) => ({
        ...v,
        answeredValue: answers[index],
      }));

      console.log(responseObj);

      setOpenEvalutationData(responseObj);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to fetch eval-data');
      setOpenEvalutationData(false);
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
          data={items}
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
            placeholder: `Search ${items.length} rows`,
            sx: { minWidth: '300px' },
            variant: 'outlined',
          }}
          enableFacetedValues
        />
      </Card>

      {/* View Evaluation Data */}
      <CustomDialog
        onClose={() => {
          setOpenEvalutationData(false);
        }}
        sx={{ minWidth: '60vw' }}
        open={Boolean(openEvaluationData)}
        title={<Typography variant="h5">Evaluation</Typography>}
      >
        {openEvaluationData?.loading ? (
          <Box>
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="rectangular" width={210} height={60} />
            <Skeleton variant="rounded" width={210} height={60} />
          </Box>
        ) : (
          <QuestionsGrid showValues evalData={openEvaluationData} evaluation={openEvaluationData?.evaluationDump} />
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
