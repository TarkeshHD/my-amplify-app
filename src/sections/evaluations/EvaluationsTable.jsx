import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import {
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
  MRT_ToggleDensePaddingButton as MRTToggleDensePaddingButton,
  MaterialReactTable,
} from 'material-react-table';
import { Avatar, Box, Button, Card, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import { ExportToCsv } from 'export-to-csv';
import { Delete, Edit, FileDownload } from '@mui/icons-material';
import { Scrollbar } from '../../components/Scrollbar';
import { getInitials } from '../../utils/utils';
import SearchNotFound from '../../components/SearchNotFound';
import CustomDialog from '../../components/CustomDialog';
import EditPasswordForm from '../../components/users/EditPasswordForm';
import QuestionsGrid from '../../components/modules/QuestionsGrid';
import { SeverityPill } from '../../components/SeverityPill';

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
  const columns = useMemo(
    () => [
      {
        accessorKey: 'module', // simple recommended way to define a column
        header: 'Module',
        filterVariant: 'text', // default
        size: 100,
      },
      {
        accessorKey: 'username', // simple recommended way to define a column
        header: 'User',
        filterVariant: 'multi-select',
      },
      {
        accessorKey: 'session', // simple recommended way to define a column
        header: 'Session Time',
      },

      {
        accessorKey: 'score', // simple recommended way to define a column
        header: 'Score',
      },
      {
        accessorKey: 'status', // simple recommended way to define a column
        header: 'Status',
        Cell: ({ cell, column }) => <SeverityPill color={statusMap[cell.getValue()]}>{cell.getValue()}</SeverityPill>,
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
        <QuestionsGrid showValues evalData={openEvaluationData} />
      </CustomDialog>
    </>
  );
};

EvaluationsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
