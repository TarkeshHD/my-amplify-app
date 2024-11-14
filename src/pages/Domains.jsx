import { Add, CloseRounded, Download, Upload } from '@mui/icons-material';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import CustomDialog from '../components/CustomDialog';
import { SearchBar } from '../components/SearchBar';
import DomainForm from '../components/domains/DomainForm';
import AdminForm from '../components/users/AdminForm';
import TraineeForm from '../components/users/TraineeForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { useSelection } from '../hooks/useSelection';
import { DomainsTable } from '../sections/domains/DomainsTable';
import axios from '../utils/axios';
import { applyPagination } from '../utils/utils';
import ImportUserDataForm from '../components/users/ImportUserDataForm';
import ImportDomainDataForm from '../components/domains/ImportDomainDataForm';

const Page = () => {
  const [openDomainForm, setOpenDomainForm] = useState(false);
  const [openImportDataForm, setOpenImportDataForm] = useState(false);

  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [flatDomains, setFlatDomains] = useState([]);

  const config = useConfig();
  const { data: configData } = config;

  const getDomainsTree = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/domain/tree');
      setData(response?.data?.details);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const getDomains = async () => {
    try {
      const response = await axios.get('/domain/all');
      setFlatDomains(response?.data?.details);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getDomains();
  }, []);
  useEffect(() => {
    getDomainsTree();
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
    getDomainsTree();
  };

  return (
    <>
      <Helmet>
        <title>{configData?.labels?.domain?.singular || 'Domain'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">{configData?.labels?.domain?.plural || 'Domains'}</Typography>
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
              {user?.role === 'superAdmin' ||
                (user?.role === 'productAdmin' && (
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Button
                      startIcon={
                        <SvgIcon fontSize="small">
                          <Add />
                        </SvgIcon>
                      }
                      variant="contained"
                      onClick={() => {
                        setOpenDomainForm(true);
                      }}
                    >
                      Add {configData?.labels?.domain?.singular || 'Domain'}
                    </Button>
                  </Stack>
                ))}
            </Stack>
          </Stack>

          <DomainsTable
            count={data.length}
            items={data}
            fetchingData={fetchingData}
            domains={flatDomains}
            handleRefresh={handleRefresh}
          />
          {/* ADD DOMAIN */}
          <CustomDialog
            onClose={() => {
              setOpenDomainForm(false);
            }}
            open={openDomainForm}
            title={<>Add {configData?.labels?.domain?.singular || 'Domain'}</>}
          >
            <DomainForm domains={flatDomains} />
          </CustomDialog>

          {/* Import Domain Data form */}
          <CustomDialog
            onClose={() => {
              setOpenImportDataForm(false);
            }}
            minWidth="60vw"
            open={openImportDataForm}
            title={<Typography variant="h5">Import Domain Data</Typography>}
          >
            <ImportDomainDataForm setOpenImportDataForm={setOpenImportDataForm} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
