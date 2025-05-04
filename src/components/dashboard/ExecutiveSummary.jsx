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
    
    // Calculate year-over-year change percentage
    const yoyChangePercentage = totalPreviousEmissions > 0 
      ? ((totalCurrentEmissions - totalPreviousEmissions) / totalPreviousEmissions) * 100 
      : 0;
    
    // Industry benchmarks (these would ideally come from a database)
    const regulatoryThreshold = 10000; // Example threshold in tCO₂e
    const marketExpectation = -5; // Expected YoY reduction percentage
    
    // Calculate regulatory risk based on total emissions vs threshold
    let regulatoryRisk = 'Low';
    if (totalCurrentEmissions > regulatoryThreshold * 1.5) {
      regulatoryRisk = 'High';
    } else if (totalCurrentEmissions > regulatoryThreshold) {
      regulatoryRisk = 'Medium';
    }
    
    // Calculate market risk based on YoY performance vs expectations
    let marketRisk = 'Low';
    if (yoyChangePercentage > 0) { // Emissions increased
      marketRisk = 'High';
    } else if (yoyChangePercentage > marketExpectation) { // Reduction but not meeting expectations
      marketRisk = 'Medium';
    }
    
    // Calculate physical risk based on scope 1 emissions (direct operations)
    const scope1Emissions = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_1')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    let physicalRisk = 'Low';
    if (scope1Emissions > 5000) {
      physicalRisk = 'High';
    } else if (scope1Emissions > 2000) {
      physicalRisk = 'Medium';
    }
    
    return {
      regulatory: {
        level: regulatoryRisk,
        description: `Based on total emissions of ${totalCurrentEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e relative to regulatory threshold of ${regulatoryThreshold.toLocaleString()} tCO₂e.`
      },
      market: {
        level: marketRisk,
        description: `Based on ${yoyChangePercentage > 0 ? 'increase' : 'reduction'} of ${Math.abs(yoyChangePercentage).toFixed(1)}% vs market expectation of ${Math.abs(marketExpectation)}% reduction.`
      },
      physical: {
        level: physicalRisk,
        description: `Based on scope 1 emissions of ${scope1Emissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e from direct operations.`
      }
    };
  }, [ghgEmissions]);

  const kpiData = useMemo(() => {
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
    
    // Calculate total emissions by scope for current year
    const totalScope1 = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_1')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
      
    const totalScope2 = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_2')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
      
    const totalScope3 = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_3')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    // Calculate total emissions for previous year
    const previousTotalEmissions = previousYearEmissions
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    // Calculate total current emissions
    const totalEmissions = totalScope1 + totalScope2 + totalScope3;
    
    // Calculate year-over-year change percentage
    const emissionsChange = previousTotalEmissions > 0 
      ? ((totalEmissions - previousTotalEmissions) / previousTotalEmissions) * 100 
      : 0;
    
    // Calculate renewable energy percentage (from purchased electricity)
    const totalElectricity = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_2' && e.category === 'PURCHASED_ELECTRICITY')
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
      
    const renewableElectricity = currentYearEmissions
      .filter(e => e.scope === 'SCOPE_2' && e.category === 'PURCHASED_ELECTRICITY' && e.source?.toLowerCase().includes('renewable'))
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
      
    const renewablePercentage = totalElectricity > 0 
      ? (renewableElectricity / totalElectricity) * 100 
      : 0;
    
    // Calculate carbon intensity (emissions per revenue unit)
    // Note: In a real app, you would fetch company revenue data from the backend
    const companyRevenue = 15000000; // Example revenue in dollars
    const carbonIntensity = companyRevenue > 0 
      ? totalEmissions / (companyRevenue / 1000000) // tCO₂e per million dollars
      : 0;
    
    return [
      { 
        id: 1, 
        name: 'Total Carbon Footprint', 
        value: totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 }), 
        unit: 'tCO₂e',
        change: emissionsChange,
        status: emissionsChange <= 0 ? 'positive' : 'negative'
      },
      { 
        id: 2, 
        name: 'Carbon Intensity', 
        value: carbonIntensity.toLocaleString(undefined, { maximumFractionDigits: 2 }), 
        unit: 'tCO₂e/million $',
        change: -8.6, // Placeholder - would calculate from historical data
        status: 'positive'
      },
      { 
        id: 3, 
        name: 'Renewable Energy', 
        value: renewablePercentage.toLocaleString(undefined, { maximumFractionDigits: 1 }), 
        unit: '%',
        change: 15.2, // Placeholder - would calculate from historical data
        status: 'positive'
      },
      { 
        id: 4, 
        name: 'Scope 3 Emissions', 
        value: totalScope3.toLocaleString(undefined, { maximumFractionDigits: 2 }), 
        unit: 'tCO₂e',
        change: 3.8, // Placeholder - would calculate from historical data
        status: 'negative'
      }
    ];
  }, [ghgEmissions]);
  
  // Generate dynamic risk assessment based on emissions data
  const riskAssessment = useMemo(() => [
    { 
      id: 1, 
      category: 'Regulatory', 
      level: calculateRiskLevels.regulatory.level.toLowerCase(),
      description: calculateRiskLevels.regulatory.description
    },
    { 
      id: 2, 
      category: 'Market', 
      level: calculateRiskLevels.market.level.toLowerCase(),
      description: calculateRiskLevels.market.description
    },
    { 
      id: 3, 
      category: 'Physical', 
      level: calculateRiskLevels.physical.level.toLowerCase(),
      description: calculateRiskLevels.physical.description
    }
  ], [calculateRiskLevels]);
  
  const reportTypes = [
    { id: 1, name: 'Executive Dashboard Summary', format: 'PDF' },
    { id: 2, name: 'Detailed Emissions Report', format: 'Excel' },
    { id: 3, name: 'Compliance Documentation Package', format: 'ZIP' },
    { id: 4, name: 'Year-over-Year Comparison', format: 'PDF' }
  ];
  
  // Handle report generation
  const generateReport = async (reportType) => {
    try {
      setGeneratingReportId(reportType.id);
      setLoading(true);
      
      // Filter approved emissions only
      const approvedEmissions = ghgEmissions.filter(emission => emission.status === 'APPROVED');
      
      // Get current date for filename
      const today = new Date();
      const dateString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      
      // Generate different report types
      switch (reportType.id) {
        case 1: // Executive Dashboard Summary (PDF)
          await generateExecutiveSummaryPDF(approvedEmissions, dateString);
          break;
        case 2: // Detailed Emissions Report (Excel)
          await generateDetailedEmissionsExcel(approvedEmissions, dateString);
          break;
        case 3: // Compliance Documentation Package (ZIP)
          // This would typically require backend support to generate a ZIP file
          // For now, we'll show a notification that this feature is coming soon
          setTimeout(() => {
            setNotification({
              open: true,
              message: 'Compliance Documentation Package generation coming soon!',
              severity: 'info'
            });
          }, 1000);
          break;
        case 4: // Year-over-Year Comparison (PDF)
          await generateYearOverYearPDF(approvedEmissions, dateString);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      // Show success notification
      if (reportType.id !== 3) { // Skip for compliance package which has its own notification
        setNotification({
          open: true,
          message: `${reportType.name} generated successfully!`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setNotification({
        open: true,
        message: `Error generating report: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setGeneratingReportId(null);
    }
  };
  
  // Generate Executive Summary PDF
  const generateExecutiveSummaryPDF = async (emissions, dateString) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();
          
          // Title
          doc.setFontSize(20);
          doc.setTextColor(10, 61, 10); // #0A3D0A
          doc.text('ESGAadhar Executive Dashboard Summary', pageWidth / 2, 20, { align: 'center' });
          
          // Date
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
          
          // Company Info
          doc.setFontSize(14);
          doc.setTextColor(10, 61, 10);
          doc.text('Company Performance Overview', 20, 45);
          
          // KPI Data
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          
          // Get current year and previous year
          const currentYear = new Date().getFullYear();
          const previousYear = currentYear - 1;
          
          // Calculate total emissions by scope for current year
          const totalScope1 = emissions
            .filter(e => e.scope === 'SCOPE_1' && new Date(e.endDate).getFullYear() === currentYear)
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
            
          const totalScope2 = emissions
            .filter(e => e.scope === 'SCOPE_2' && new Date(e.endDate).getFullYear() === currentYear)
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
            
          const totalScope3 = emissions
            .filter(e => e.scope === 'SCOPE_3' && new Date(e.endDate).getFullYear() === currentYear)
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
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Regulatory Risk: ${calculateRiskLevels.regulatory.level}`, 20, 165);
          doc.text(`Market Risk: ${calculateRiskLevels.market.level}`, 20, 175);
          doc.text(`Physical Risk: ${calculateRiskLevels.physical.level}`, 20, 185);
          
          // Risk descriptions (smaller font)
          doc.setFontSize(9);
          doc.text(calculateRiskLevels.regulatory.description, 20, 172);
          doc.text(calculateRiskLevels.market.description, 20, 182);
          doc.text(calculateRiskLevels.physical.description, 20, 192);
          
          // Save the PDF
          doc.save(`ESGAadhar_Executive_Summary_${dateString}.pdf`);
          resolve();
        } catch (error) {
          console.error('Error generating PDF:', error);
          throw error;
        }
      }, 1500); // Simulate processing time
    });
  };
  
  // Generate Detailed Emissions Excel
  const generateDetailedEmissionsExcel = async (emissions, dateString) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // Prepare data for Excel
          const excelData = emissions.map(emission => ({
            'Submission ID': emission.id,
            'Scope': emission.scope,
            'Category': emission.category,
            'Start Date': emission.startDate ? new Date(emission.startDate).toLocaleDateString() : '',
            'End Date': emission.endDate ? new Date(emission.endDate).toLocaleDateString() : '',
            'Quantity': emission.quantity,
            'Unit': emission.unit,
            'Source': emission.source,
            'Activity': emission.activity,
            'Calculation Method': emission.calculationMethod,
            'Emission Factor': emission.emissionFactor,
            'Emission Factor Unit': emission.emissionFactorUnit,
            'Submission Date': emission.submissionDate ? new Date(emission.submissionDate).toLocaleDateString() : '',
            'Notes': emission.notes
          }));
          
          // Create workbook and worksheet
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(excelData);
          
          // Add worksheet to workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Detailed Emissions');
          
          // Generate Excel file
          XLSX.writeFile(workbook, `ESGAadhar_Detailed_Emissions_${dateString}.xlsx`);
          resolve();
        } catch (error) {
          console.error('Error generating Excel:', error);
          throw error;
        }
      }, 1500); // Simulate processing time
    });
  };
  
  // Generate Year-over-Year Comparison PDF
  const generateYearOverYearPDF = async (emissions, dateString) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();
          
          // Title
          doc.setFontSize(20);
          doc.setTextColor(10, 61, 10); // #0A3D0A
          doc.text('ESGAadhar Year-over-Year Comparison', pageWidth / 2, 20, { align: 'center' });
          
          // Date
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
          
          // Get current year and previous year
          const currentYear = new Date().getFullYear();
          const previousYear = currentYear - 1;
          
          // Filter emissions by year
          const currentYearEmissions = emissions.filter(emission => {
            const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
            return emissionYear === currentYear;
          });
          
          const previousYearEmissions = emissions.filter(emission => {
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
          doc.text('Scope-Specific Comparison', 20, 100);
          
          // Calculate scope-specific emissions for current and previous year
          const currentScope1 = currentYearEmissions
            .filter(e => e.scope === 'SCOPE_1')
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
            
          const previousScope1 = previousYearEmissions
            .filter(e => e.scope === 'SCOPE_1')
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
            
          const currentScope2 = currentYearEmissions
            .filter(e => e.scope === 'SCOPE_2')
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
            
          const previousScope2 = previousYearEmissions
            .filter(e => e.scope === 'SCOPE_2')
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
            
          const currentScope3 = currentYearEmissions
            .filter(e => e.scope === 'SCOPE_3')
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
            
          const previousScope3 = previousYearEmissions
            .filter(e => e.scope === 'SCOPE_3')
            .reduce((sum, e) => sum + (e.quantity || 0), 0);
          
          // Calculate year-over-year changes for each scope
          const scope1Change = previousScope1 > 0 
            ? ((currentScope1 - previousScope1) / previousScope1) * 100 
            : 0;
            
          const scope2Change = previousScope2 > 0 
            ? ((currentScope2 - previousScope2) / previousScope2) * 100 
            : 0;
            
          const scope3Change = previousScope3 > 0 
            ? ((currentScope3 - previousScope3) / previousScope3) * 100 
            : 0;
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Scope 1: ${scope1Change > 0 ? '+' : ''}${scope1Change.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`, 20, 115);
          doc.text(`Scope 2: ${scope2Change > 0 ? '+' : ''}${scope2Change.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`, 20, 125);
          doc.text(`Scope 3: ${scope3Change > 0 ? '+' : ''}${scope3Change.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`, 20, 135);
          
          // Save the PDF
          doc.save(`ESGAadhar_YoY_Comparison_${dateString}.pdf`);
          resolve();
        } catch (error) {
          console.error('Error generating PDF:', error);
          throw error;
        }
      }, 1500); // Simulate processing time
    });
  };
  
  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Helper function to render risk level indicator
  const renderRiskLevel = (level) => {
    const colors = {
      low: { bg: '#E8F5E9', text: '#2E7D32', icon: <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
      medium: { bg: '#FFF8E1', text: '#F57C00', icon: <WarningAmberIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
      high: { bg: '#FFEBEE', text: '#C62828', icon: <WarningAmberIcon sx={{ fontSize: 16, mr: 0.5 }} /> }
    };
    
    return (
      <Box 
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center',
          backgroundColor: colors[level].bg,
          color: colors[level].text,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 'medium'
        }}
      >
        {colors[level].icon}
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Box>
    );
  };

  return (
    <>
      <Card sx={{ 
        mb: 4, 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        borderRadius: 2
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SummarizeIcon sx={{ color: '#0A3D0A', mr: 1 }} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
              Executive Summary
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {/* Key Performance Indicators */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
                Key Performance Indicators
              </Typography>
              <Grid container spacing={2}>
                {kpiData.map((kpi) => (
                  <Grid item xs={12} sm={6} key={kpi.id}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        backgroundColor: '#f5f9f5', 
                        borderRadius: 1,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {kpi.name}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0A3D0A', mb: 1 }}>
                        {kpi.value} <Typography component="span" variant="body2">{kpi.unit}</Typography>
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mt: 'auto',
                        color: kpi.status === 'positive' ? '#2E7D32' : '#d32f2f'
                      }}>
                        {kpi.change > 0 ? (
                          kpi.status === 'positive' ? (
                            <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          ) : (
                            <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          )
                        ) : (
                          kpi.status === 'positive' ? (
                            <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                          ) : (
                            <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                          )
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {kpi.change > 0 ? '+' : ''}{kpi.change}% from last year
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Risk Assessment */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
                Risk Assessment
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#f5f9f5', 
                  borderRadius: 1
                }}
              >
                {riskAssessment.map((risk, index) => (
                  <Box key={risk.id} sx={{ mb: index < riskAssessment.length - 1 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {risk.category} Risk
                      </Typography>
                      {renderRiskLevel(risk.level)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {risk.description}
                    </Typography>
                    {index < riskAssessment.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Paper>
              
              {/* Report Generation */}
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
                Report Generation
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#f5f9f5', 
                  borderRadius: 1
                }}
              >
                <Grid container spacing={1}>
                  {reportTypes.map((report) => (
                    <Grid item xs={12} sm={6} key={report.id}>
                      <Button
                        variant="outlined"
                        startIcon={loading && generatingReportId === report.id ? 
                          <CircularProgress size={16} color="inherit" /> : 
                          <DownloadIcon />}
                        size="small"
                        fullWidth
                        disabled={loading}
                        onClick={() => generateReport(report)}
                        sx={{ 
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          mb: 1,
                          borderColor: '#9DC183',
                          color: '#0A3D0A',
                          '&:hover': {
                            borderColor: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {report.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.format} Format
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExecutiveSummary;
