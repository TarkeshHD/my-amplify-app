import PropTypes from 'prop-types';
// @mui
import {
  Dialog,
  Box,
  Paper,
  DialogActions,
  Tooltip,
  IconButton,
  DialogTitle,
  DialogContent,
  Stack,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';

// ----------------------------------------------------------------------

CustomDialog.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  sx: PropTypes.object,
  variants: PropTypes.object,
  title: PropTypes.element,
};

export default function CustomDialog({ open = false, title = 'Title', onClose, children, sx, ...other }) {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      PaperComponent={(props) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box onClick={onClose} sx={{ width: '100%', height: '100%', position: 'fixed' }} />
          <Paper sx={sx} {...props}>
            {props.children}
          </Paper>
        </Box>
      )}
      {...other}
    >
      <Stack sx={{ mt: 2 }} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
        <DialogTitle variant="h5">{title}</DialogTitle>
        <DialogActions>
          <Tooltip title="Close">
            <IconButton color="inherit" onClick={onClose}>
              <CloseRounded />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </Stack>
      <DialogContent sx={{ mb: 2 }}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, height: '100%' }}>{children}</Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
