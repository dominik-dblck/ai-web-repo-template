import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function DashboardPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography color="text.secondary">
        Protected route — requires authentication.
      </Typography>
    </Box>
  );
}
