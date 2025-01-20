import {
  MaterialReactTable,
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
} from 'material-react-table';
import { isEmpty } from 'lodash';
import { Box, Button, Card, IconButton, Tooltip } from '@mui/material';
import { Delete, FilterAltOff } from '@mui/icons-material';
import PropTypes from 'prop-types';

const CustomGrid = (props) => {
  const {
    positionActionsColumn = 'last',
    columns,
    data,
    enableRowSelection = true,
    setRowSelection,
    enableColumnOrdering = true,
    rowSelection,
    rowsPerPageOptions = [5, 10, 15, 20, 25],
    enableGlobalFilterModes = true,
    positionGlobalFilter = 'left',
    fetchingData,
    enableRowActions = true,
    enableSearch = true,
    handleRowClick,
    enableRowClick = true,
    enableClearFilters = true,
    enableBulkDelete = true,
    setShowConfirmationDialog,
    rowActionMenuItems = undefined,
    hasDeleteAccess = false,
    handleExportRows,
    showExportButton = true,
    updateAnalytics,
    enableFacetedValues = true,
    enableAnalyticsHiddenButton = false,
    analyticsHiddenBtnRef,
    exportBtnRef,
    enableExpanding = false,
  } = props;

  const initialState = { pagination: { pageSize: 10 }, showGlobalFilter: true, showColumnFilters: true };
  const searchProps = {
    placeholder: `Search ${data.length} rows`,
    sx: { minWidth: '300px' },
    variant: 'outlined',
  };
  const state = {
    isLoading: fetchingData,
  };
  if (enableRowSelection) {
    state.rowSelection = rowSelection;
  }

  const isColumnFiltersEmpty = (table) => {
    const columnFilters = table?.getState()?.columnFilters;
    // TODO: Need to handle filter reset and checks only with  table?.getState()?.columnFilters;
    return !columnFilters || columnFilters.every((filter) => filter.value.length === 0);
  };

  const ClearFilters = ({ table }) => (
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
  );

  ClearFilters.propTypes = {
    table: PropTypes.object.isRequired,
  };

  const BulkDelete = () => (
    <Tooltip title="Bulk delete" arrow>
      <IconButton
        onClick={() => setShowConfirmationDialog(true)}
        sx={{ display: hasDeleteAccess && !isEmpty(rowSelection) ? 'block' : 'none', mt: '6px' }}
      >
        <Delete color={isEmpty(rowSelection) ? 'grey' : 'error'} />
      </IconButton>
    </Tooltip>
  );

  const ExportButton = ({ table }) => (
    <Button
      ref={exportBtnRef}
      sx={{ display: 'none' }}
      disabled={table?.getPrePaginationRowModel().rows.length === 0}
      onClick={() => {
        handleExportRows(table.getPrePaginationRowModel().rows);
      }}
    />
  );

  ExportButton.propTypes = {
    table: PropTypes.object.isRequired,
  };

  const AnalyticsHiddenButton = ({ table }) => (
    <Button
      ref={analyticsHiddenBtnRef}
      sx={{ display: 'none' }}
      disabled={table?.getPrePaginationRowModel().rows.length === 0}
      onClick={() => {
        updateAnalytics(table.getPrePaginationRowModel().rows);
      }}
      variant="contained"
    >
      Analytics Hidden Button
    </Button>
  );

  AnalyticsHiddenButton.propTypes = {
    table: PropTypes.object.isRequired,
  };

  return (
    <Card>
      <MaterialReactTable
        renderToolbarInternalActions={({ table }) => (
          <Box sx={{ display: 'flex', p: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {enableClearFilters && <ClearFilters table={table} />}
            {enableBulkDelete && <BulkDelete table={table} />}
            {showExportButton && <ExportButton table={table} />}
            {enableAnalyticsHiddenButton && <AnalyticsHiddenButton table={table} />}
            <MRTToggleFiltersButton table={table} />
            <MRTShowHideColumnsButton table={table} />
            <MRTFullScreenToggleButton table={table} />
          </Box>
        )}
        renderRowActionMenuItems={rowActionMenuItems}
        enableRowActions={enableRowActions}
        displayColumnDefOptions={{
          'mrt-row-actions': {
            header: null,
          },
        }}
        positionActionsColumn={positionActionsColumn}
        columns={columns}
        data={data}
        enableRowSelection={enableRowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row._id}
        enableColumnOrdering={enableColumnOrdering}
        state={state}
        initialState={props.initialState ?? initialState}
        muiTablePaginationProps={{
          rowsPerPageOptions,
        }}
        enableGlobalFilterModes={enableGlobalFilterModes}
        positionGlobalFilter={positionGlobalFilter}
        muiSearchTextFieldProps={enableSearch ? searchProps : {}}
        enableFacetedValues={enableFacetedValues}
        muiTableBodyRowProps={
          enableRowClick
            ? ({ row }) => ({
                onClick: () => {
                  handleRowClick(row);
                },
                sx: { cursor: 'pointer' },
              })
            : {}
        }
        renderEmptyRowsFallback={
          !isEmpty(updateAnalytics)
            ? () => {
                updateAnalytics([]);
              }
            : undefined
        }
        enableExpanding={enableExpanding}
        getSubRows={enableExpanding ? (row) => row.nestedDomains : undefined}
      />
    </Card>
  );
};

CustomGrid.propTypes = {
  initialState: PropTypes.object,
  positionActionsColumn: PropTypes.oneOf(['first', 'last']),
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  enableRowSelection: PropTypes.bool,
  setRowSelection: PropTypes.func,
  enableColumnOrdering: PropTypes.bool,
  rowSelection: PropTypes.object,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  enableGlobalFilterModes: PropTypes.bool,
  positionGlobalFilter: PropTypes.oneOf(['left', 'right']),
  fetchingData: PropTypes.bool,
  enableRowActions: PropTypes.bool,
  enableSearch: PropTypes.bool,
  handleRowClick: PropTypes.func,
  enableRowClick: PropTypes.bool,
  enableClearFilters: PropTypes.bool,
  enableBulkDelete: PropTypes.bool,
  setShowConfirmationDialog: PropTypes.func,
  rowActionMenuItems: PropTypes.func,
  hasDeleteAccess: PropTypes.bool,
  handleExportRows: PropTypes.func,
  showExportButton: PropTypes.bool,
  updateAnalytics: PropTypes.func,
  enableFacetedValues: PropTypes.bool,
  enableAnalyticsHiddenButton: PropTypes.bool,
  analyticsHiddenBtnRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  exportBtnRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })]),
  enableExpanding: PropTypes.bool,
};

export default CustomGrid;
