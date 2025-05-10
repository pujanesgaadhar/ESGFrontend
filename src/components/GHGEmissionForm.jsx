import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  // Paper removed - unused import
  Button,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { submitGHGEmissionData } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GREEN = '#0A3D0A';
// LIGHT_GREEN removed - unused variable

const scope1ActivityTypes = [
  { label: 'Fuel Combustion', value: 'FUEL_COMBUSTION' },
  { label: 'Process Emissions', value: 'PROCESS_EMISSIONS' },
  { label: 'Vehicle Use', value: 'VEHICLE_USE' },
];
const fuelTypes = ['Diesel', 'Petrol', 'Natural Gas', 'LPG', 'Other'];
const scope2Sources = ['Grid', 'DG Generator'];
const scope3ActivityTypes = [
  { label: 'Raw Materials Transport', value: 'RAW_MATERIALS_TRANSPORT' },
  { label: 'Finished Goods', value: 'FINISHED_GOODS' },
  { label: 'Outsourcing', value: 'OUTSOURCING' },
  { label: 'Waste', value: 'WASTE' },
];
const scope3VehicleTypes = ['Truck', 'Train', 'Car', 'Bus'];
const solventNames = ['Methanol', 'Toluene', 'IPA', 'Other'];
const treeSpecies = ['Neem', 'Peepal', 'Banyan', 'Other'];

function a11yProps(index) {
  return {
    id: `ghg-tab-${index}`,
    'aria-controls': `ghg-tabpanel-${index}`,
  };
}

const formSectionStyles = {
  backgroundColor: '#fff',
  borderRadius: 2,
  p: 3,
  mb: 2 // Reduced margin bottom
};

// datePickerSectionStyles removed - unused variable

const inputFieldStyles = {
  '& .MuiOutlinedInput-root': {
    height: '48px',
    backgroundColor: '#fff'
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    transform: 'translate(14px, 16px)',
    '&.Mui-focused, &.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)'
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px',
    '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0
    }
  },
  '& .MuiInputAdornment-root': {
    marginLeft: 0,
    marginRight: 8
  }
};

// emissionFactorFieldStyles removed - unused variable
// Removed unused labelStyles variable

const emissionFactorStyles = {
  '& .MuiOutlinedInput-root': {
    height: '48px',
    backgroundColor: '#fff',
    '& .MuiInputAdornment-root': {
      marginLeft: 0
    }
  },
  '& .MuiInputLabel-root': {
    width: '50%', // Reduce label width to prevent overlap
    transform: 'translate(14px, 16px)',
    '&.Mui-focused, &.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)',
      width: '100%'
    }
  },
  '& .MuiOutlinedInput-input': {
    paddingRight: '100px' // Add space for the unit text
  }
};

const reportingPeriodStyles = {
  backgroundColor: '#f8faf8',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: 1,
  p: 2,
  '& .MuiGrid-container': {
    gap: 2
  }
};

const GHGEmissionForm = ({ companyId, onSuccess, onError }) => {
  const [tab, setTab] = useState(0);
  // Using useAuth hook
  useAuth(); // Just calling the hook without destructuring

  // Individual state for each form section
  const [scope1, setScope1] = useState({
    activityType: '',
    fuelType: '',
    quantity: '',
    emissionFactor: '',
    startDate: null,
    endDate: null,
    emissions: '',
  });
  const [scope2, setScope2] = useState({
    source: '',
    energyConsumed: '',
    emissionFactor: '',
    startDate: null,
    endDate: null,
    emissions: '',
  });
  const [scope3, setScope3] = useState({
    activityType: '',
    vehicleType: '',
    fuelType: '',
    distance: '',
    weight: '',
    emissionFactor: '',
    startDate: null,
    endDate: null,
    emissions: '',
  });
  const [solvent, setSolvent] = useState({
    name: '',
    consumed: '',
    recovered: '',
    loss: '',
    startDate: null,
    endDate: null,
  });
  const [sink, setSink] = useState({
    treeCount: '',
    avgHeight: '',
    species: '',
    startDate: null,
    endDate: null,
    sequestration: '',
  });

  // Tab switch handler
  const handleTabChange = (event, newValue) => setTab(newValue);

  // Calculation and change handlers for each section
  const handleScope1Change = (e) => {
    const { name, value } = e.target;
    let newData = { ...scope1, [name]: value };
    if (name === 'quantity' || name === 'emissionFactor') {
      const q = parseFloat(newData.quantity) || 0;
      const ef = parseFloat(newData.emissionFactor) || 0;
      newData.emissions = (q * ef).toFixed(2);
    }
    setScope1(newData);
  };
  const handleScope2Change = (e) => {
    const { name, value } = e.target;
    let newData = { ...scope2, [name]: value };
    if (name === 'energyConsumed' || name === 'emissionFactor') {
      const ec = parseFloat(newData.energyConsumed) || 0;
      const ef = parseFloat(newData.emissionFactor) || 0;
      newData.emissions = (ec * ef).toFixed(2);
    }
    setScope2(newData);
  };
  const handleScope3Change = (e) => {
    const { name, value } = e.target;
    let newData = { ...scope3, [name]: value };
    if (name === 'distance' || name === 'weight' || name === 'emissionFactor') {
      const d = parseFloat(newData.distance) || 0;
      const w = parseFloat(newData.weight) || 0;
      const ef = parseFloat(newData.emissionFactor) || 0;
      newData.emissions = (d * w * ef).toFixed(2);
    }
    setScope3(newData);
  };
  const handleSolventChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...solvent, [name]: value };
    if (name === 'consumed' || name === 'recovered') {
      const c = parseFloat(newData.consumed) || 0;
      const r = parseFloat(newData.recovered) || 0;
      newData.loss = (c - r).toFixed(2);
    }
    setSolvent(newData);
  };
  const handleSinkChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...sink, [name]: value };
    if (name === 'treeCount') {
      // Assume a fixed sequestration factor, e.g. 21.77 kg CO2e/tree/year
      const count = parseInt(value, 10) || 0;
      newData.sequestration = (count * 21.77).toFixed(2);
    }
    setSink(newData);
  };

  // Date handler for all sections
  const handleDateChange = (section, field, value) => {
    // Log date change for debugging
    console.log(`Date change for ${section}.${field}:`, {
      value,
      type: typeof value,
      isDate: value instanceof Date,
      isValid: value && !isNaN(new Date(value).getTime())
    });
    
    // Ensure we have a valid date object or null
    let dateValue = null;
    if (value) {
      try {
        // Convert to a proper Date object if it's not already
        dateValue = new Date(value);
        // Check if it's a valid date
        if (isNaN(dateValue.getTime())) {
          console.warn(`Invalid date value for ${section}.${field}:`, value);
          dateValue = new Date(); // Use current date as fallback
        }
      } catch (error) {
        console.error(`Error processing date for ${section}.${field}:`, error);
        dateValue = new Date(); // Use current date as fallback
      }
    }
    
    // Update the appropriate state
    if (section === 'scope1') {
      setScope1({ ...scope1, [field]: dateValue });
    } else if (section === 'scope2') {
      setScope2({ ...scope2, [field]: dateValue });
    } else if (section === 'scope3') {
      setScope3({ ...scope3, [field]: dateValue });
    } else if (section === 'solvent') {
      setSolvent({ ...solvent, [field]: dateValue });
    } else if (section === 'sink') {
      setSink({ ...sink, [field]: dateValue });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Create default dates to use if needed
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(23, 59, 59, 999);
      
      const defaultStartDate = today.toISOString();
      const defaultEndDate = tomorrow.toISOString();
      
      console.log('Using default dates if needed:', { defaultStartDate, defaultEndDate });
      
      let payload = null;
      const formatDatesForSubmission = (startDate, endDate) => {
        console.log('formatDatesForSubmission input:', { startDate, endDate });
        
        if (!startDate || !endDate) {
          console.error('Missing date in formatDatesForSubmission', { startDate, endDate });
          throw new Error('Both start and end dates are required');
        }
        
        try {
          // Ensure we have valid Date objects
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          // Check if dates are valid
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error('Invalid date object in formatDatesForSubmission', { 
              startDate, endDate, 
              startValid: !isNaN(start.getTime()), 
              endValid: !isNaN(end.getTime()) 
            });
            throw new Error('Invalid date format');
          }
          
          // Format dates with time components
          start.setHours(0, 0, 0, 0); // Start of day
          end.setHours(23, 59, 59, 999); // End of day
          
          const result = { 
            start: start.toISOString(), 
            end: end.toISOString() 
          };
          
          console.log('formatDatesForSubmission result:', result);
          return result;
        } catch (error) {
          console.error('Error in formatDatesForSubmission:', error);
          // Use current date as fallback
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          
          today.setHours(0, 0, 0, 0);
          tomorrow.setHours(23, 59, 59, 999);
          
          return { 
            start: today.toISOString(), 
            end: tomorrow.toISOString() 
          };
        }
      };
        
      // Prepare payload based on active tab
      if (tab === 0) { // Scope 1
        // Log all Scope 1 fields for debugging
        console.log('Scope 1 submission attempt with fields:', {
          activityType: scope1.activityType,
          fuelType: scope1.fuelType,
          quantity: scope1.quantity,
          emissionFactor: scope1.emissionFactor,
          startDate: scope1.startDate,
          endDate: scope1.endDate,
          startDateType: typeof scope1.startDate,
          endDateType: typeof scope1.endDate
        });
        
        // More lenient validation for Scope 1
        const missingFields = [];
        if (!scope1.activityType) missingFields.push('Activity Type');
        if (!scope1.fuelType) missingFields.push('Fuel Type');
        if (!scope1.quantity) missingFields.push('Quantity');
        if (!scope1.emissionFactor) missingFields.push('Emission Factor');
        
        // If we have missing fields, throw an error with the specific fields
        if (missingFields.length > 0) {
          throw new Error(`Please fill these required Scope 1 fields: ${missingFields.join(', ')}`);
        }
        
        // Use current date as fallback if dates are invalid or missing
        let start, end;
        try {
          // Try to use the selected dates first
          if (scope1.startDate && scope1.endDate) {
            const result = formatDatesForSubmission(scope1.startDate, scope1.endDate);
            start = result.start;
            end = result.end;
          } else {
            throw new Error('Missing date fields');
          }
        } catch (error) {
          console.warn('Using default dates for Scope 1:', error.message);
          // Use current date range as fallback
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          
          today.setHours(0, 0, 0, 0);
          tomorrow.setHours(23, 59, 59, 999);
          
          start = today.toISOString();
          end = tomorrow.toISOString();
        }
        
        // Convert activity type to a proper format
        const activityTypeValue = scope1.activityType;
        
        // Map activity type to the correct category
        let category;
        switch (activityTypeValue) {
          case 'FUEL_COMBUSTION':
            category = 'STATIONARY_COMBUSTION';
            break;
          case 'PROCESS_EMISSIONS':
            category = 'PROCESS_EMISSIONS';
            break;
          case 'VEHICLE_USE':
            category = 'MOBILE_COMBUSTION';
            break;
          default:
            category = 'STATIONARY_COMBUSTION';
        }
        
        // Calculate emissions if not already done
        const emissions = scope1.emissions || 
          (parseFloat(scope1.quantity) * parseFloat(scope1.emissionFactor)).toFixed(2);
        
        payload = {
          scope: 'SCOPE_1',
          category: category,
          timeFrame: 'CUSTOM',
          startDate: start,
          endDate: end,
          quantity: parseFloat(scope1.quantity),
          unit: 'liters',
          emissionFactor: parseFloat(scope1.emissionFactor),
          emissionFactorUnit: 'kgCO2e/liter',
          emissions: parseFloat(emissions), // Add calculated emissions
          activity: scope1.activityType,
          source: scope1.fuelType,
          notes: `Fuel: ${scope1.fuelType}, Emissions: ${emissions} kgCO2e`,
          status: 'PENDING',
          calculationMethod: 'DIRECT_MEASUREMENT'
        };
      } else if (tab === 1) { // Scope 2
        if (!scope2.source || !scope2.energyConsumed || !scope2.emissionFactor || !scope2.startDate || !scope2.endDate) {
          throw new Error('Please fill all required Scope 2 fields, including start and end dates.');
        }
        const { start, end } = formatDatesForSubmission(scope2.startDate, scope2.endDate);
        // Map energy source to the correct category
        let category;
        switch(scope2.source) {
          case 'ELECTRICITY':
            category = 'PURCHASED_ELECTRICITY';
            break;
          case 'HEATING':
            category = 'PURCHASED_HEATING';
            break;
          case 'COOLING':
            category = 'PURCHASED_COOLING';
            break;
          case 'STEAM':
            category = 'PURCHASED_STEAM';
            break;
          default:
            category = 'PURCHASED_ELECTRICITY';
        }
        
        // Calculate emissions if not already done
        const emissions = scope2.emissions || 
          (parseFloat(scope2.energyConsumed) * parseFloat(scope2.emissionFactor)).toFixed(2);
        
        payload = {
          scope: 'SCOPE_2',
          category: category,
          timeFrame: 'CUSTOM',
          startDate: start,
          endDate: end,
          quantity: parseFloat(scope2.energyConsumed),
          unit: 'kWh',
          emissionFactor: parseFloat(scope2.emissionFactor),
          emissionFactorUnit: 'kgCO2e/kWh',
          emissions: parseFloat(emissions),
          activity: 'ENERGY_CONSUMPTION',
          source: scope2.source,
          notes: `Energy Type: ${scope2.source}, Emissions: ${emissions} kgCO2e`,
          status: 'PENDING',
          calculationMethod: 'DIRECT_MEASUREMENT'
        };
      } else if (tab === 2) { // Scope 3
        // Log all Scope 3 fields for debugging
        console.log('Scope 3 submission attempt with fields:', {
          activityType: scope3.activityType,
          vehicleType: scope3.vehicleType,
          distance: scope3.distance,
          weight: scope3.weight,
          emissionFactor: scope3.emissionFactor,
          startDate: scope3.startDate,
          endDate: scope3.endDate
        });
        
        // More lenient validation for Scope 3
        const missingFields = [];
        if (!scope3.activityType) missingFields.push('Activity Type');
        
        // At least one of distance or weight should be provided
        if (!scope3.distance && !scope3.weight) {
          missingFields.push('Distance or Weight');
        }
        
        // If we have missing fields, throw an error with the specific fields
        if (missingFields.length > 0) {
          throw new Error(`Please fill these required Scope 3 fields: ${missingFields.join(', ')}`);
        }
        
        // Use current date as fallback if dates are invalid or missing
        let start, end;
        try {
          // Try to use the selected dates first
          if (scope3.startDate && scope3.endDate) {
            const result = formatDatesForSubmission(scope3.startDate, scope3.endDate);
            start = result.start;
            end = result.end;
          } else {
            throw new Error('Missing date fields');
          }
        } catch (error) {
          console.warn('Using default dates for Scope 3:', error.message);
          // Use current date range as fallback
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          
          today.setHours(0, 0, 0, 0);
          tomorrow.setHours(23, 59, 59, 999);
          
          start = today.toISOString();
          end = tomorrow.toISOString();
        }
        
        // Set defaults for optional fields
        const distance = scope3.distance || '1';
        const weight = scope3.weight || '1';
        const emissionFactor = scope3.emissionFactor || '0.1';
        // Map activity type to the correct category for Scope 3
        let category;
        switch(scope3.activityType) {
          case 'BUSINESS_TRAVEL':
            category = 'BUSINESS_TRAVEL';
            break;
          case 'EMPLOYEE_COMMUTING':
            category = 'EMPLOYEE_COMMUTING';
            break;
          case 'TRANSPORTATION':
            category = 'TRANSPORTATION_DISTRIBUTION';
            break;
          case 'WASTE':
            category = 'WASTE_GENERATED';
            break;
          default:
            category = 'TRANSPORTATION_DISTRIBUTION';
        }
        
        // Calculate emissions if not already done
        const emissions = scope3.emissions || 
          (parseFloat(distance) * parseFloat(weight) * parseFloat(emissionFactor)).toFixed(2);
        
        payload = {
          scope: 'SCOPE_3',
          category: category,
          timeFrame: 'CUSTOM',
          startDate: start,
          endDate: end,
          quantity: parseFloat(distance) * parseFloat(weight),
          unit: 'ton-km',
          emissionFactor: parseFloat(emissionFactor),
          emissionFactorUnit: 'kgCO2e/ton-km',
          emissions: parseFloat(emissions),
          activity: scope3.activityType,
          source: scope3.vehicleType || 'Generic',
          notes: `Distance: ${distance} km, Weight: ${weight} tons, Emissions: ${emissions} kgCO2e`,
          status: 'PENDING',
          calculationMethod: 'DISTANCE_BASED'
        };
      } else if (tab === 3) { // Solvent
        if (!solvent.name || !solvent.consumed || !solvent.startDate || !solvent.endDate) {
          throw new Error('Please fill all required Solvent fields, including start and end dates.');
        }
        const { start, end } = formatDatesForSubmission(solvent.startDate, solvent.endDate);
        // Calculate emissions if not provided
        const emissions = solvent.emissions || parseFloat(solvent.consumed).toFixed(2);
        
        payload = {
          scope: 'SOLVENT',
          category: 'PROCESS_EMISSIONS',
          timeFrame: 'CUSTOM',
          startDate: start,
          endDate: end,
          quantity: parseFloat(solvent.consumed),
          unit: 'liters',
          emissions: parseFloat(emissions),
          activity: 'SOLVENT_USE',
          source: solvent.name,
          notes: `Solvent: ${solvent.name}, Consumed: ${solvent.consumed} liters, Emissions equivalent: ${emissions} kgCO2e`,
          status: 'PENDING',
          calculationMethod: 'MASS_BALANCE'
        };
      } else if (tab === 4) { // Sink
        if (!sink.treeCount || !sink.startDate || !sink.endDate) {
          throw new Error('Please fill all required Sink fields, including start and end dates.');
        }
        const { start, end } = formatDatesForSubmission(sink.startDate, sink.endDate);
        // Calculate carbon sequestration (negative emissions)
        const sequestrationFactor = 21.77; // kgCO2e per tree per year
        const yearDiff = (new Date(sink.endDate) - new Date(sink.startDate)) / (1000 * 60 * 60 * 24 * 365.25);
        const emissions = -(parseInt(sink.treeCount, 10) * sequestrationFactor * Math.max(yearDiff, 1)).toFixed(2);
        
        payload = {
          scope: 'SINK',
          category: 'REFORESTATION',
          timeFrame: 'CUSTOM',
          startDate: start,
          endDate: end,
          quantity: parseInt(sink.treeCount, 10),
          unit: 'trees',
          emissionFactor: sequestrationFactor,
          emissionFactorUnit: 'kgCO2e/tree/year',
          emissions: parseFloat(emissions), // Negative value for carbon sequestration
          activity: 'REFORESTATION',
          source: sink.species || 'Mixed',
          notes: `Tree Count: ${sink.treeCount}, Species: ${sink.species || 'Not specified'}, Carbon Sequestration: ${Math.abs(emissions)} kgCO2e`,
          status: 'PENDING',
          calculationMethod: 'SEQUESTRATION_ESTIMATE'
        };
      }
      
      if (!payload) throw new Error('No emission data to submit.');
      
      console.log('Submitting GHG emission data:', JSON.stringify(payload, null, 2));
      
      // Removed unused scope mapping code
      // const scopeMap = {...};
      // const currentScope = scopeMap[tab];
      // Removed unused scopeDisplay variable
      
      // Add company object to the payload if available
      if (companyId) {
        payload.company = { id: companyId };
      }
      
      // Add submittedBy if user information is available
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        payload.submittedBy = { id: user.id };
      }
      
      // Log the final payload for debugging
      console.log('Final GHG emission payload:', JSON.stringify(payload, null, 2));
      
      const response = await submitGHGEmissionData(payload);
      console.log('GHG emission submission response:', response);
      
      // Check for error response
      if (response && response.data && response.data.error) {
        console.error('Server returned an error:', response.data);
        throw new Error(response.data.error + (response.data.message ? ': ' + response.data.message : ''));
      }
      
      if (response && (response.status === 200 || response.status === 201)) {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        // Reset the form sections
        setScope1({ activityType: '', fuelType: '', quantity: '', emissionFactor: '', startDate: null, endDate: null, emissions: '' });
        setScope2({ source: '', energyConsumed: '', emissionFactor: '', startDate: null, endDate: null, emissions: '' });
        setScope3({ activityType: '', vehicleType: '', fuelType: '', distance: '', weight: '', emissionFactor: '', startDate: null, endDate: null, emissions: '' });
        setSolvent({ name: '', consumed: '', recovered: '', loss: '', startDate: null, endDate: null });
        setSink({ treeCount: '', avgHeight: '', species: '', startDate: null, endDate: null, sequestration: '' });
      } else {
        const msg = response && response.data && response.data.message ? response.data.message : 'Submission failed. Please try again.';
        if (typeof onError === 'function') {
          onError(new Error(msg));
        }
      }
    } catch (error) {
      console.error('Failed to submit GHG emission data:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Create a more informative error message
        let errorMessage = `Server error: ${error.response.status}`;
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage += ` - ${error.response.data}`;
          } else if (error.response.data.message) {
            errorMessage += ` - ${error.response.data.message}`;
          } else if (error.response.data.error) {
            errorMessage += ` - ${error.response.data.error}`;
          }
        }
        
        // Call the error callback with the enhanced error
        if (typeof onError === 'function') {
          const enhancedError = new Error(errorMessage);
          enhancedError.details = error.response.data;
          enhancedError.status = error.response.status;
          onError(enhancedError);
        }
      } else {
        // For non-response errors, use the original error
        console.error('Error details:', {
          message: error.message,
          config: error.config?.url
        });
        if (typeof onError === 'function') {
          onError(error);
        }
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" color={GREEN} gutterBottom sx={{ mb: 3 }}>
        GHG Emissions Data Entry
      </Typography>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 4,
          '& .MuiTab-root': {
            minHeight: 48,
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            '&.Mui-selected': {
              color: GREEN
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: GREEN
          }
        }}
      >
        <Tab label="Scope 1 – Direct" {...a11yProps(0)} />
        <Tab label="Scope 2 – Indirect" {...a11yProps(1)} />
        <Tab label="Scope 3 – Value Chain" {...a11yProps(2)} />
        <Tab label="Solvent Data" {...a11yProps(3)} />
        <Tab label="GHG Sinks" {...a11yProps(4)} />
      </Tabs>

      {tab === 0 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={formSectionStyles}>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: GREEN }}>
              Scope 1 - Direct Emissions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    name="activityType"
                    value={scope1.activityType}
                    label="Activity Type"
                    onChange={handleScope1Change}
                    sx={{ height: '48px' }}
                  >
                    {scope1ActivityTypes.map(opt => (
                      <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Continue similar pattern for other form fields */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    name="fuelType"
                    value={scope1.fuelType}
                    label="Fuel Type"
                    onChange={handleScope1Change}
                    sx={{ height: '48px' }}
                  >
                    {fuelTypes.map(f => (
                      <MenuItem value={f} key={f}>{f}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Quantity Consumed"
                  name="quantity"
                  type="number"
                  value={scope1.quantity}
                  onChange={handleScope1Change}
                  fullWidth
                  required
                  InputProps={{ endAdornment: <span>liters/kg</span> }}
                  sx={inputFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Emission Factor"
                  name="emissionFactor"
                  type="number"
                  value={scope1.emissionFactor}
                  onChange={handleScope1Change}
                  fullWidth
                  required
                  InputProps={{ endAdornment: <span>kg CO₂e/unit</span> }}
                  sx={inputFieldStyles}
                />
              </Grid>

              {/* Date fields */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: GREEN, fontWeight: 600 }}>
                  Reporting Period
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={scope1.startDate}
                    onChange={val => handleDateChange('scope1', 'startDate', val)}
                    renderInput={params => 
                      <TextField {...params} fullWidth sx={inputFieldStyles} />
                    }
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={scope1.endDate}
                    onChange={val => handleDateChange('scope1', 'endDate', val)}
                    renderInput={params => 
                      <TextField {...params} fullWidth sx={inputFieldStyles} />
                    }
                  />
                </LocalizationProvider>
              </Grid>

              {/* Results section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Calculated Emissions
                </Typography>
                <Typography variant="h6" sx={{ color: GREEN, fontWeight: 'bold' }}>
                  {scope1.emissions ? `${scope1.emissions} kg CO₂e` : '0 kg CO₂e'}
                </Typography>
              </Grid>

              {/* Submit button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: GREEN,
                    height: '48px',
                    '&:hover': {
                      bgcolor: '#072607'
                    }
                  }}
                >
                  Submit Scope 1 Data
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={formSectionStyles}>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: GREEN }}>
              Scope 2 - Indirect Emissions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    name="source"
                    value={scope2.source}
                    label="Source"
                    onChange={handleScope2Change}
                    sx={{ height: '48px' }}
                  >
                    {scope2Sources.map(opt => (
                      <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Energy Consumed (kWh)"
                  name="energyConsumed"
                  type="number"
                  value={scope2.energyConsumed}
                  onChange={handleScope2Change}
                  fullWidth
                  required
                  sx={inputFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Emission Factor (kg CO₂e/kWh)"
                  name="emissionFactor"
                  type="number"
                  value={scope2.emissionFactor}
                  onChange={handleScope2Change}
                  fullWidth
                  required
                  sx={inputFieldStyles}
                />
              </Grid>

              {/* Date fields in their own section */}
              <Grid item xs={12}>
                <Box sx={reportingPeriodStyles}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: GREEN, fontWeight: 600 }}>
                    Reporting Period
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={scope2.startDate}
                          onChange={val => handleDateChange('scope2', 'startDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={scope2.endDate}
                          onChange={val => handleDateChange('scope2', 'endDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Results section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#f8faf8',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Calculated Emissions
                  </Typography>
                  <Typography variant="h6" color={GREEN} sx={{ mt: 1 }}>
                    {scope2.emissions || '0'} kg CO₂e
                  </Typography>
                </Box>
              </Grid>

              {/* Submit button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: GREEN,
                    height: '48px',
                    '&:hover': {
                      bgcolor: '#072607'
                    }
                  }}
                >
                  Submit Scope 2 Data
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {tab === 2 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={formSectionStyles}>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: GREEN }}>
              Scope 3 - Value Chain Emissions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    name="activityType"
                    value={scope3.activityType}
                    label="Activity Type"
                    onChange={handleScope3Change}
                    sx={{ height: '48px' }}
                  >
                    {scope3ActivityTypes.map(opt => (
                      <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    name="vehicleType"
                    value={scope3.vehicleType}
                    label="Vehicle Type"
                    onChange={handleScope3Change}
                    sx={{ height: '48px' }}
                  >
                    {scope3VehicleTypes.map(opt => (
                      <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    name="fuelType"
                    value={scope3.fuelType}
                    label="Fuel Type"
                    onChange={handleScope3Change}
                    sx={{ height: '48px' }}
                  >
                    {fuelTypes.map(f => (
                      <MenuItem value={f} key={f}>{f}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Distance (km)"
                  name="distance"
                  type="number"
                  value={scope3.distance}
                  onChange={handleScope3Change}
                  fullWidth
                  required
                  sx={inputFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={scope3.weight}
                  onChange={handleScope3Change}
                  fullWidth
                  required
                  sx={inputFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Emission Factor"
                  name="emissionFactor"
                  type="number"
                  value={scope3.emissionFactor}
                  onChange={handleScope3Change}
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <Box 
                        component="span" 
                        sx={{ 
                          position: 'absolute',
                          right: 8,
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                          pointerEvents: 'none'
                        }}
                      >
                        kg CO₂e/unit
                      </Box>
                    )
                  }}
                  sx={emissionFactorStyles}
                />
              </Grid>

      {/* Date fields in their own section */}
      <Grid item xs={12}>
                <Box sx={reportingPeriodStyles}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: GREEN, fontWeight: 600 }}>
                    Reporting Period
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={sink.startDate}
                          onChange={val => handleDateChange('sink', 'startDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={sink.endDate}
                          onChange={val => handleDateChange('sink', 'endDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>


              {/* Results section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#f8faf8',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Calculated Emissions
                  </Typography>
                  <Typography variant="h6" color={GREEN} sx={{ mt: 1 }}>
                    {scope3.emissions || '0'} kg CO₂e
                  </Typography>
                </Box>
              </Grid>

              {/* Submit button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: GREEN,
                    height: '48px',
                    '&:hover': {
                      bgcolor: '#072607'
                    }
                  }}
                >
                  Submit Scope 3 Data
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {tab === 3 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={formSectionStyles}>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: GREEN }}>
              Solvent Data
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Solvent Name</InputLabel>
                  <Select
                    name="name"
                    value={solvent.name}
                    label="Solvent Name"
                    onChange={handleSolventChange}
                    sx={{ height: '48px' }}
                  >
                    {solventNames.map(opt => (
                      <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Quantity Consumed (L)"
                  name="consumed"
                  type="number"
                  value={solvent.consumed}
                  onChange={handleSolventChange}
                  fullWidth
                  required
                  sx={inputFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Recovered (L)"
                  name="recovered"
                  type="number"
                  value={solvent.recovered}
                  onChange={handleSolventChange}
                  fullWidth
                  required
                  sx={inputFieldStyles}
                />
              </Grid>

              {/* Date fields in their own section */}
              <Grid item xs={12}>
                <Box sx={reportingPeriodStyles}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: GREEN, fontWeight: 600 }}>
                    Reporting Period
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={solvent.startDate}
                          onChange={val => handleDateChange('solvent', 'startDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={solvent.endDate}
                          onChange={val => handleDateChange('solvent', 'endDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Results section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#f8faf8',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Solvent Loss
                  </Typography>
                  <Typography variant="h6" color={GREEN} sx={{ mt: 1 }}>
                    {solvent.loss || '0'} L
                  </Typography>
                </Box>
              </Grid>

              {/* Submit button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: GREEN,
                    height: '48px',
                    '&:hover': {
                      bgcolor: '#072607'
                    }
                  }}
                >
                  Submit Solvent Data
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {tab === 4 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={formSectionStyles}>
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: GREEN }}>
              GHG Sinks
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Tree Count (Nos)"
                  name="treeCount"
                  type="number"
                  value={sink.treeCount}
                  onChange={handleSinkChange}
                  fullWidth
                  required
                  sx={inputFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Avg Height (m)"
                  name="avgHeight"
                  type="number"
                  value={sink.avgHeight}
                  onChange={handleSinkChange}
                  fullWidth
                  sx={inputFieldStyles}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Species</InputLabel>
                  <Select
                    name="species"
                    value={sink.species}
                    label="Species"
                    onChange={handleSinkChange}
                    sx={{ height: '48px' }}
                  >
                    {treeSpecies.map(opt => (
                      <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date fields in their own section */}
              <Grid item xs={12}>
                <Box sx={reportingPeriodStyles}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: GREEN, fontWeight: 600 }}>
                    Reporting Period
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={sink.startDate}
                          onChange={val => handleDateChange('sink', 'startDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="End Date"
                          value={sink.endDate}
                          onChange={val => handleDateChange('sink', 'endDate', val)}
                          renderInput={params => 
                            <TextField {...params} fullWidth sx={inputFieldStyles} />
                          }
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Results section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#f8faf8',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sequestration
                  </Typography>
                  <Typography variant="h6" color={GREEN} sx={{ mt: 1 }}>
                    {sink.sequestration || '0'} kg CO₂e
                  </Typography>
                </Box>
              </Grid>

              {/* Submit button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 2,
                    bgcolor: GREEN,
                    height: '48px',
                    '&:hover': {
                      bgcolor: '#072607'
                    }
                  }}
                >
                  Submit GHG Sink Data
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  );
};

GHGEmissionForm.propTypes = {
  companyId: PropTypes.any,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

export default GHGEmissionForm;
