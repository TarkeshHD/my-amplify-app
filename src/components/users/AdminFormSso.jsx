import React, { useEffect, useState } from 'react';
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
import { FormProvider, RHFTextField } from '../hook-form';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const AdminFormSso = ({ domains = [] }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [selectedDomains, setSelectedDomains] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config = useConfig();
  const { data } = config;

  const methods = useForm();
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(selectedDomains.length === 0);
  }, [selectedDomains]);

  const fetchInviteLinkFromBackend = async (domainIds) => {
    setIsLoading(true);
    // Replace with actual API call
    const response = await axios.post('/auth/create-invite-link', { role: 'admin', domainId: selectedDomains });

    // Simulating a fetch call with a timeout
    setTimeout(() => {
      setInviteLink(response.data?.details?.inviteLink);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Copied to clipboard');
    }
  };

  const onSubmit = (data) => {
    // Submit handler logic
  };

  return (
    <FormProvider methods={methods}>
      <Box sx={{ p: 3, pt: 0, width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {data?.labels?.domain?.singular || 'Domain'}
        </Typography>
        <RHFAutocomplete
          name="domain"
          options={[...domains]}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }
            return option?.name || '';
          }}
          onChangeCustom={(value) => {
            setSelectedDomains(value?._id || '');
          }}
          fullWidth // Make the autocomplete take the full width
          renderOption={(props, option) => <li {...props}>{option?.name}</li>}
        />
        <Box display="flex" flexDirection="column" alignItems="center">
          <TextField
            fullWidth
            value={inviteLink}
            placeholder="Invite link will be generated with a 5-day expiration time."
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">{isLoading && <CircularProgress size={20} />}</InputAdornment>
              ),
              endAdornment: inviteLink && (
                <IconButton onClick={handleCopyToClipboard} edge="end">
                  <ContentCopyIcon />
                </IconButton>
              ),
              style: {
                backgroundColor: isLoading || !inviteLink ? 'lightgrey' : 'white',
                fontStyle: !inviteLink ? 'italic' : 'normal',
              },
            }}
            variant="outlined"
            margin="normal"
          />
          <Tooltip title={isButtonDisabled ? 'Select a domain to enable link generation' : ''} arrow>
            <span>
              {' '}
              {/* Tooltip children need to be able to accept ref */}
              <Button
                variant="contained"
                onClick={fetchInviteLinkFromBackend}
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

export default AdminFormSso;
