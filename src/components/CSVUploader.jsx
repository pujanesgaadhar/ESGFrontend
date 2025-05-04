import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Link
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { uploadCSVFile } from '../services/api';

const CSVUploader = ({ companyId, onSuccess, onError }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [emissionScope, setEmissionScope] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        setFile(null);
        setFileName('');
        setPreview([]);
        return;
      }
      
      setError('');
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Read and preview the CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\\n');
        const previewLines = lines.slice(0, 5); // Show first 5 lines as preview
        setPreview(previewLines);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleScopeChange = (event) => {
    setEmissionScope(event.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!emissionScope) {
      setError('Please select an emission scope');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scope', emissionScope);
      formData.append('companyId', companyId);

      const response = await uploadCSVFile(formData);
      
      setUploading(false);
      setFile(null);
      setFileName('');
      setPreview([]);
      setEmissionScope('');
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      setUploading(false);
      setError(error.message || 'Failed to upload file');
      
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#FFFFFF' }}>
      <Typography component="h2" variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
        Upload GHG Emissions CSV
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Upload your GHG emissions data in CSV format. Please ensure your CSV file follows the template structure.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Download template for:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            component={Link}
            href="/templates/scope1_template.csv"
            download
            sx={{ 
              borderColor: '#9DC183', 
              color: '#0A3D0A',
              '&:hover': { borderColor: '#0A3D0A', backgroundColor: '#F9FFF9' }
            }}
          >
            Scope 1
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            component={Link}
            href="/templates/scope2_template.csv"
            download
            sx={{ 
              borderColor: '#9DC183', 
              color: '#0A3D0A',
              '&:hover': { borderColor: '#0A3D0A', backgroundColor: '#F9FFF9' }
            }}
          >
            Scope 2
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            component={Link}
            href="/templates/scope3_template.csv"
            download
            sx={{ 
              borderColor: '#9DC183', 
              color: '#0A3D0A',
              '&:hover': { borderColor: '#0A3D0A', backgroundColor: '#F9FFF9' }
            }}
          >
            Scope 3
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            component={Link}
            href="/templates/solvent_template.csv"
            download
            sx={{ 
              borderColor: '#9DC183', 
              color: '#0A3D0A',
              '&:hover': { borderColor: '#0A3D0A', backgroundColor: '#F9FFF9' }
            }}
          >
            Solvent
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            component={Link}
            href="/templates/sink_template.csv"
            download
            sx={{ 
              borderColor: '#9DC183', 
              color: '#0A3D0A',
              '&:hover': { borderColor: '#0A3D0A', backgroundColor: '#F9FFF9' }
            }}
          >
            Sink
          </Button>
        </Box>
      </Box>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="emission-scope-label">Emission Scope</InputLabel>
        <Select
          labelId="emission-scope-label"
          value={emissionScope}
          label="Emission Scope"
          onChange={handleScopeChange}
        >
          <MenuItem value="SCOPE_1">Scope 1</MenuItem>
          <MenuItem value="SCOPE_2">Scope 2</MenuItem>
          <MenuItem value="SCOPE_3">Scope 3</MenuItem>
          <MenuItem value="SOLVENT">Solvent</MenuItem>
          <MenuItem value="SINK">Sink</MenuItem>
        </Select>
      </FormControl>
      
      <Box
        sx={{
          border: '2px dashed #9DC183',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          mb: 3,
          backgroundColor: '#F9FFF9'
        }}
      >
        <input
          type="file"
          accept=".csv"
          id="csv-upload"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label htmlFor="csv-upload">
          <Button
            component="span"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{
              mb: 2,
              background: 'linear-gradient(45deg, #0A3D0A, #2E7D32)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2E7D32, #0A3D0A)',
              }
            }}
          >
            Select CSV File
          </Button>
        </label>
        
        <Typography variant="body2" color="textSecondary">
          {fileName ? `Selected file: ${fileName}` : 'No file selected'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {preview.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: '#2E7D32', fontWeight: 'bold' }}>
            Preview:
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              maxHeight: '200px', 
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#F5F5F5'
            }}
          >
            {preview.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </Paper>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading || !emissionScope}
          sx={{
            background: 'linear-gradient(45deg, #0A3D0A, #2E7D32)',
            '&:hover': {
              background: 'linear-gradient(45deg, #2E7D32, #0A3D0A)',
            }
          }}
        >
          {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload and Submit'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CSVUploader;
