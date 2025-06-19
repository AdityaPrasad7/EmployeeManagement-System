import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  Container,
  Avatar,
  Divider
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import { ROUTES } from '../config/constants';
import { LoadingSpinner } from '../components/LoadingSpinner';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      navigate(response.redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="sm">
        <Card 
          elevation={3}
          sx={{ 
            borderRadius: 2,
            p: 4
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              mb={4}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.primary.main,
                  mb: 2
                }}
              >
                <WavingHandIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Please sign in to continue
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 4 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? (
                  <LoadingSpinner message="Signing in..." />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Kods Employee Management
              </Typography>
            </Divider>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login; 