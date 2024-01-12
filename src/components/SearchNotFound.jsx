import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function SearchNotFound({ searchQuery = '', ...other }) {
  return searchQuery ? (
    <Paper {...other}>
      <Typography gutterBottom align="center" variant="subtitle1">
        Not found
      </Typography>
      <Typography variant="body2" align="center">
        No results found for &nbsp;
        <strong>&quot;{searchQuery}&quot;</strong>. Try checking for typos or using complete words.
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2"> No results found</Typography>
  );
}

SearchNotFound.propTypes = {
  searchQuery: PropTypes.string,
};
