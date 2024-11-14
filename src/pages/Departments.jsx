/* eslint-disable react-hooks/exhaustive-deps */
import { Add, Upload } from '@mui/icons-material';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import CustomDialog from '../components/CustomDialog';
import DepartmentForm from '../components/departments/DepartmentForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { DepartmentsTable } from '../sections/departments/DepartmentsTable';
import axios from '../utils/axios';
import ImportDepartmentDataForm from '../components/departments/ImportDepartmentDataForm';

const Page = () => {
  const [openDepartmentForm, setOpenDepartmentForm] = useState(false);
  const [openImportDataForm, setOpenImportDataForm] = useState(false);

  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [domains, setDomains] = useState([]);

  const config = useConfig();
  const { data: configData } = config;

  const getDepartments = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/department/all');
      setData(response?.data?.details);
    } catch (error) {
      toast.error(
        error.message || `Failed to fetch ${data?.labels?.department?.plural?.toLowerCase() || 'departments'}`,
      );
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const getDomains = async () => {
    try {
      const response = await axios.get('/domain/all');

      setDomains(response?.data?.details);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getDomains();
  }, []);
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
            count={data.length}
            items={data}
            fetchingData={fetchingData}
            domains={domains}
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
            <ImportDepartmentDataForm setOpenImportDataForm={setOpenImportDataForm} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
