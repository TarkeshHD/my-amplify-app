import { LoadingButton } from '@mui/lab';
import { Checkbox, List, ListItem, ListItemText, TextField } from '@mui/material';
import { Box, Stack } from '@mui/system';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import InfoHover from '../InfoHover';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';

import { SeverityPill } from '../SeverityPill';

const DeptAssignModulesForm = ({
  isEdit = false,
  moduleAccess,
  departments = [],
  selectedModules = [],
  handleRefresh,
  setOpenAssignForm,
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
    // Generate render list out of departments
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

    setItemList(list);
    setSearchedList(list);
    let checkedList = [];
    if (isEdit) {
      checkedList = list.filter((v) => moduleAccess?.departments?.some((domainId) => domainId === v.id));

      // Set checked list
      setCheckedItems(checkedList);
    }
  }, []);

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Separate Department Access
      const departmentsAccess = checkedItems.filter((v) => v.type === 'department');

      const reqObj = {
        modules: selectedModules,
        departmentsAccess,
      };

      if (isEdit) {
        delete reqObj.modules;
        await axios.post(`/module/assign/update/special/${selectedModules[0]}`, reqObj);
      } else {
        delete reqObj.isSpecialAccess && delete reqObj.isDomainAccess;
        await axios.post('/module/assign', reqObj);
      }

      toast.success('Updated Successfully');
      handleRefresh();
      setOpenAssignForm(false);
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
                  <SeverityPill color={'error'}>{data?.labels?.department?.singular || 'department'}</SeverityPill>
                  <InfoHover title="" />
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

export default DeptAssignModulesForm;
