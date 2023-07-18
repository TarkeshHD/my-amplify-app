import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Avatar, Box, Card, Typography } from '@mui/material';
import { Scrollbar } from '../../components/Scrollbar';
import { getInitials } from '../../utils/utils';
import SearchNotFound from '../../components/SearchNotFound';

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
        enableGlobalFilter={false} // turn off a feature
        state={{
          isLoading: fetchingData,
        }}
        initialState={{ pagination: { pageSize: 5 } }}
        muiTablePaginationProps={{
          rowsPerPageOptions: [5, 10, 15, 20, 25],
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
