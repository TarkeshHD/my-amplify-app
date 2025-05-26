import { useState, useEffect, useRef } from 'react';
import {
  MaterialReactTable,
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
} from 'material-react-table';
import { Box, Button, Card, IconButton, Tooltip } from '@mui/material';
import { Delete, FilterAltOff } from '@mui/icons-material';
import { isEmpty } from 'lodash';
import axios from '../../utils/axios';

const CustomGrid = (props) => {
  const {
    positionActionsColumn = 'last',
    columns,
    data,
    enableRowSelection = true,
    setRowSelection,
    enableColumnOrdering = true,
    rowSelection,
    rowsPerPageOptions = [5, 10, 20, 30],
    enableGlobalFilterModes = false,
    fetchingData,
    enableRowActions = true,
    handleRowClick,
    enableRowClick = true,
    enableClearFilters = true,
    enableBulkDelete = true,
    setShowConfirmationDialog,
    rowActionMenuItems = undefined,
    hasDeleteAccess = false,
    handleExportRows,
    showExportButton = true,
    enableFacetedValues = true,
    exportBtnRef,
    enableExpanding = false,
    onUrlParamsChange,
    rowCount,
    tableSource,
    tableState,
    exportBtnFalse,
  } = props;

  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState(() => {
    const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
    return {
      pageIndex: 0,
      pageSize: storedSizes[tableSource] || 10,
    };
  });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onUrlParamsChange?.({
      pageIndex: (pagination.pageIndex || 0) + 1,
      pageSize: pagination.pageSize,
      sorting: formatSorting(sorting),
      filters: columnFilters,
    });

    const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
    localStorage.setItem(
      'tablePageSize',
      JSON.stringify({
        ...storedSizes,
        [tableSource]: pagination.pageSize,
      }),
    );
  }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters]);

  const initialState = {
    pagination: {
      pageIndex: 1,
      pageSize: pagination.pageSize,
    },
    showColumnFilters: true,
    ...tableState,
  };
  const searchProps = {
    placeholder: `Search ${data.length} rows`,
    sx: { minWidth: '300px' },
    variant: 'outlined',
  };
  const state = {
    isLoading: fetchingData,
    columnFilters,
    sorting,
    pagination,
  };
  if (enableRowSelection) {
    state.rowSelection = rowSelection;
  }

  const isColumnFiltersEmpty = (table) => {
    const columnFilters = table?.getState()?.columnFilters;
    // TODO: Need to handle filter reset and checks only with  table?.getState()?.columnFilters;
    return !columnFilters || columnFilters.every((filter) => filter.value.length === 0);
  };

  const formatSorting = (value) => {
    value = value?.[0];
    if (isEmpty(value)) return {};

    const field = String(value?.id).toLowerCase();
    const direction = value?.desc ? -1 : 1;
    return { [field]: direction };
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

  const exportData = async (table) => {
    try {
      const endPointMap = {
        users: '/user/all',
        devices: '/device/all',
        evaluations: '/evaluation/all',
        trainings: '/training/',
      };

      const filters = columnFilters?.map((filter) => ({
        id: filter.id,
        value: filter.value,
      }));

      const sortingParam = formatSorting(sorting);

      console.log('//////////////');
      console.log(filters, sortingParam);
      console.log(tableSource);
      console.log(endPointMap[tableSource]);

      const response = await axios.get(endPointMap[tableSource], {
        params: {
          filters: JSON.stringify(filters),
          sort: JSON.stringify(sortingParam),
          // Optional: add pagination if you want to limit export size
          // page: pagination.pageIndex + 1,
          // limit: pagination.pageSize,
        },
      });

      handleExportRows(response?.data?.[tableSource]?.docs);
      exportBtnFalse();
    } catch (error) {
      console.log(error);
    }
  };

  const ExportButton = ({ table }) => (
    <Button
      ref={exportBtnRef}
      sx={{ display: 'none' }}
      disabled={table?.getPrePaginationRowModel().rows.length === 0}
      onClick={() => exportData(table.getPrePaginationRowModel().rows)}
    />
  );

  return (
    <Card>
      <MaterialReactTable
        renderToolbarInternalActions={({ table }) => (
          <Box sx={{ display: 'flex', p: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {enableClearFilters && <ClearFilters table={table} />}
            {enableBulkDelete && <BulkDelete table={table} />}
            {showExportButton && <ExportButton table={table} />}
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
        enableGlobalFilter={false}
        enableGlobalFilterModes={enableGlobalFilterModes}
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
        enableExpanding={enableExpanding}
        getSubRows={enableExpanding ? (row) => row.nestedDomains : undefined}
        manualFiltering
        manualPagination
        manualSorting
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        rowCount={rowCount}
      />
    </Card>
  );
};

export default CustomGrid;
