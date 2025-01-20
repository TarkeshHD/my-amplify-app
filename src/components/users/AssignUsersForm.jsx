import React, { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Checkbox, List, ListItem, ListItemText, MenuItem, TextField } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';

const AssignUsersForm = ({ selectedUsers = [], closeAssignForm }) => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modulesData, setModulesData] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch modules on load
  useEffect(() => {
    const getModules = async () => {
      try {
        setFetchingData(true);
        const response = await axios.get('/module/all');
        const sortedData = [...(response.data?.details ?? [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setModulesData(sortedData);
      } catch (error) {
        toast.error(error.message || 'Failed to fetch modules');
        console.error(error);
      } finally {
        setFetchingData(false);
      }
    };

    getModules();
  }, []);

  const onSubmit = async () => {
    try {
      if (selectedModules.length === 0) {
        toast.error('Please select at least one module');
        return;
      }
      setIsSubmitting(true);

      const transformUsersToUsersAccess = (users) => {
        return users.map((user) => ({
          domainId: user?.domainId?._id || '',
          domainName: user?.domainId?.name || '',
          id: user._id || '',
          name: user.name || '',
          role: user.role || '',
          type: 'user', // Always 'user' as per Joi validation
          username: user.username || '',
        }));
      };

      const usersAccess = transformUsersToUsersAccess(selectedUsers);
      const reqBody = {
        usersAccess,
        modules: selectedModules,
      };

      await axios.post('/module/assign', reqBody);

      toast.success('Modules assigned successfully');
      closeAssignForm();

      //   navigate(0);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (module) => {
    setSelectedModules((prevSelected) =>
      prevSelected.some((m) => m === module._id)
        ? prevSelected.filter((m) => m !== module._id)
        : [...prevSelected, module._id],
    );
  };

  return (
    <>
      <Box sx={{ marginTop: 0 }}>
        {/* Module List */}
        <List
          sx={{
            height: 260,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              borderRadius: '10px',
              backgroundColor: '#d4d4d4',
            },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: '10px',
              backgroundColor: '#6e6e6e',
              height: '5px',
            },
          }}
        >
          {modulesData.map((module) => (
            <ListItem key={module._id} button onClick={() => handleCheckboxChange(module)}>
              <Checkbox edge="start" checked={selectedModules.includes(module._id)} />
              <ListItemText
                primary={module.name}
                secondary={`Created on: ${new Date(module.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Stack alignItems="flex-end" sx={{ mr: 1 }}>
        <LoadingButton onClick={onSubmit} type="submit" variant="contained" loading={isSubmitting}>
          Assign Modules
        </LoadingButton>
      </Stack>
    </>
  );
};

export default AssignUsersForm;
