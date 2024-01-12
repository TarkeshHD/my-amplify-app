import { LoadingButton } from '@mui/lab';
import { Checkbox, Collapse, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';

import axios from '../../utils/axios';

import { toast } from 'react-toastify';
import { SeverityPill } from '../SeverityPill';

const DomainAssignModulesForm = ({ isEdit = false, moduleAccess, domains = [], selectedModules = [], users = [] }) => {
  const config = useConfig();
  const { data } = config;
  const adminUsers = users.filter((user) => user.role === 'admin');

  const [open, setOpen] = React.useState(true);

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

    domains.map((domain) =>
      list.push({
        type: 'domain',
        name: domain.name,
        id: domain?._id?.toString(),
      }),
    );

    setItemList(list);
    setSearchedList(list);
    let checkedList = [];
    if (isEdit) {
      checkedList = list.filter((v) => {
        if (v.type === 'domain') {
          return moduleAccess?.domains?.some((domainId) => domainId === v.id);
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
      const domainsAccess = checkedItems.filter((v) => v.type === 'domain');
      const departmentsAccess = [];
      const usersAccess = [];

      const reqObj = {
        modules: selectedModules,
        domainsAccess,
      };
      if (isEdit) {
        delete reqObj.modules;
        console.log(reqObj);
        const response = await axios.post(`/module/assign/update/domain/${selectedModules[0]}`, reqObj);
      } else {
        delete reqObj.isSpecialAccess && delete reqObj.isDomainAccess;
        const response = await axios.post('/module/assign', reqObj);
      }

      toast.success('Updated Successfully');
      navigate(0);
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

        {/* List of all domains, disabled and prefilled for Admin */}
        <List
          sx={{
            marginTop: '20px',
            marginBottom: '5px',
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
            <>
              <Box>
                <ListItem
                  key={item.id}
                  button
                  onClick={() => {
                    handleCheckboxChange(item);
                    setOpen(!open);
                  }}
                  // sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridAutoFlow: 'row' }}
                >
                  <Checkbox
                    edge="start"
                    checked={checkedItems.some((v) => v.id === item.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                    {item.type === 'domain' && (
                      <>
                        <ListItemText primary={item.name} />
                        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                          <SeverityPill color={'primary'} textAlign={'left'}>
                            {data?.labels?.domain?.singular || 'Domain'}{' '}
                          </SeverityPill>
                        </Box>
                      </>
                    )}
                  </Box>
                </ListItem>
              </Box>
              {checkedItems.some((v) => v.id === item.id) && (
                <Collapse in={true} timeout="auto" unmountOnExit sx={{ marginLeft: '25px' }}>
                  <List component="div" disablePadding>
                    {adminUsers.map(
                      (adminUser) =>
                        // Check if adminUser's domainId matches the current item's domainId
                        adminUser.domainId._id === item.id && (
                          <ListItemButton sx={{ pl: 3 }}>
                            <Checkbox checked={true} disabled={true} />
                            <ListItem key={adminUser.id}>
                              <Typography
                                variant="body2"
                                color="textPrimary"
                                sx={{ fontSize: '12px', marginLeft: '-20px', marginRight: '-40px' }}
                                padding={0}
                              >
                                {adminUser.name}{' '}
                              </Typography>
                            </ListItem>
                          </ListItemButton>
                        ),
                    )}
                  </List>
                </Collapse>
              )}
            </>
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

export default DomainAssignModulesForm;
