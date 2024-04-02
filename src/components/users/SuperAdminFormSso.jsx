import React, { useState } from 'react';
import { Button, TextField, Box, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const SuperAdminFormSso = () => {
  const [inviteLink, setInviteLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInviteLink = async () => {
    setIsLoading(true);
    // This is where you'd call your backend API to get the invite link
    const response = await axios.post('/auth/create-invite-link', { role: 'superAdmin' });
    // Simulating a fetch call with a timeout
    setTimeout(() => {
      setInviteLink(response.data?.details?.inviteLink);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      // Add notification logic if needed
      toast.success('Copied to clipboard');
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <TextField
        fullWidth
        value={inviteLink}
        placeholder="Invite link will be generated with a 3-day expiration time."
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">{isLoading && <CircularProgress size={20} />}</InputAdornment>
          ),
          endAdornment: inviteLink && (
            <IconButton onClick={handleCopyToClipboard} edge="end" sx={{ cursor: 'pointer' }}>
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
      <Button variant="contained" onClick={handleGenerateInviteLink} disabled={isLoading} sx={{ mt: 2 }}>
        Generate Invite Link
      </Button>
    </Box>
  );
};

export default SuperAdminFormSso;
