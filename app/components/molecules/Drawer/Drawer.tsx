'use client';

import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useDrawer } from './DrawerProvider';

const DRAWER_WIDTH = 400;

export const Drawer = () => {
  const { drawerIsOpen, drawerChildren, closeDrawer } = useDrawer();

  return (
    <MuiDrawer
      anchor="right"
      open={drawerIsOpen}
      onClose={closeDrawer}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: DRAWER_WIDTH } },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <IconButton onClick={closeDrawer} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <Box sx={{ px: 3, pb: 3, flex: 1, overflow: 'auto' }}>
        {drawerChildren}
      </Box>
    </MuiDrawer>
  );
};
