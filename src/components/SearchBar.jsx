import { Search } from '@mui/icons-material';
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

export const SearchBar = ({ placeholder }) => (
  <Card sx={{ p: 2 }}>
    <OutlinedInput
      defaultValue=""
      fullWidth
      placeholder={placeholder || 'Search - Need to Implement'}
      startAdornment={
        <InputAdornment position="start">
          <SvgIcon color="action" fontSize="small">
            <Search />
          </SvgIcon>
        </InputAdornment>
      }
      sx={{ maxWidth: 500 }}
    />
  </Card>
);
