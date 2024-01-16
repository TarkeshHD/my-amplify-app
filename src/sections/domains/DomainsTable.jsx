import { Avatar, Box, Card, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Scrollbar } from '../../components/Scrollbar';
import SearchNotFound from '../../components/SearchNotFound';
import { getInitials } from '../../utils/utils';

export const DomainsTable = ({ count = 0, items = [], fetchingData }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', // simple recommended way to define a column
        header: 'Name',
      },
    ],
    [],
  );

  return (
    <Card>
      <MaterialReactTable
        columns={columns}
        data={items}
        enableRowSelection // enable some features
        enableColumnOrdering
        state={{
          isLoading: fetchingData,
        }}
        initialState={{ pagination: { pageSize: 5 }, showGlobalFilter: true }}
        muiTablePaginationProps={{
          rowsPerPageOptions: [5, 10, 15, 20, 25],
        }}
        enableExpanding
        getSubRows={(row) => row.nestedDomains}
        enableGlobalFilterModes
        positionGlobalFilter="left"
        muiSearchTextFieldProps={{
          placeholder: `Search ${items.length} rows`,
          sx: { minWidth: '300px' },
          variant: 'outlined',
        }}
      />
    </Card>
  );
};

DomainsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  fetchingData: PropTypes.bool,
};
