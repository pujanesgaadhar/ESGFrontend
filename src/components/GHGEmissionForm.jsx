import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Paper,
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

const GREEN = '#0A3D0A';
const LIGHT_GREEN = '#9DC183';

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


const GHGEmissionForm = ({ companyId, onSuccess, onError }) => {
  const [tab, setTab] = useState(0);

  // Individual state for each form section
  const [scope1, setScope1] = useState({
    activityType: '',
    fuelType: '',
    quantity: '',
    emissionFactor: '',
    month: null,
    emissions: '',
  });
  const [scope2, setScope2] = useState({
    source: '',
    energyConsumed: '',
    emissionFactor: '',
    month: null,
    emissions: '',
  });
  const [scope3, setScope3] = useState({
    activityType: '',
    vehicleType: '',
    fuelType: '',
    distance: '',
    weight: '',
    emissionFactor: '',
    month: null,
    emissions: '',
  });
  const [solvent, setSolvent] = useState({
    name: '',
    consumed: '',
    recovered: '',
    loss: '',
    month: null,
  });
  const [sink, setSink] = useState({
    treeCount: '',
    avgHeight: '',
    species: '',
    month: null,
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
  const handleDateChange = (section, value) => {
    if (section === 'scope1') setScope1({ ...scope1, month: value });
    if (section === 'scope2') setScope2({ ...scope2, month: value });
    if (section === 'scope3') setScope3({ ...scope3, month: value });
    if (section === 'solvent') setSolvent({ ...solvent, month: value });
    if (section === 'sink') setSink({ ...sink, month: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let payload = null;
      // Helper to get first/last day of month
      const getMonthRange = (date) => {
        if (!date) return { start: null, end: null };
        const d = new Date(date);
        const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        return { start: start.toISOString(), end: end.toISOString() };
      };

      if (tab === 0) { // Scope 1
        if (!scope1.activityType || !scope1.quantity || !scope1.emissionFactor || !scope1.month) {
          throw new Error('Please fill all required Scope 1 fields.');
        }
        const { start, end } = getMonthRange(scope1.month);
        payload = {
          company: { id: companyId },
          scope: 'SCOPE_1',
          category: scope1.activityType === 'FUEL_COMBUSTION' ? 'STATIONARY_COMBUSTION' : (scope1.activityType === 'PROCESS_EMISSIONS' ? 'PROCESS_EMISSIONS' : 'MOBILE_COMBUSTION'),
          timeFrame: 'MONTHLY',
          startDate: start,
          endDate: end,
          quantity: parseFloat(scope1.quantity),
          unit: 'liters', // Adjust as needed
          emissionFactor: parseFloat(scope1.emissionFactor),
          emissionFactorUnit: 'kgCO2e/liter', // Adjust as needed
          notes: '',
        };
      } else if (tab === 1) { // Scope 2
        if (!scope2.source || !scope2.energyConsumed || !scope2.emissionFactor || !scope2.month) {
          throw new Error('Please fill all required Scope 2 fields.');
        }
        const { start, end } = getMonthRange(scope2.month);
        payload = {
          company: { id: companyId },
          scope: 'SCOPE_2',
          category: scope2.source === 'Grid' ? 'PURCHASED_ELECTRICITY' : 'PURCHASED_STEAM',
          timeFrame: 'MONTHLY',
          startDate: start,
          endDate: end,
          quantity: parseFloat(scope2.energyConsumed),
          unit: 'kWh', // Adjust as needed
          emissionFactor: parseFloat(scope2.emissionFactor),
          emissionFactorUnit: 'kgCO2e/kWh', // Adjust as needed
          notes: '',
        };
      } else if (tab === 2) { // Scope 3
        if (!scope3.activityType || !scope3.distance || !scope3.weight || !scope3.emissionFactor || !scope3.month) {
          throw new Error('Please fill all required Scope 3 fields.');
        }
        const { start, end } = getMonthRange(scope3.month);
        payload = {
          company: { id: companyId },
          scope: 'SCOPE_3',
          category: 'TRANSPORTATION_DISTRIBUTION', // Example, adjust mapping as needed
          timeFrame: 'MONTHLY',
          startDate: start,
          endDate: end,
          quantity: parseFloat(scope3.distance) * parseFloat(scope3.weight),
          unit: 'ton-km', // Adjust as needed
          emissionFactor: parseFloat(scope3.emissionFactor),
          emissionFactorUnit: 'kgCO2e/ton-km', // Adjust as needed
          notes: '',
        };
      } else if (tab === 3) { // Solvent
        if (!solvent.name || !solvent.consumed || !solvent.month) {
          throw new Error('Please fill all required Solvent fields.');
        }
        const { start, end } = getMonthRange(solvent.month);
        payload = {
          company: { id: companyId },
          scope: 'SCOPE_1', // Or other, depending on your backend
          category: 'PROCESS_EMISSIONS',
          timeFrame: 'MONTHLY',
          startDate: start,
          endDate: end,
          quantity: parseFloat(solvent.consumed),
          unit: 'kg', // Adjust as needed
          emissionFactor: 0, // If available
          emissionFactorUnit: '',
          notes: `Recovered: ${solvent.recovered}, Loss: ${solvent.loss}`,
        };
      } else if (tab === 4) { // Sink
        if (!sink.treeCount || !sink.month) {
          throw new Error('Please fill all required Sink fields.');
        }
        const { start, end } = getMonthRange(sink.month);
        payload = {
          company: { id: companyId },
          scope: 'SCOPE_1', // Sinks are often reported separately, adjust as needed
          category: 'FUGITIVE_EMISSIONS', // Or another appropriate category
          timeFrame: 'MONTHLY',
          startDate: start,
          endDate: end,
          quantity: parseInt(sink.treeCount, 10),
          unit: 'trees',
          emissionFactor: 21.77, // sequestration per tree
          emissionFactorUnit: 'kgCO2e/tree/year',
          notes: `Species: ${sink.species}, Avg Height: ${sink.avgHeight}`,
        };
      }
      if (!payload) throw new Error('No emission data to submit.');
      const response = await submitGHGEmissionData(payload);
      if (response && (response.status === 200 || response.status === 201)) {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        // Reset the form sections
        setScope1({ activityType: '', fuelType: '', quantity: '', emissionFactor: '', month: null, emissions: '' });
        setScope2({ source: '', energyConsumed: '', emissionFactor: '', month: null, emissions: '' });
        setScope3({ activityType: '', vehicleType: '', fuelType: '', distance: '', weight: '', emissionFactor: '', month: null, emissions: '' });
        setSolvent({ name: '', consumed: '', recovered: '', loss: '', month: null });
        setSink({ treeCount: '', avgHeight: '', species: '', month: null, sequestration: '' });
      } else {
        const msg = response && response.data && response.data.message ? response.data.message : 'Submission failed. Please try again.';
        if (typeof onError === 'function') {
          onError(new Error(msg));
        }
      }
    } catch (error) {
      console.error('Failed to submit GHG emission data:', error);
      if (typeof onError === 'function') {
        onError(error);
      }
    }
  };

  return (
    <Paper sx={{ p: 3, background: LIGHT_GREEN + '10', borderRadius: 3 }}>
      <Typography variant="h5" color={GREEN} gutterBottom>
        GHG Emissions Data Entry
      </Typography>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Scope 1 – Direct" {...a11yProps(0)} />
        <Tab label="Scope 2 – Indirect" {...a11yProps(1)} />
        <Tab label="Scope 3 – Value Chain" {...a11yProps(2)} />
        <Tab label="Solvent Data" {...a11yProps(3)} />
        <Tab label="GHG Sinks" {...a11yProps(4)} />
      </Tabs>
      {/* Scope 1 */}
      {tab === 0 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  name="activityType"
                  value={scope1.activityType}
                  label="Activity Type"
                  onChange={handleScope1Change}
                >
                  {scope1ActivityTypes.map(opt => (
                    <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  name="fuelType"
                  value={scope1.fuelType}
                  label="Fuel Type"
                  onChange={handleScope1Change}
                >
                  {fuelTypes.map(f => (
                    <MenuItem value={f} key={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Quantity Consumed"
                name="quantity"
                type="number"
                value={scope1.quantity}
                onChange={handleScope1Change}
                fullWidth
                required
                InputProps={{ endAdornment: <span>liters/kg</span> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Emission Factor"
                name="emissionFactor"
                type="number"
                value={scope1.emissionFactor}
                onChange={handleScope1Change}
                fullWidth
                required
                InputProps={{ endAdornment: <span>kg CO₂e/unit</span> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Month/Year"
                  views={["year", "month"]}
                  value={scope1.month}
                  onChange={val => handleDateChange('scope1', val)}
                  renderInput={params => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ background: GREEN }}>
                Submit Scope 1 Data
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {/* Scope 2 */}
      {tab === 1 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={scope2.source}
                  label="Source"
                  onChange={handleScope2Change}
                >
                  {scope2Sources.map(opt => (
                    <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Energy Consumed (kWh)"
                name="energyConsumed"
                type="number"
                value={scope2.energyConsumed}
                onChange={handleScope2Change}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Emission Factor (kg CO₂e/kWh)"
                name="emissionFactor"
                type="number"
                value={scope2.emissionFactor}
                onChange={handleScope2Change}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Month/Year"
                  views={["year", "month"]}
                  value={scope2.month}
                  onChange={val => handleDateChange('scope2', val)}
                  renderInput={params => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ mt: 1 }}>
                <strong>Emissions (kg CO₂e):</strong> {scope2.emissions || '--'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ background: GREEN }}>
                Submit Scope 2 Data
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {/* Scope 3 */}
      {tab === 2 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  name="activityType"
                  value={scope3.activityType}
                  label="Activity Type"
                  onChange={handleScope3Change}
                >
                  {scope3ActivityTypes.map(opt => (
                    <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  name="vehicleType"
                  value={scope3.vehicleType}
                  label="Vehicle Type"
                  onChange={handleScope3Change}
                >
                  {scope3VehicleTypes.map(opt => (
                    <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  name="fuelType"
                  value={scope3.fuelType}
                  label="Fuel Type"
                  onChange={handleScope3Change}
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
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={scope3.weight}
                onChange={handleScope3Change}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Emission Factor"
                name="emissionFactor"
                type="number"
                value={scope3.emissionFactor}
                onChange={handleScope3Change}
                fullWidth
                required
                InputProps={{ endAdornment: <span>kg CO₂e/(km·kg)</span> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Month/Year"
                  views={["year", "month"]}
                  value={scope3.month}
                  onChange={val => handleDateChange('scope3', val)}
                  renderInput={params => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ mt: 1 }}>
                <strong>Emissions (kg CO₂e):</strong> {scope3.emissions || '--'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ background: GREEN }}>
                Submit Scope 3 Data
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {/* Solvent */}
      {tab === 3 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Solvent Name</InputLabel>
                <Select
                  name="name"
                  value={solvent.name}
                  label="Solvent Name"
                  onChange={handleSolventChange}
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
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Month/Year"
                  views={["year", "month"]}
                  value={solvent.month}
                  onChange={val => handleDateChange('solvent', val)}
                  renderInput={params => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography sx={{ mt: 1 }}>
                <strong>Solvent Loss (L):</strong> {solvent.loss || '--'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ background: GREEN }}>
                Submit Solvent Data
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {/* GHG Sinks */}
      {tab === 4 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Tree Count (Nos)"
                name="treeCount"
                type="number"
                value={sink.treeCount}
                onChange={handleSinkChange}
                fullWidth
                required
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
                >
                  {treeSpecies.map(opt => (
                    <MenuItem value={opt} key={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Month/Year"
                  views={["year", "month"]}
                  value={sink.month}
                  onChange={val => handleDateChange('sink', val)}
                  renderInput={params => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ mt: 1 }}>
                <strong>Sequestration (kg CO₂e):</strong> {sink.sequestration || '--'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ background: GREEN }}>
                Submit GHG Sink Data
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

GHGEmissionForm.propTypes = {
  companyId: PropTypes.any,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

export default GHGEmissionForm;
