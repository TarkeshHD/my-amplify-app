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

const UserAssignModulesForm = ({
  isEdit = false,
  moduleAccess,
  handleRefresh,
  selectedModules = [],
  setOpenAssignForm,
}) => {
  const config = useConfig();
  const { data } = config;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [searchedList, setSearchedList] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [checkedItems, setCheckedItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);

  const getUsers = async (params) => {
    try {
      const queryParams = {
        page: params?.pageIndex ?? 1,
        limit: params?.pageSize ?? 10,
        sort: JSON.stringify(params?.sorting) ?? JSON.stringify({ createdAt: -1 }),
        filters: JSON.stringify(params?.filters),
        search: params?.search,
      };

      const response = await axios.get('/user/all', { params: queryParams });
      setUsers((prevUsers) => {
        if (params?.search) {
          return response?.data?.users?.docs;
        }
        return [...prevUsers, ...response?.data?.users?.docs];
      });
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
      console.log(error);
    }
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setPageIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    getUsers({ pageIndex });
  }, [pageIndex]);

  const updateList = () => {
    const list = [];
    users.map((user) => {
      if (user?.role !== 'user') {
        return;
      }
      if (!list.some((existingUser) => existingUser.id === user?._id?.toString())) {
        list.push({
          role: user?.role,
          type: 'user',
          name: user.name,
          id: user?._id?.toString(),
          domainId: user?.domainId?._id,
          domainName: user?.domainId?.name,
          username: user?.username,
        });
      }
    });

    setItemList(list);
    setSearchedList(list);
    let checkedList = [];
    if (isEdit) {
      checkedList = list.filter((v) => moduleAccess?.users?.some((userId) => userId === v.id));

      // Set checked list
      setCheckedItems(checkedList);
    }
  };

  useEffect(() => {
    updateList();
  }, [users]);

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const usersAccess = checkedItems.filter(
        (v) => v.type === 'user' || v.type === 'admin' || v.type === 'superAdmin',
      );

      const reqObj = {
        modules: selectedModules,
        usersAccess,
      };

      if (isEdit) {
        delete reqObj.modules;
        await axios.post(`/module/assign/update/special/${selectedModules[0]}`, reqObj);
      } else {
        delete reqObj.isSpecialAccess && delete reqObj.isDomainAccess;
        await axios.post('/module/assign', reqObj);
      }

      toast.success('Updated Successfully');
      setOpenAssignForm(false);
      handleRefresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const debounceSearch = useCallback(_.debounce(getUsers, 250), [itemList]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    debounceSearch({ search: event.target.value });
    setPageIndex(1);
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
          onScroll={handleScroll}
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
                  <SeverityPill color={'success'}>{data?.labels?.user?.singular || 'User'}</SeverityPill>
                  <InfoHover title="" disabled={true} />
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

export default UserAssignModulesForm;
