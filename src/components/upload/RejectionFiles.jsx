import PropTypes from 'prop-types';
// @mui
import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

RejectionFiles.propTypes = {
  fileRejections: PropTypes.array.isRequired,
};

export default function RejectionFiles({ fileRejections }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        mt: 3,
        borderColor: 'error.light',
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
      }}
    >
      {fileRejections.map(({ file, errors }) => {
        const { path, size } = file;

        return (
          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {size || ''}
            </Typography>

            {errors.map((error) => (
              <Box key={error.code} component="li" sx={{ typography: 'caption' }}>
                {error.message}
              </Box>
            ))}
          </Box>
        );
      })}
    </Paper>
  );
}
