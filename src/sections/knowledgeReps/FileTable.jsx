import { Delete, Download } from '@mui/icons-material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Avatar, Box, Card, IconButton, MenuItem, Stack, SvgIcon, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import CustomDialog from '../../components/CustomDialog';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { getInitials } from '../../utils/utils';

export const FileTable = ({ items = [], fetchingData, addWorkingDirectory }) => {
  const handleDownload = () => {
    // fake download function
    const filePath = '/assets/AVrseLogo.png'; // file path of logo to download
    const link = document.createElement('a'); // create a link
    link.href = filePath; // set link to file path
    link.download = filePath.split('/').pop(); // set file name
    link.click(); // fake click on link to download file
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: 'Name',
        Cell: ({ cell, column, row }) => {
          let preIcon = null;
          // Preicon depending on the type
          if (row?.original?.type === 'Folder') {
            preIcon = <FolderIcon sx={{ color: '#fad165' }} />;
          } else {
            preIcon = <InsertDriveFileIcon sx={{ color: '#5f6368' }} />;
          }
          return (
            <Typography>
              <SvgIcon fontSize="small" sx={{ mr: 2, pt: 0.3 }}>
                {preIcon}
              </SvgIcon>
              {row?.original?.name}{' '}
            </Typography>
          );
        },
      },

      {
        accessorKey: 'owner', // simple recommended way to define a column
        header: 'Owner',
      },
      {
        accessorKey: 'modified', // simple recommended way to define a column
        header: `Last Modified`,
        Cell: ({ cell, column, row }) => {
          const tz = moment.tz.guess();
          const startTime = moment.unix(row?.original?.modified).tz(tz).format('DD/MM/YYYY');

          return <Typography>{startTime}</Typography>;
        },
      },
      {
        accessorKey: 'size', // simple recommended way to define a column
        header: 'File Size',
        Cell: ({ cell, column, row }) => {
          return <Typography>{row?.original?.size || '-'} </Typography>;
        },
      },
    ],
    [],
  );

  return (
    <>
      <Card>
        <MaterialReactTable
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
                handleDownload();
              }}
            >
              <Stack spacing={2} direction={'row'}>
                <Download />
                <Typography>Download</Typography>
              </Stack>
            </MenuItem>,
          ]}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              if (row?.original?.type === 'Folder') {
                addWorkingDirectory(row?.original?.name);
              }
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
          enableRowSelection={false} // enable some features
          enableColumnOrdering
          state={{
            isLoading: fetchingData,
          }}
          initialState={{ pagination: { pageSize: 5 }, showGlobalFilter: true }}
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
        />
      </Card>
    </>
  );
};

FileTable.propTypes = {
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
