import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import LeaveRequestsList from './LeaveRequestsList';

const LeaveRequestSection = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Leave Requests
        </Typography>
        <Box mt={2}>
          <LeaveRequestsList />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestSection; 