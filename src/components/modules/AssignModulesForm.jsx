import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
  TextField,
  List,
  ListItem,
  Checkbox,
  ListItemText,
} from '@mui/material';

import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from '../hook-form';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';
import axios from '../../utils/axios';
import { SeverityPill } from '../SeverityPill';

// ----------------------------------------------------------------------

AssignModulesForm.propTypes = {};

export default function AssignModulesForm({
  isEdit = false,
  moduleAccess,
  domains = [],
  departments = [],
  selectedModules = [],
  ...props
}) {
  const navigate = useNavigate();

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
    if (isEdit) {
      // Set checked list
      const checkedList = list.filter((v) => {
        if (v.type === 'domain') {
          return moduleAccess?.domains?.some((domainId) => domainId === v.id);
        }
        return moduleAccess?.departments?.some((domainId) => domainId === v.id);
      });
      console.log('CheckedList ', checkedList);
      setCheckedItems(checkedList);
    }
  }, []);

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Seperate Domain Access and Departemnt Access
      const domainsAccess = checkedItems.filter((v) => v.type === 'domain');
      const departmentsAccess = checkedItems.filter((v) => v.type === 'department');

      const reqObj = {
        modules: selectedModules,
        domainsAccess,
        departmentsAccess,
      };

      console.log('Request Object', reqObj);
      if (isEdit) {
        delete reqObj.modules;
        const response = await axios.post(`/module/assign/update/${selectedModules[0]}`, reqObj);
      } else {
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box>
          <Box
            sx={{
              display: 'grid',
              columnGap: 2,
              rowGap: 3,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)' }, // Add sm: 'repeat(2, 1fr)'  for two Fields in line
            }}
          >
            <TextField
              onChange={handleSearchChange}
              value={searchValue}
              name="search"
              label={'Search'}
              placeholder="Search"
            />

            {/* List of all domains, disabled and prefilled for Admin */}
            <Box sx={{ width: '100%', height: 300, bgcolor: 'background.paper', overflow: 'scroll' }}>
              <List>
                {searchedList.map((item) => (
                  <ListItem key={item.id} button onClick={() => handleCheckboxChange(item)}>
                    <Checkbox
                      edge="start"
                      checked={checkedItems.some((v) => v.id === item.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                    {item.type === 'domain' ? (
                      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                        <ListItemText primary={item.name} />
                        <SeverityPill color={'primary'}> Plant </SeverityPill>
                      </Box>
                    ) : (
                      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                        <ListItemText primary={item.name} secondary={item.domainName} />
                        <SeverityPill color={'error'}> Department </SeverityPill>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton onClick={onSubmit} type="submit" variant="contained" loading={isSubmitting}>
              Assign
            </LoadingButton>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}
