import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function SettingsPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Settings</Typography>
      <Typography color="text.secondary">
        Protected route — requires authentication.
      </Typography>
    </Box>
  );
}
