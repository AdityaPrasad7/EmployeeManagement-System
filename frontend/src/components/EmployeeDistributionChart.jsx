import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  Grid,
  Paper
} from '@mui/material';
import {
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { hrService } from '../services/api';

const EmployeeDistributionChart = () => {
  const theme = useTheme();
  const [fullTimeData, setFullTimeData] = useState([]);
  const [internData, setInternData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [employeesResponse, categoriesResponse] = await Promise.all([
        hrService.getAllEmployees(),
        hrService.getAllCategories()
      ]);

      const employees = employeesResponse.employees || [];
      const fetchedCategories = Array.isArray(categoriesResponse) ? categoriesResponse : [];
      setCategories(fetchedCategories);

      // Create a mapping of position names to categories
      const positionToCategory = {
        'Business Analyst': 'Business Analyst',
        'Senior Developer': 'Development',
        'Senior Project Manager': 'Project Management',
        'Senior Tester': 'Testing',
        'HR Manager': 'HR',
        'Junior Developer': 'Development',
        'Project Coordinator': 'Project Management',
        'QA Trainee': 'Testing',
        'Business Trainee': 'Business Analyst',
        'HR Trainee': 'HR'
      };

      const fullTimeEmployees = employees.filter(emp => !emp.isIntern);
      const internEmployees = employees.filter(emp => emp.isIntern);

      // Process full-time employees
      const fullTimeDistribution = {};
      fullTimeEmployees.forEach(employee => {
        const categoryName = positionToCategory[employee.position] || 'Unknown';
        fullTimeDistribution[categoryName] = (fullTimeDistribution[categoryName] || 0) + 1;
      });

      // Process intern employees
      const internDistribution = {};
      internEmployees.forEach(employee => {
        const categoryName = positionToCategory[employee.position] || 'Unknown';
        internDistribution[categoryName] = (internDistribution[categoryName] || 0) + 1;
      });

      const fullTimeChartData = Object.entries(fullTimeDistribution).map(([name, value]) => ({
        name,
        value
      }));

      const internChartData = Object.entries(internDistribution).map(([name, value]) => ({
        name,
        value
      }));

      setFullTimeData(fullTimeChartData);
      setInternData(internChartData);
    } catch (error) {
      console.error('Error fetching data for chart:', error);
      setError('Failed to load chart data.');
      setFullTimeData([]);
      setInternData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }
    
  if (fullTimeData.length === 0 && internData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography variant="body1" color="text.secondary">
          No employee data to display charts.
        </Typography>
      </Box>
    );
  }

  const COLORS = [
    ['#4F46E5', '#818CF8'],
    ['#7C3AED', '#A78BFA'],
    ['#DB2777', '#F472B6'],
    ['#0891B2', '#67E8F9'],
    ['#EA580C', '#FB923C'],
    ['#BE185D', '#F472B6'],
    ['#2563EB', '#60A5FA'],
    ['#C026D3', '#E879F9'],
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, index }) => {
    const RADIAN = Math.PI / 180;
    const labelRadius = outerRadius + 20;
    const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    const percentRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const percentX = cx + percentRadius * Math.cos(-midAngle * RADIAN);
    const percentY = cy + percentRadius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text
          x={x}
          y={y}
          fill={COLORS[index % COLORS.length][0]}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={500}
        >
          {name}
        </text>
        <text
          x={percentX}
          y={percentY}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={500}
        >
          {`${Math.round(percent * 100)}%`}
        </text>
      </g>
    );
  };

  const CustomizedXAxisTick = ({ x, y, payload, index }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill={COLORS[index % COLORS.length][0]}
          fontSize={12}
          fontWeight={500}
          transform="rotate(-30)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          flex: 1, 
          minHeight: 300,
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: '#1a1a1a',
            fontWeight: 600,
            mb: 3,
            fontSize: '1.1rem'
          }}
        >
          Full-time Employee Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <defs>
                {fullTimeData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={COLORS[index % COLORS.length][0]} />
                    <stop offset="100%" stopColor={COLORS[index % COLORS.length][1]} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={fullTimeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={125}
                fill="#8884d8"
                dataKey="value"
                label={renderCustomizedLabel}
              >
                {fullTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          flex: 1, 
          minHeight: 300,
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: '#1a1a1a',
            fontWeight: 600,
            mb: 3,
            fontSize: '1.1rem'
          }}
        >
          Intern Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={internData} margin={{ top: 20, right: 20, left: 20, bottom: 15 }}>
              <defs>
                {internData.map((entry, index) => (
                  <linearGradient key={`bar-gradient-${index}`} id={`bar-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[index % COLORS.length][0]} />
                    <stop offset="100%" stopColor={COLORS[index % COLORS.length][1]} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-30}
                textAnchor="end"
                height={60}
                tick={<CustomizedXAxisTick />}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
                domain={[0, 'dataMax']}
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  padding: '12px'
                }}
                formatter={(value, name, props) => {
                  if (!props || !props.payload) return [value, name];
                  const index = internData.findIndex(item => item.name === props.payload.name);
                  const color = index !== -1 ? COLORS[index % COLORS.length][0] : '#666';
                  return [
                    <span style={{ color, fontWeight: 600 }}>{value}</span>,
                    <span style={{ fontWeight: 500 }}>{name}</span>
                  ];
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {internData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#bar-gradient-${index})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeDistributionChart;