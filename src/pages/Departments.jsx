/* eslint-disable react-hooks/exhaustive-deps */
import { Add, Upload } from '@mui/icons-material';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash';

import CustomDialog from '../components/CustomDialog';
import DepartmentForm from '../components/departments/DepartmentForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { DepartmentsTable } from '../sections/departments/DepartmentsTable';
import axios from '../utils/axios';
import ImportDepartmentDataForm from '../components/departments/ImportDepartmentDataForm';
import { useSharedData } from '../hooks/useSharedData';

const Page = () => {
  const [openDepartmentForm, setOpenDepartmentForm] = useState(false);
  const [openImportDataForm, setOpenImportDataForm] = useState(false);

  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const { domains } = useSharedData();

  const config = useConfig();
  const { data: configData } = config;

  const getDepartments = async (params) => {
    try {
      setFetchingData(true);
      const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
      const storedPageSize = storedSizes?.departments || 10;
      const queryParams = {
        page: params?.pageIndex ?? 1,
        limit: params?.pageSize ?? storedPageSize,
        sort: !isEmpty(params?.sorting) ? JSON.stringify(params?.sorting) : JSON.stringify({ createdAt: -1 }),
        filters: JSON.stringify(params?.filters),
      };
      const response = await axios.get('/department/all', { params: queryParams });
      setData(response?.data?.departments?.docs);
      setTotalDepartments(response?.data?.departments?.totalDocs);
    } catch (error) {
      toast.error(
        error.message || `Failed to fetch ${data?.labels?.department?.plural?.toLowerCase() || 'departments'}`,
      );
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    getDepartments();
  }, []);

  const { user } = useAuth();

  if (user?.role === 'user') {
    // page not found
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h3">Page Not found</Typography>
      </Box>
    );
  }

  const handleRefresh = () => {
    getDepartments();
  };

  const onCloseDepartmentForm = () => {
    setOpenDepartmentForm(false);
    handleRefresh();
  };

  return (
    <>
      <Helmet>
        <title>{configData?.labels?.department?.singular || 'Department'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">{configData?.labels?.department?.singular || 'Department'}</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenImportDataForm(true);
                }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <Upload />
                  </SvgIcon>
                }
              >
                Import
              </Button>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <Add />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => {
                  setOpenDepartmentForm(true);
                }}
              >
                Add {configData?.labels?.department?.singular || 'Department'}
              </Button>
            </Stack>
          </Stack>

          <DepartmentsTable
            count={totalDepartments}
            items={data}
            fetchingData={fetchingData}
            domains={domains}
            onUrlParamsChange={getDepartments}
            handleRefresh={handleRefresh}
          />

          {/* ADD DOMAIN */}
          <CustomDialog
            onClose={() => {
              setOpenDepartmentForm(false);
            }}
            open={openDepartmentForm}
            title={<>Add </>}
          >
            <DepartmentForm domains={domains} handleClose={onCloseDepartmentForm} />
          </CustomDialog>
          {/* Import Department Data form */}
          <CustomDialog
            onClose={() => {
              setOpenImportDataForm(false);
            }}
            minWidth="60vw"
            open={openImportDataForm}
            title={<Typography variant="h5">Import Department Data</Typography>}
          >
            <ImportDepartmentDataForm setOpenImportDataForm={setOpenImportDataForm} domains={domains} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
