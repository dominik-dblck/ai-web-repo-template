'use client';

import MuiDialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import { useDialog } from './DialogProvider';

export const Dialog = () => {
  const { dialogIsOpen, dialogChildren, closeDialog } = useDialog();

  return (
    <MuiDialog
      open={dialogIsOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          pt: 1,
          px: 1,
        }}
      >
        <IconButton onClick={closeDialog} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <DialogContent>{dialogChildren}</DialogContent>
    </MuiDialog>
  );
};
