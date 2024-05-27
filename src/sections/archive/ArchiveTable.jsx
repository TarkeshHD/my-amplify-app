import { Box, Button, Card, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import {
  MRT_FullScreenToggleButton as MRTFullScreenToggleButton,
  MRT_ShowHideColumnsButton as MRTShowHideColumnsButton,
  MRT_ToggleDensePaddingButton as MRTToggleDensePaddingButton,
  MRT_ToggleFiltersButton as MRTToggleFiltersButton,
  MaterialReactTable,
} from 'material-react-table';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Delete, Edit, FileDownload } from '@mui/icons-material';
import CustomDialog from '../../components/CustomDialog';
import ArchiveGrid from '../../components/archive/ArchiveGrid';
import ExportOptions from '../../components/export/ExportOptions';
import { useConfig } from '../../hooks/useConfig';
import { set } from 'lodash';

export const ArchiveTable = ({
  count = 0,
  items,
  fetchingData,
  exportBtnClicked,
  exportBtnFalse,
  headers,
  totalItems,
  queryPageChange,
}) => {
  const exportBtnRef = useRef(null);
  const [exportRow, setExportRow] = useState([]);
  const [openExportOptions, setOpenExportOptions] = useState(false);
  const config = useConfig();
  const { data } = config;

  const [openArchiveGrid, setOpenArchiveGrid] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  useEffect(() => {
    queryPageChange(pagination);
  }, [pagination.pageIndex]);

  useEffect(() => {
    if (exportBtnClicked) {
      exportBtnRef.current.click();
      exportBtnFalse();
    }
  }, [exportBtnClicked]);

  // const scoresList =
  const columns = useMemo(() => {
    return headers.map((header) => {
      const accessorKey = header;
      const headerLabel = header.split('.').pop(); // Extract the last part after the last dot

      return {
        accessorFn: (row) => {
          return row?.[accessorKey] || 'NA';
        },
        header: `${headerLabel}`,

        size: 100,
        Cell: ({ cell, column, row }) => {
          const value = header.split('.').reduce((obj, key) => obj?.[key], row?.original);
          return <Typography>{value || '-'}</Typography>;
        },
      };
    });
  }, [headers]);

  // Set below flag as well as use it as 'Row' Object to be passed inside forms

  const convertRowDatas = (rows) => {
    return rows.map((row) => {
      return Object.values(row.original);
    });
  };

  const handleExportRows = (rows, type) => {
    setOpenExportOptions(true);
    setExportRow(convertRowDatas(rows));
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
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              setOpenArchiveGrid(row.original);
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
          data={items} // enable some features
          state={{
            isLoading: fetchingData,
            pagination,
          }}
          initialState={{ pagination: { pageSize: 25 }, showGlobalFilter: true }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [25],
          }}
          enableGlobalFilterModes
          positionGlobalFilter="left"
          muiSearchTextFieldProps={{
            placeholder: `Search ${items.length} rows`,
            sx: { minWidth: '300px' },
            variant: 'outlined',
          }}
          enableFacetedValues
          manualPagination
          rowCount={totalItems}
          onPaginationChange={setPagination}
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

      {/* View Archive Data */}
      <CustomDialog
        onClose={() => {
          setOpenArchiveGrid(false);
        }}
        sx={{ minWidth: '40vw' }}
        open={Boolean(openArchiveGrid)}
        title={<Typography variant="h5">Archive Data</Typography>}
      >
        <ArchiveGrid archiveData={openArchiveGrid} />
      </CustomDialog>
    </>
  );
};

ArchiveTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
