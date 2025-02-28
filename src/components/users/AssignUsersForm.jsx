import React, { useEffect, useState, useCallback } from 'react';
import { LoadingButton } from '@mui/lab';
import { Checkbox, List, ListItem, ListItemText, MenuItem, TextField } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import _ from 'lodash';
import axios from '../../utils/axios';
import { useSharedData } from '../../hooks/useSharedData';

const AssignUsersForm = ({ selectedUsers = [], closeAssignForm }) => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const { modules: modulesData } = useSharedData();

  const [searchValue, setSearchValue] = useState('');
  const [searchedList, setSearchedList] = useState(modulesData);

  const handleDebounceSearch = (event) => {
    const queryList = modulesData.filter((module) =>
      module.name.toLowerCase().includes(event.target.value.toLowerCase()),
    );
    setSearchedList(queryList);
  };

  const debounceSearch = useCallback(_.debounce(handleDebounceSearch, 250), [modulesData]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    debounceSearch(event);
  };

  const onSubmit = async () => {
    try {
      if (selectedModules.length === 0) {
        toast.error('Please select at least one module');
        return;
      }
      setIsSubmitting(true);

      const transformUsersToUsersAccess = (users) =>
        users.map((user) => ({
          domainId: user?.domainId?._id || '',
          domainName: user?.domainId?.name || '',
          id: user._id || '',
          name: user.name || '',
          role: user.role || '',
          type: 'user', // Always 'user' as per Joi validation
          username: user.username || '',
        }));

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
      <Box>
        <TextField
          onChange={handleSearchChange}
          value={searchValue}
          name="search"
          label="Search"
          sx={{ width: '100%', mb: 2 }}
          placeholder="Search modules"
        />

        <List
          sx={{
            height: '260px',
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
          {searchedList.map((module) => (
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
