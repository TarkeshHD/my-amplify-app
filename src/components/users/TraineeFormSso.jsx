import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useForm } from 'react-hook-form';
import { FormProvider } from '../hook-form';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';

const TraineeFormSso = ({ domains, departments }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const methods = useForm();
  const { control } = methods;

  useEffect(() => {
    setIsButtonDisabled(!selectedDomain || !selectedDepartment);
  }, [selectedDomain, selectedDepartment]);

  const handleGenerateInviteLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetchInviteLinkFromBackend(selectedDomain, selectedDepartment);
      setInviteLink(response.data.inviteLink);
    } catch (error) {
      console.error('Error fetching invite link:', error);
    }
    setIsLoading(false);
  };

  const fetchInviteLinkFromBackend = async (domainId, departmentId) => {
    // Replace with actual API call
    // For the purpose of this example, it's a simulated promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { inviteLink: 'https://yourbackend.com/invite?token=example123' } });
      }, 2000);
    });
  };

  const handleCopyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      // Optionally, show a notification that the link was copied
    }
  };

  return (
    <FormProvider methods={methods}>
      <Box sx={{ p: 3, pt: 0, width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Domain
        </Typography>
        <RHFAutocomplete
          name="domain"
          options={domains}
          control={control}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return option?.name || '';
          }}
          onChangeCustom={(value) => {
            setSelectedDomain(value?._id || '');
          }}
          fullWidth
          renderOption={(props, option) => <li {...props}>{option?.name}</li>}
        />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Department
        </Typography>
        <RHFAutocomplete
          name="department"
          options={departments}
          control={control}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return option?.name || '';
          }}
          onChangeCustom={(value) => {
            setSelectedDepartment(value?._id || '');
          }}
          fullWidth
          renderOption={(props, option) => <li {...props}>{option?.name}</li>}
        />
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            value={inviteLink}
            placeholder="Invite link will be generated with a 10-day expiration time."
            InputProps={{
              readOnly: true,
              startAdornment: isLoading && <CircularProgress size={20} />,
              endAdornment: inviteLink && (
                <IconButton onClick={handleCopyToClipboard}>
                  <ContentCopyIcon />
                </IconButton>
              ),
              style: {
                backgroundColor: isLoading || !inviteLink ? 'lightgrey' : 'white',
              },
            }}
            variant="outlined"
            margin="normal"
          />
          <Tooltip title={isButtonDisabled ? 'Select a domain and department to enable link generation' : ''} arrow>
            <span>
              {' '}
              {/* Tooltip children need to be able to accept ref */}
              <Button
                variant="contained"
                onClick={handleGenerateInviteLink}
                disabled={isButtonDisabled}
                sx={{
                  mt: 2,
                  backgroundColor: isButtonDisabled ? 'action.disabledBackground' : 'primary.main',
                  ':hover': {
                    backgroundColor: isButtonDisabled ? 'action.disabledBackground' : 'primary.dark',
                  },
                }}
              >
                Generate Invite Link
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default TraineeFormSso;
