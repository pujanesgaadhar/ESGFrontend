import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,

  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { submitESGData } from '../services/api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ESGDataForm = () => {
  const [formData, setFormData] = useState({
    reportingPeriod: new Date(),
    environmentalMetrics: {
      ghgEmissions: {
        scope1: '',
        scope2: '',
        scope3: '',
        unit: 'tCO2e' // tonnes of CO2 equivalent
      },
      energyConsumption: {
        total: '',
        renewable: '',
        unit: 'MWh'
      },
      waterConsumption: {
        total: '',
        recycled: '',
        unit: 'm3'
      },
      wasteManagement: {
        totalWaste: '',
        recycledWaste: '',
        unit: 'tonnes'
      }
    },
    socialMetrics: {
      workforce: {
        totalEmployees: '',
        femaleEmployees: '',
        permanentEmployees: '',
        temporaryEmployees: '',
        unit: 'count'
      },
      healthAndSafety: {
        lostTimeInjuryRate: '',
        totalRecordableIncidentRate: '',
        fatalityRate: '',
        unit: 'per million hours worked'
      },
      training: {
        averageTrainingHours: '',
        trainingExpenditure: '',
        unit: 'hours per employee'
      }
    },
    governanceMetrics: {
      boardComposition: {
        totalMembers: '',
        independentMembers: '',
        femaleMembers: '',
        unit: 'count'
      },
      ethicsCompliance: {
        reportedIncidents: '',
        confirmedIncidents: '',
        unit: 'count'
      },
      riskManagement: {
        riskAssessments: '',
        criticalRisksIdentified: '',
        unit: 'count'
      }
    }
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (section, subsection, field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: event.target.value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitESGData(formData);
      setSuccess('ESG data submitted successfully. Awaiting manager approval.');
      setError('');
    } catch (err) {
      setError('Failed to submit ESG data. Please try again.');
      setSuccess('');
    }
  };

  const renderMetricFields = (section, sectionData) => {
    return Object.entries(sectionData).map(([subsection, data]) => {
      if (subsection === 'unit') return null;
      
      return (
        <Grid item xs={12} md={6} key={`${section}-${subsection}`}>
          <TextField
            fullWidth
            label={subsection.replace(/([A-Z])/g, ' $1').trim()}
            type="number"
            value={data}
            onChange={handleChange(section, subsection)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {sectionData.unit}
                </InputAdornment>
              ),
            }}
            helperText={`Enter value in ${sectionData.unit}`}
          />
        </Grid>
      );
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          ESG Data Submission Form
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DatePicker
                label="Reporting Period"
                value={formData.reportingPeriod}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, reportingPeriod: newValue }));
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            {/* Environmental Metrics */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Environmental Metrics</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* GHG Emissions */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        GHG Emissions
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('environmentalMetrics', formData.environmentalMetrics.ghgEmissions)}
                      </Grid>
                    </Grid>

                    {/* Energy Consumption */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Energy Consumption
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('environmentalMetrics', formData.environmentalMetrics.energyConsumption)}
                      </Grid>
                    </Grid>

                    {/* Water Consumption */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Water Consumption
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('environmentalMetrics', formData.environmentalMetrics.waterConsumption)}
                      </Grid>
                    </Grid>

                    {/* Waste Management */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Waste Management
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('environmentalMetrics', formData.environmentalMetrics.wasteManagement)}
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Social Metrics */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Social Metrics</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Workforce */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Workforce
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('socialMetrics', formData.socialMetrics.workforce)}
                      </Grid>
                    </Grid>

                    {/* Health and Safety */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Health and Safety
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('socialMetrics', formData.socialMetrics.healthAndSafety)}
                      </Grid>
                    </Grid>

                    {/* Training */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Training
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('socialMetrics', formData.socialMetrics.training)}
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Governance Metrics */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Governance Metrics</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Board Composition */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Board Composition
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('governanceMetrics', formData.governanceMetrics.boardComposition)}
                      </Grid>
                    </Grid>

                    {/* Ethics and Compliance */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Ethics and Compliance
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('governanceMetrics', formData.governanceMetrics.ethicsCompliance)}
                      </Grid>
                    </Grid>

                    {/* Risk Management */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Risk Management
                      </Typography>
                      <Grid container spacing={2}>
                        {renderMetricFields('governanceMetrics', formData.governanceMetrics.riskManagement)}
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Submit ESG Data
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ESGDataForm;
