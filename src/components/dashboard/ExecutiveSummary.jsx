import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  Button,
  Paper,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const ExecutiveSummary = ({ ghgEmissions = [] }) => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [generatingReportId, setGeneratingReportId] = useState(null);
  
  // Calculate KPIs from real emissions data
  // Calculate risk levels based on emissions data
  const calculateRiskLevels = useMemo(() => {
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
    
    // Calculate total emissions for current and previous year
    const totalCurrentEmissions = currentYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
    const totalPreviousEmissions = previousYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    // Calculate year-over-year change
    const yearOverYearChange = totalPreviousEmissions > 0 
      ? ((totalCurrentEmissions - totalPreviousEmissions) / totalPreviousEmissions) * 100 
      : 0;
    
    // Calculate scope-specific emissions
    const scope1Current = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_1')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
      
    const scope2Current = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_2')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
      
    const scope3Current = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_3')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    // Calculate risk levels
    const riskLevels = {
      overall: yearOverYearChange > 5 ? 'high' : yearOverYearChange > 0 ? 'medium' : 'low',
      scope1: scope1Current > (totalCurrentEmissions * 0.4) ? 'high' : 'medium',
      scope2: scope2Current > (totalCurrentEmissions * 0.3) ? 'high' : 'medium',
      scope3: scope3Current > (totalCurrentEmissions * 0.5) ? 'high' : 'medium'
    };
    
    return {
      currentYear,
      previousYear,
      totalCurrentEmissions,
      totalPreviousEmissions,
      yearOverYearChange,
      scope1Current,
      scope2Current,
      scope3Current,
      riskLevels
    };
  }, [ghgEmissions]);
  
  // Generate PDF report
  const generatePDFReport = (reportId) => {
    setGeneratingReportId(reportId);
    setLoading(true);
    
    setTimeout(() => {
      try {
        // Create new PDF document
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Add header
        doc.setFontSize(22);
        doc.setTextColor(10, 61, 10);
        doc.text('ESGAadhar Executive Summary', pageWidth / 2, 20, { align: 'center' });
        
        // Add timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
        
        // Get current year and previous year
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        
        // Filter emissions by year
        const currentYearEmissions = ghgEmissions.filter(emission => {
          const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
          return emissionYear === currentYear;
        });
        
        const previousYearEmissions = ghgEmissions.filter(emission => {
          const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
          return emissionYear === previousYear;
        });
        
        // Calculate total emissions for current and previous year
        const totalCurrentYear = currentYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
        const totalPreviousYear = previousYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Calculate year-over-year change percentage
        const yearOverYearChange = totalPreviousYear > 0 
          ? ((totalCurrentYear - totalPreviousYear) / totalPreviousYear) * 100 
          : 0;
        
        // Add comparison data to PDF
        doc.setFontSize(14);
        doc.setTextColor(10, 61, 10);
        doc.text('Emissions Comparison', 20, 45);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${currentYear} Total Emissions: ${totalCurrentYear.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 60);
        doc.text(`${previousYear} Total Emissions: ${totalPreviousYear.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 70);
        doc.text(`Year-over-Year Change: ${yearOverYearChange > 0 ? '+' : ''}${yearOverYearChange.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`, 20, 80);
        
        // Add scope-specific comparisons
        doc.setFontSize(14);
        doc.setTextColor(10, 61, 10);
        doc.text('Emissions by Scope', 20, 100);
        
        // Calculate scope-specific emissions for current and previous year
        const currentScope1 = currentYearEmissions
          .filter(e => e.scope === 'SCOPE_1')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const currentScope2 = currentYearEmissions
          .filter(e => e.scope === 'SCOPE_2')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const currentScope3 = currentYearEmissions
          .filter(e => e.scope === 'SCOPE_3')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        const previousScope1 = previousYearEmissions
          .filter(e => e.scope === 'SCOPE_1')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const previousScope2 = previousYearEmissions
          .filter(e => e.scope === 'SCOPE_2')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const previousScope3 = previousYearEmissions
          .filter(e => e.scope === 'SCOPE_3')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Add scope data to PDF
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Scope 1 (${currentYear}): ${currentScope1.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 115);
        doc.text(`Scope 1 (${previousYear}): ${previousScope1.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 125);
        
        doc.text(`Scope 2 (${currentYear}): ${currentScope2.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 140);
        doc.text(`Scope 2 (${previousYear}): ${previousScope2.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 150);
        
        doc.text(`Scope 3 (${currentYear}): ${currentScope3.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 165);
        doc.text(`Scope 3 (${previousYear}): ${previousScope3.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 175);
        
        // Add a new page for detailed analysis
        doc.addPage();
        
        // Add header for detailed analysis
        doc.setFontSize(18);
        doc.setTextColor(10, 61, 10);
        doc.text('Detailed Emissions Analysis', pageWidth / 2, 20, { align: 'center' });
        
        // Add timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
        
        // KPI Data
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        // Get current year
        const currentYear2 = new Date().getFullYear();
        // Removed unused previousYear2 variable
        
        // Calculate total emissions by scope for current year
        const totalScope1 = ghgEmissions
          .filter(e => e.scope === 'SCOPE_1' && new Date(e.endDate).getFullYear() === currentYear2)
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const totalScope2 = ghgEmissions
          .filter(e => e.scope === 'SCOPE_2' && new Date(e.endDate).getFullYear() === currentYear2)
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const totalScope3 = ghgEmissions
          .filter(e => e.scope === 'SCOPE_3' && new Date(e.endDate).getFullYear() === currentYear2)
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Total emissions
        const totalEmissions = totalScope1 + totalScope2 + totalScope3;
        
        // Add KPI data to PDF
        doc.text(`Total Carbon Footprint: ${totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 60);
        doc.text(`Scope 1 Emissions: ${totalScope1.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 70);
        doc.text(`Scope 2 Emissions: ${totalScope2.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 80);
        doc.text(`Scope 3 Emissions: ${totalScope3.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e`, 20, 90);
        
        // Emission Distribution
        doc.setFontSize(14);
        doc.setTextColor(10, 61, 10);
        doc.text('Emission Distribution', 20, 110);
        
        // Risk Assessment
        doc.setFontSize(14);
        doc.setTextColor(10, 61, 10);
        doc.text('Risk Assessment', 20, 150);
        
        // Add risk assessment data
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        // Calculate risk levels
        const scope1Percentage = totalEmissions > 0 ? (totalScope1 / totalEmissions) * 100 : 0;
        const scope2Percentage = totalEmissions > 0 ? (totalScope2 / totalEmissions) * 100 : 0;
        const scope3Percentage = totalEmissions > 0 ? (totalScope3 / totalEmissions) * 100 : 0;
        
        const scope1Risk = scope1Percentage > 40 ? 'High' : scope1Percentage > 20 ? 'Medium' : 'Low';
        const scope2Risk = scope2Percentage > 30 ? 'High' : scope2Percentage > 15 ? 'Medium' : 'Low';
        const scope3Risk = scope3Percentage > 50 ? 'High' : scope3Percentage > 30 ? 'Medium' : 'Low';
        
        doc.text(`Scope 1 Risk Level: ${scope1Risk}`, 20, 165);
        doc.text(`Scope 2 Risk Level: ${scope2Risk}`, 20, 175);
        doc.text(`Scope 3 Risk Level: ${scope3Risk}`, 20, 185);
        
        // Overall risk assessment
        const overallRisk = (scope1Risk === 'High' || scope2Risk === 'High' || scope3Risk === 'High') 
          ? 'High' 
          : (scope1Risk === 'Medium' || scope2Risk === 'Medium' || scope3Risk === 'Medium') 
            ? 'Medium' 
            : 'Low';
            
        doc.text(`Overall Risk Level: ${overallRisk}`, 20, 200);
        
        // Save the PDF
        doc.save('ESGAadhar_Executive_Summary.pdf');
        
        setNotification({
          open: true,
          message: 'Executive Summary PDF generated successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        setNotification({
          open: true,
          message: 'Error generating PDF report. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
        setGeneratingReportId(null);
      }
    }, 1500);
  };
  
  // Generate Excel report
  const generateExcelReport = (reportId) => {
    setGeneratingReportId(reportId);
    setLoading(true);
    
    setTimeout(() => {
      try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create emissions data worksheet
        const emissionsData = ghgEmissions.map(emission => ({
          'Scope': emission.scope,
          'Category': emission.category,
          'Activity': emission.activity || 'N/A',
          'Quantity': emission.quantity || 0,
          'Unit': emission.unit || 'N/A',
          'Start Date': emission.startDate ? new Date(emission.startDate).toLocaleDateString() : 'N/A',
          'End Date': emission.endDate ? new Date(emission.endDate).toLocaleDateString() : 'N/A',
          'Status': emission.status || 'N/A',
          'Submitted By': emission.submittedBy?.name || 'N/A',
          'Submitted At': emission.submittedAt ? new Date(emission.submittedAt).toLocaleDateString() : 'N/A'
        }));
        
        const emissionsWs = XLSX.utils.json_to_sheet(emissionsData);
        XLSX.utils.book_append_sheet(wb, emissionsWs, 'Emissions Data');
        
        // Create summary worksheet
        const summaryData = [];
        
        // Get current year and previous year
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        
        // Filter emissions by year
        const currentYearEmissions = ghgEmissions.filter(emission => {
          const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
          return emissionYear === currentYear;
        });
        
        const previousYearEmissions = ghgEmissions.filter(emission => {
          const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
          return emissionYear === previousYear;
        });
        
        // Calculate total emissions for current and previous year
        const totalCurrentYear = currentYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
        const totalPreviousYear = previousYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        // Calculate year-over-year change percentage
        const yearOverYearChange = totalPreviousYear > 0 
          ? ((totalCurrentYear - totalPreviousYear) / totalPreviousYear) * 100 
          : 0;
        
        // Add summary data
        summaryData.push({
          'Metric': 'Total Emissions (Current Year)',
          'Value': totalCurrentYear.toFixed(2) + ' tCO₂e'
        });
        
        summaryData.push({
          'Metric': 'Total Emissions (Previous Year)',
          'Value': totalPreviousYear.toFixed(2) + ' tCO₂e'
        });
        
        summaryData.push({
          'Metric': 'Year-over-Year Change',
          'Value': yearOverYearChange.toFixed(2) + '%'
        });
        
        // Calculate scope-specific emissions
        const scope1Current = currentYearEmissions
          .filter(e => e.scope === 'SCOPE_1')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const scope2Current = currentYearEmissions
          .filter(e => e.scope === 'SCOPE_2')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
        const scope3Current = currentYearEmissions
          .filter(e => e.scope === 'SCOPE_3')
          .reduce((sum, e) => sum + (e.quantity || 0), 0);
        
        summaryData.push({
          'Metric': 'Scope 1 Emissions (Current Year)',
          'Value': scope1Current.toFixed(2) + ' tCO₂e'
        });
        
        summaryData.push({
          'Metric': 'Scope 2 Emissions (Current Year)',
          'Value': scope2Current.toFixed(2) + ' tCO₂e'
        });
        
        summaryData.push({
          'Metric': 'Scope 3 Emissions (Current Year)',
          'Value': scope3Current.toFixed(2) + ' tCO₂e'
        });
        
        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        
        // Save the Excel file
        XLSX.writeFile(wb, 'ESGAadhar_Executive_Summary.xlsx');
        
        setNotification({
          open: true,
          message: 'Executive Summary Excel file generated successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error generating Excel:', error);
        setNotification({
          open: true,
          message: 'Error generating Excel report. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
        setGeneratingReportId(null);
      }
    }, 1500);
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Typography variant="h5" sx={{ mb: 2, color: '#0A3D0A', fontWeight: 'bold' }}>
        Executive Summary
      </Typography>
      
      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#0A3D0A' }}>
                Total Carbon Footprint
              </Typography>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                {calculateRiskLevels.totalCurrentEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {calculateRiskLevels.yearOverYearChange > 0 ? (
                  <TrendingUpIcon sx={{ color: '#f44336', mr: 1 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: '#4caf50', mr: 1 }} />
                )}
                <Typography variant="body2" color={calculateRiskLevels.yearOverYearChange > 0 ? '#f44336' : '#4caf50'}>
                  {calculateRiskLevels.yearOverYearChange > 0 ? '+' : ''}
                  {calculateRiskLevels.yearOverYearChange.toLocaleString(undefined, { maximumFractionDigits: 1 })}% from previous year
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#0A3D0A' }}>
                Emissions by Scope
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Scope 1:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {calculateRiskLevels.scope1Current.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Scope 2:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {calculateRiskLevels.scope2Current.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Scope 3:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {calculateRiskLevels.scope3Current.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#0A3D0A' }}>
                Risk Assessment
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {calculateRiskLevels.riskLevels.overall === 'high' ? (
                  <WarningAmberIcon sx={{ color: '#f44336', mr: 1 }} />
                ) : calculateRiskLevels.riskLevels.overall === 'medium' ? (
                  <WarningAmberIcon sx={{ color: '#ff9800', mr: 1 }} />
                ) : (
                  <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                )}
                <Typography 
                  variant="body1" 
                  color={
                    calculateRiskLevels.riskLevels.overall === 'high' 
                      ? '#f44336' 
                      : calculateRiskLevels.riskLevels.overall === 'medium' 
                        ? '#ff9800' 
                        : '#4caf50'
                  }
                >
                  Overall Risk: {calculateRiskLevels.riskLevels.overall.charAt(0).toUpperCase() + calculateRiskLevels.riskLevels.overall.slice(1)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {calculateRiskLevels.riskLevels.overall === 'high' 
                  ? 'Your emissions are significantly increasing. Immediate action recommended.'
                  : calculateRiskLevels.riskLevels.overall === 'medium'
                    ? 'Your emissions are slightly increasing. Consider implementing reduction strategies.'
                    : 'Your emissions are stable or decreasing. Continue with current strategies.'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Report Generation */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 2, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#0A3D0A' }}>
              Generate Reports
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SummarizeIcon />}
                  onClick={() => generatePDFReport('pdf')}
                  disabled={loading && generatingReportId === 'pdf'}
                  sx={{ 
                    bgcolor: '#0A3D0A', 
                    '&:hover': { bgcolor: '#072807' },
                    py: 1.5
                  }}
                >
                  {loading && generatingReportId === 'pdf' ? (
                    <>
                      <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                      Generating PDF...
                    </>
                  ) : (
                    'Generate PDF Report'
                  )}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={() => generateExcelReport('excel')}
                  disabled={loading && generatingReportId === 'excel'}
                  sx={{ 
                    bgcolor: '#9DC183', 
                    '&:hover': { bgcolor: '#8baf71' },
                    py: 1.5
                  }}
                >
                  {loading && generatingReportId === 'excel' ? (
                    <>
                      <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                      Generating Excel...
                    </>
                  ) : (
                    'Export to Excel'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExecutiveSummary;
