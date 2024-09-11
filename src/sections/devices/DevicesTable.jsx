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
import QuestionsActionGrid from '../../components/modules/QuestionActionGrid';
import DeviceGrid from '../../components/modules/DeviceGrid';

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

export const DevicesTable = ({ count = 0, items = FAKE_DATA, fetchingData, exportBtnClicked, exportBtnFalse }) => {
  const tz = moment.tz.guess();
  const exportBtnRef = useRef(null);
  const [exportRow, setExportRow] = useState([]);
  const [openDeviceData, setOpenDeviceData] = useState(null);
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
    setUpdatedItems(items);
  };

  // Call the updateItems function to update your items
  useEffect(() => {
    updateItems();
  }, [items]);
  // const scoresList =
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: 'deviceId', // simple recommended way to define a column
        header: `${'Device ID'}`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.deviceId || '-'}</Typography>;
        },
      },
      {
        accessorKey: 'macAddr', // simple recommended way to define a column
        header: `${'MAC Addresss'}`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.macAddr || '-'}</Typography>;
        },
      },
      {
        accessorKey: 'uniqueDomainCount.toString()', // simple recommended way to define a column
        header: `Total Number of Domains`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.uniqueDomainCount.toString()}</Typography>;
        },
      },
      {
        accessorKey: 'uniqueUserCount.toString()', // simple recommended way to define a column
        header: `Total Number of Users`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.uniqueUserCount.toString()}</Typography>;
        },
      },
      {
        accessorKey: 'domainsHistory[0].name', // simple recommended way to define a column
        header: `Last Logged In Domain`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          const time = moment.unix(row?.original?.domainsHistory[0]?.time).tz(tz).format('DD/MM/YYYY HH:mm');
          return (
            <Typography>
              {row?.original?.domainsHistory?.length !== 0
                ? `${row?.original?.domainsHistory[0]?.name}  - ${time}`
                : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'usersHistory[0].name', // simple recommended way to define a column
        header: `Last Logged In User`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          const time = moment.unix(row?.original?.usersHistory[0]?.time).tz(tz).format('DD/MM/YYYY HH:mm');
          return (
            <Typography>
              {row?.original?.usersHistory?.length !== 0 ? `${row?.original?.usersHistory[0]?.name}  - ${time}` : '-'}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'ipAddress[0].name', // simple recommended way to define a column
        header: `Last Logged In IP`,
        filterVariant: 'multi-select',
        size: 100,
        Cell: ({ cell, column, row }) => {
          const time = moment.unix(row?.original?.ipAddress[0]?.time).tz(tz).format('DD/MM/YYYY HH:mm');
          return (
            <Typography>
              {row?.original?.ipAddress?.length !== 0 ? `${row?.original?.ipAddress[0]?.ip}  - ${time}` : '-'}
            </Typography>
          );
        },
      },
    ];

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
        values?.deviceId || '-',
        values?.macAddr || '-',
        values?.uniqueDomainCount.toString() || '-',
        values?.uniqueUserCount.toString() || '-',
        values?.domainsHistory[0]?.name || '-',
        values?.usersHistory[0]?.name || '-',
        values?.ipAddress[0]?.ip || '-',
      ];
    });
  };

  const handleExportRows = (rows, type) => {
    setOpenExportOptions(true);
    setExportRow(convertRowDatas(rows));
  };

  const handleRowClick = async (row) => {
    try {
      setOpenDeviceData({ loading: true });
      const doc = row?.original;

      setOpenDeviceData({ doc });
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Failed to fetch device-data');
      setOpenDeviceData(false);
    }
  };

  const onDeleteRow = async (row) => {
    try {
      const id = row.id || row._id;
      await axios.post(`/evaluation/archive/${id}`);
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
          renderRowActionMenuItems={({ row, closeMenu, table }) => []}
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
          setOpenDeviceData(false);
        }}
        sx={{ minWidth: '60vw' }}
        open={Boolean(openDeviceData)}
        title={<Typography variant="h5">{'Device Details'} </Typography>}
      >
        {openDeviceData?.loading ? (
          <Box>
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="rectangular" width={210} height={60} />
            <Skeleton variant="rounded" width={210} height={60} />
          </Box>
        ) : (
          <DeviceGrid evalData={openDeviceData?.doc} />
        )}
      </CustomDialog>
    </>
  );
};

DevicesTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
