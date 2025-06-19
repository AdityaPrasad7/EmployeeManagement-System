import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  IconButton,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CardMembershipIcon from '@mui/icons-material/CardMembership';

const EmployeeProfile = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Skills Section */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Skills</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleAddSkill} color="primary">
                        <AddIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleDeleteSkill(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Education Section */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Education</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Degree/Course"
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Institution"
                  variant="outlined"
                  size="small"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Start Year"
                      variant="outlined"
                      size="small"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="End Year"
                      variant="outlined"
                      size="small"
                      type="number"
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Add Education
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Certifications Section */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CardMembershipIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Certifications</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Certification Name"
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Issuing Organization"
                  variant="outlined"
                  size="small"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Issue Date"
                      variant="outlined"
                      size="small"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      variant="outlined"
                      size="small"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Credential ID"
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Add Certification
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeProfile; 