import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

export const Layout = ({ children, title }) => {
  const theme = useTheme();
  const { logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: 3,
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Container>
    </Box>
  );
}; 