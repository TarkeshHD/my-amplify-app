import { Dialog, Button, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const ConfirmationDialog = (props) => {
  return (
    <>
      {props.open && (
        <Dialog open={props.open} onClose={props.onClose}>
          <DialogTitle sx={{ mt: 2, fontWeight: 700 }}>{props.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{props.description}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={props.onConfirm} color="error" variant="contained">
              Yes
            </Button>
            <Button onClick={props.onClose} color="primary">
              No
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ConfirmationDialog;
