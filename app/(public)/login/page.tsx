import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function LoginPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Login</Typography>
      <Typography color="text.secondary">
        Public route — no auth required.
      </Typography>
    </Box>
  );
}
