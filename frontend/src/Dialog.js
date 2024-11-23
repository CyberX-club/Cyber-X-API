import React from 'react';
import {

Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
Typography
} from '@mui/material';


const defaultProps = { open: false, x: 0, y: 0 };
const InfoDialog = ({ open, handleClose, title, content }) => {
return (
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="info-dialog-title"
        aria-describedby="info-dialog-description"
    >
        <DialogTitle id="info-dialog-title">
            {title}
        </DialogTitle>
        <DialogContent>
            <Typography id="info-dialog-description">
                {content}
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Close
            </Button>
        </DialogActions>
    </Dialog>
);
};

export { defaultProps as defaultInfoDialogProps };
export default InfoDialog;

// Usage example:
// <InfoDialog
//   open={open}
//   handleClose={() => setOpen(false)}
//   title="Important Information"
//   content="This is the message you want to display."
// />