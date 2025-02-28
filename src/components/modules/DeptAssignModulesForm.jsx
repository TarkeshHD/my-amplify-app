import InfoHover from '../InfoHover';

import { LoadingButton } from '@mui/lab';
import { Checkbox, List, ListItem, ListItemText, TextField } from '@mui/material';
import { Box, Stack } from '@mui/system';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';

import axios from '../../utils/axios';

import { toast } from 'react-toastify';
import { SeverityPill } from '../SeverityPill';

const DeptUserAssignModulesForm = ({
  isEdit = false,
  moduleAccess,
  departments = [],
  selectedModules = [],
  users = [],
}) => {
  const config = useConfig();
  const { data } = config;

  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemList, setItemList] = useState([]);
  const [searchedList, setSearchedList] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [checkedItems, setCheckedItems] = useState([]);

  useEffect(() => {
    // Generate render list out of domains and departments
    const list = [];

    departments.map((department) =>
      list.push({
        type: 'department',
        name: department.name,
        id: department?._id?.toString(),
        domainId: department?.domainId?._id,
        domainName: department?.domainId?.name,
      }),
    );

    users.map((user) => {
      if (user?.role !== 'user') {
        return;
      }
      list.push({
        role: user?.role,
        type: 'user',
        name: user.name,
        id: user?._id?.toString(),
        domainId: user?.domainId?._id,
        domainName: user?.domainId?.name,
        username: user?.username,
      });
    });

    setItemList(list);
    setSearchedList(list);
    let checkedList = [];
    if (isEdit) {
      checkedList = list.filter((v) => {
        if (v.type === 'department') {
          return moduleAccess?.departments?.some((domainId) => domainId === v.id);
        } else {
          return moduleAccess?.users?.some((userId) => userId === v.id);
        }
      });

      // Set checked list

      setCheckedItems(checkedList);
    }
  }, []);

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Seperate Domain Access and Departemnt Access
      const domainsAccess = [];
      const departmentsAccess = checkedItems.filter((v) => v.type === 'department');
      const usersAccess = checkedItems.filter(
        (v) => v.type === 'user' || v.type === 'admin' || v.type === 'superAdmin',
      );

      const reqObj = {
        modules: selectedModules,
        departmentsAccess,
        usersAccess,
      };

      if (isEdit) {
        delete reqObj.modules;
        const response = await axios.post(`/module/assign/update/special/${selectedModules[0]}`, reqObj);
      } else {
        delete reqObj.isSpecialAccess && delete reqObj.isDomainAccess;
        const response = await axios.post('/module/assign', reqObj);
      }

      toast.success('Updated Successfully');
      // navigate(0);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDebounceSearch = (event) => {
    const queryList = itemList.filter(
      (item) =>
        item.name.toLowerCase().includes(event.target.value.toLowerCase()) ||
        item?.domainName?.toLowerCase().includes(event.target.value.toLowerCase()),
    );

    setSearchedList(queryList);
  };

  const debounceSearch = useCallback(_.debounce(handleDebounceSearch, 250), [itemList]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    debounceSearch(event);
  };

  const handleCheckboxChange = (item) => {
    setCheckedItems((prevCheckedItems) =>
      prevCheckedItems.some((v) => v.id === item.id)
        ? prevCheckedItems.filter((v) => v.id !== item.id)
        : [...prevCheckedItems, item],
    );
  };

  return (
    <>
      <Box
        sx={{
          marginTop: 3,
          // display: 'grid',
          // columnGap: 2,
          // rowGap: 3,
          // gridTemplateColumns: { xs: 'repeat(1, 1fr)' }, // Add sm: 'repeat(2, 1fr)'  for two Fields in line
        }}
      >
        <TextField
          onChange={handleSearchChange}
          value={searchValue}
          name="search"
          label={'Search'}
          sx={{ width: '100%' }}
          placeholder="Search"
        />

        <List
          sx={{
            marginTop: '20px',
            marginBottom: '15px',
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
          {searchedList.map((item) => (
            <ListItem key={item.id} button onClick={() => handleCheckboxChange(item)}>
              <Checkbox edge="start" checked={checkedItems.some((v) => v.id === item.id)} tabIndex={-1} disableRipple />
              <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                <>
                  <ListItemText primary={item.name} secondary={item.domainName} />
                  {item.type === 'department' ? (
                    <>
                      <SeverityPill color={'error'}>{data?.labels?.department?.singular || 'department'}</SeverityPill>
                      <InfoHover
                        title={users
                          .filter((user) => user?.departmentId?._id == item?.id)
                          .map((value) => value.name)
                          .join(', ')}
                      />
                    </>
                  ) : (
                    <>
                      <SeverityPill color={'success'}>{data?.labels?.user?.singular || 'User'}</SeverityPill>
                      <InfoHover title="" disabled={true} />
                    </>
                  )}
                </>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <Stack alignItems="flex-end" sx={{ mr: 1 }}>
        <LoadingButton onClick={onSubmit} type="submit" variant="contained" loading={isSubmitting}>
          Assign
        </LoadingButton>
      </Stack>
    </>
  );
};

export default DeptUserAssignModulesForm;
