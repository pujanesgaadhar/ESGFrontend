import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  FormControl, 
  Select, 
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const EmissionsAnalysis = ({ ghgEmissions = [] }) => {
  const [viewType, setViewType] = useState('department');
  
  // Process emissions data to generate dynamic analysis
  const { departmentData, facilityData, sourceData } = useMemo(() => {
    // Filter approved emissions only
    const approvedEmissions = ghgEmissions.filter(emission => emission.status === 'APPROVED');
    
    // Get current year and previous year
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Filter emissions by year
    const currentYearEmissions = approvedEmissions.filter(emission => {
      const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
      return emissionYear === currentYear;
    });
    
    const previousYearEmissions = approvedEmissions.filter(emission => {
      const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
      return emissionYear === previousYear;
    });
    
    // Group emissions by department
    const departmentMap = new Map();
    const previousDepartmentMap = new Map();
    
    // Process current year department data
    currentYearEmissions.forEach(emission => {
      const department = emission.department || 'Unspecified';
      const currentEmissions = departmentMap.get(department) || 0;
      departmentMap.set(department, currentEmissions + (emission.quantity || 0));
    });
    
    // Process previous year department data for change calculation
    previousYearEmissions.forEach(emission => {
      const department = emission.department || 'Unspecified';
      const currentEmissions = previousDepartmentMap.get(department) || 0;
      previousDepartmentMap.set(department, currentEmissions + (emission.quantity || 0));
    });
    
    // Generate department data with change percentage
    const deptData = Array.from(departmentMap.entries()).map(([name, emissions], index) => {
      const previousEmissions = previousDepartmentMap.get(name) || 0;
      const change = previousEmissions > 0 
        ? ((emissions - previousEmissions) / previousEmissions) * 100 
        : 0;
      // Mark as anomaly if change is more than 10% increase
      const anomaly = change > 10;
      
      return { 
        id: index + 1, 
        name, 
        emissions, 
        change, 
        anomaly 
      };
    });
    
    // Group emissions by facility
    const facilityMap = new Map();
    const previousFacilityMap = new Map();
    
    // Process current year facility data
    currentYearEmissions.forEach(emission => {
      const facility = emission.facility || 'Unspecified';
      const currentEmissions = facilityMap.get(facility) || 0;
      facilityMap.set(facility, currentEmissions + (emission.quantity || 0));
    });
    
    // Process previous year facility data for change calculation
    previousYearEmissions.forEach(emission => {
      const facility = emission.facility || 'Unspecified';
      const currentEmissions = previousFacilityMap.get(facility) || 0;
      previousFacilityMap.set(facility, currentEmissions + (emission.quantity || 0));
    });
    
    // Generate facility data with change percentage
    const facData = Array.from(facilityMap.entries()).map(([name, emissions], index) => {
      const previousEmissions = previousFacilityMap.get(name) || 0;
      const change = previousEmissions > 0 
        ? ((emissions - previousEmissions) / previousEmissions) * 100 
        : 0;
      // Mark as anomaly if change is more than 10% increase
      const anomaly = change > 10;
      
      return { 
        id: index + 1, 
        name, 
        emissions, 
        change, 
        anomaly 
      };
    });
    
    // Group emissions by source (category)
    const sourceMap = new Map();
    const previousSourceMap = new Map();
    
    // Process current year source data
    currentYearEmissions.forEach(emission => {
      const source = emission.category || 'Unspecified';
      const currentEmissions = sourceMap.get(source) || 0;
      sourceMap.set(source, currentEmissions + (emission.quantity || 0));
    });
    
    // Process previous year source data for change calculation
    previousYearEmissions.forEach(emission => {
      const source = emission.category || 'Unspecified';
      const currentEmissions = previousSourceMap.get(source) || 0;
      previousSourceMap.set(source, currentEmissions + (emission.quantity || 0));
    });
    
    // Generate source data with change percentage
    const srcData = Array.from(sourceMap.entries()).map(([name, emissions], index) => {
      const previousEmissions = previousSourceMap.get(name) || 0;
      const change = previousEmissions > 0 
        ? ((emissions - previousEmissions) / previousEmissions) * 100 
        : 0;
      // Mark as anomaly if change is more than 10% increase
      const anomaly = change > 10;
      
      return { 
        id: index + 1, 
        name, 
        emissions, 
        change, 
        anomaly 
      };
    });
    
    return {
      departmentData: deptData.length > 0 ? deptData : [
        { id: 1, name: 'No department data available', emissions: 0, change: 0, anomaly: false }
      ],
      facilityData: facData.length > 0 ? facData : [
        { id: 1, name: 'No facility data available', emissions: 0, change: 0, anomaly: false }
      ],
      sourceData: srcData.length > 0 ? srcData : [
        { id: 1, name: 'No source data available', emissions: 0, change: 0, anomaly: false }
      ]
    };
  }, [ghgEmissions]);
  
  // Get the appropriate data based on view type
  const getData = () => {
    switch(viewType) {
      case 'department':
        return departmentData;
      case 'facility':
        return facilityData;
      case 'source':
        return sourceData;
      default:
        return departmentData;
    }
  };
  
  // Sort data by emissions (highest first)
  const sortedData = [...getData()].sort((a, b) => b.emissions - a.emissions);
  
  // Identify hotspots (top 2 emission sources)
  const hotspots = sortedData.slice(0, 2);
  
  // Identify anomalies (items with anomaly flag)
  const anomalies = sortedData.filter(item => item.anomaly);

  return (
    <Card sx={{ 
      mb: 4, 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: 2
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssessmentIcon sx={{ color: '#0A3D0A', mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
            Emissions Analysis
          </Typography>
          
          <Box sx={{ ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="view-type-label">View By</InputLabel>
              <Select
                labelId="view-type-label"
                id="view-type-select"
                value={viewType}
                label="View By"
                onChange={(e) => setViewType(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9DC183'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0A3D0A'
                  }
                }}
              >
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="facility">Facility</MenuItem>
                <MenuItem value="source">Emission Source</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Detailed Breakdown */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
              Detailed Breakdown by {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f9f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                      {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                      Emissions (tCO₂e)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                      YoY Change
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow key={item.id} sx={{ 
                      '&:hover': { backgroundColor: '#f0f7f0' },
                      backgroundColor: item.anomaly ? '#fff8e1' : 'inherit'
                    }}>
                      <TableCell component="th" scope="row">
                        {item.name}
                        {hotspots.includes(item) && (
                          <LocalFireDepartmentIcon 
                            fontSize="small" 
                            sx={{ ml: 1, color: '#FF8F00', verticalAlign: 'text-bottom' }} 
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {item.emissions.toLocaleString()}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: item.change < 0 ? '#2E7D32' : '#d32f2f',
                          fontWeight: Math.abs(item.change) > 10 ? 'bold' : 'normal'
                        }}
                      >
                        {item.change > 0 ? `+${item.change}%` : `${item.change}%`}
                      </TableCell>
                      <TableCell align="center">
                        {item.anomaly ? (
                          <Chip 
                            size="small" 
                            icon={<WarningAmberIcon />} 
                            label="Anomaly" 
                            sx={{ 
                              backgroundColor: '#fff8e1', 
                              color: '#FF8F00',
                              borderColor: '#FFB74D',
                              '& .MuiChip-icon': { color: '#FF8F00' }
                            }} 
                            variant="outlined"
                          />
                        ) : (
                          <Chip 
                            size="small" 
                            label="Normal" 
                            sx={{ 
                              backgroundColor: '#E8F5E9', 
                              color: '#2E7D32' 
                            }} 
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Hotspots and Anomalies */}
          <Grid item xs={12} md={5}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
                Hotspot Identification
              </Typography>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: '#fff8e1', border: '1px solid #FFE082' }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalFireDepartmentIcon sx={{ mr: 1 }} />
                  Highest Emission Sources
                </Typography>
                {hotspots.map((item, index) => (
                  <Box key={item.id} sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {index + 1}. {item.name} - {item.emissions.toLocaleString()} tCO₂e
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {item.change > 0 ? 
                        `Increasing by ${item.change}% compared to last year` : 
                        `Decreasing by ${Math.abs(item.change)}% compared to last year`}
                    </Typography>
                    {index < hotspots.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Paper>
              
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
                Anomaly Detection
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: anomalies.length ? '#FFF3E0' : '#E8F5E9', border: anomalies.length ? '1px solid #FFCC80' : '1px solid #A5D6A7' }}>
                {anomalies.length ? (
                  <>
                    <Typography variant="subtitle2" sx={{ color: '#EF6C00', display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WarningAmberIcon sx={{ mr: 1 }} />
                      Unusual Patterns Detected
                    </Typography>
                    {anomalies.map((item, index) => (
                      <Box key={item.id} sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {item.name} - {item.change > 0 ? `+${item.change}%` : `${item.change}%`} change
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Unusual increase requires investigation
                        </Typography>
                        {index < anomalies.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </>
                ) : (
                  <Typography variant="subtitle2" sx={{ color: '#2E7D32' }}>
                    No anomalies detected in current data
                  </Typography>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EmissionsAnalysis;
