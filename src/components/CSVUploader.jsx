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
  Link,
  IconButton
} from '@mui/material';
// Removed unused import
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
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

  const handleClearFile = () => {
    setFile(null);
    setFileName('');
    setPreview([]);
    setError('');
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
    
    // Ensure companyId is available
    if (!companyId) {
      setError('Company ID is missing. Please contact support.');
      console.error('CSVUploader: companyId prop is undefined or null');
      return;
    }
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }
    
    // Validate CSV structure by checking headers
    try {
      const reader = new FileReader();
      const headerPromise = new Promise((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const lines = content.split('\n');
            if (lines.length < 2) {
              reject(new Error('CSV file must contain at least a header row and one data row'));
              return;
            }
            
            const headers = lines[0].split(',');
            const requiredHeaders = ['Start Date', 'End Date', 'Category', 'Quantity', 'Unit'];
            
            for (const required of requiredHeaders) {
              const found = headers.some(h => h.trim().toLowerCase() === required.toLowerCase());
              if (!found) {
                reject(new Error(`CSV file is missing required header: ${required}`));
                return;
              }
            }
            
            resolve(true);
          } catch (err) {
            reject(new Error('Failed to parse CSV file: ' + err.message));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read CSV file'));
        reader.readAsText(file);
      });
      
      await headerPromise;
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scope', emissionScope);
      
      // Get current user's company ID from localStorage if not provided as prop
      const effectiveCompanyId = companyId || JSON.parse(localStorage.getItem('user'))?.company?.id;
      
      if (!effectiveCompanyId) {
        throw new Error('Company ID is missing. Please log out and log in again.');
      }
      
      formData.append('companyId', effectiveCompanyId);
      console.log(`Using company ID: ${effectiveCompanyId} for CSV upload`);

      console.log(`Uploading ${file.name} (${file.size} bytes) with scope ${emissionScope}`);
      const response = await uploadCSVFile(formData);
      console.log('Upload successful:', response.data);
      
      setUploading(false);
      setFile(null);
      setFileName('');
      setPreview([]);
      setEmissionScope('');
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      
      // Extract more detailed error message if available
      let errorMessage = 'Failed to upload file';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
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
      
      <FormControl 
        fullWidth 
        sx={{ 
          mb: { xs: 1.5, sm: 2 },
          '& .MuiInputLabel-root': {
            fontSize: { xs: '0.9rem', sm: '1rem' }
          },
          '& .MuiSelect-select': {
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }
        }}
      >
        <InputLabel id="emission-scope-label">Emission Scope</InputLabel>
        <Select
          labelId="emission-scope-label"
          value={emissionScope}
          onChange={(e) => setEmissionScope(e.target.value)}
          label="Emission Scope"
        >
          <MenuItem value="SCOPE_1">Scope 1</MenuItem>
          <MenuItem value="SCOPE_2">Scope 2</MenuItem>
          <MenuItem value="SCOPE_3">Scope 3</MenuItem>
          <MenuItem value="SOLVENT">Solvent</MenuItem>
          <MenuItem value="SINK">Sink</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Button
          variant="contained"
          component="label"
          size="medium"
          sx={{
            backgroundColor: '#0A3D0A',
            '&:hover': { backgroundColor: '#0A5D0A' },
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            py: { xs: 1, sm: 1.2 },
            textTransform: 'none',
            fontWeight: 'medium',
            borderRadius: '4px'
          }}
        >
          Select File
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={handleFileChange}
          />
        </Button>
      </Box>
      
      {fileName && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: { xs: 1.5, sm: 2 },
          p: { xs: 1, sm: 1.5 },
          borderRadius: '4px',
          bgcolor: '#f5f9f5',
          border: '1px solid #e0e0e0',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <InsertDriveFileIcon sx={{ 
            mr: { xs: 0.5, sm: 1 }, 
            color: '#0A3D0A',
            fontSize: { xs: '1.2rem', sm: '1.4rem' }
          }} />
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {fileName}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleClearFile} 
            sx={{ ml: { xs: 0.5, sm: 1 } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            '& .MuiAlert-icon': {
              fontSize: { xs: '1.2rem', sm: '1.4rem' }
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      {preview.length > 0 && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              color: '#0A3D0A',
              fontWeight: 'medium'
            }}
          >
            Preview:
          </Typography>
          <Paper 
            elevation={1}
            sx={{ 
              p: { xs: 1, sm: 1.5 }, 
              maxHeight: '200px', 
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              whiteSpace: 'pre-wrap',
              backgroundColor: '#F5F5F5'
            }}
          >
            {preview.map((line, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 0.5, 
                  p: 0.5, 
                  borderBottom: index < preview.length - 1 ? '1px dashed #e0e0e0' : 'none'
                }}
              >
                {line}
              </Box>
            ))}
          </Paper>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || !emissionScope || uploading}
          fullWidth
          sx={{
            backgroundColor: '#0A3D0A',
            '&:hover': { backgroundColor: '#0A5D0A' },
            py: { xs: 1, sm: 1.2 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            textTransform: 'none',
            fontWeight: 'medium',
            borderRadius: '4px',
            maxWidth: { xs: '100%', sm: '300px' },
            mt: { xs: 1, sm: 0 }
          }}
        >
          {uploading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Upload CSV'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default CSVUploader;
