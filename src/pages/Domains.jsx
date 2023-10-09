import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { Download, Upload, Add, CloseRounded } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelection } from '../hooks/useSelection';
import { applyPagination } from '../utils/utils';
import { SearchBar } from '../components/SearchBar';
import axios from '../utils/axios';
import { useAuth } from '../hooks/useAuth';
import CustomDialog from '../components/CustomDialog';
import AdminForm from '../components/users/AdminForm';
import TraineeForm from '../components/users/TraineeForm';
import { DomainsTable } from '../sections/domains/DomainsTable';
import DomainForm from '../components/domains/DomainForm';
import { useConfig } from '../hooks/useConfig';

const Page = () => {
  const [openDomainForm, setOpenDomainForm] = useState(false);

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
          </Stack>

          <DomainsTable count={data.length} items={data} fetchingData={fetchingData} />
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
        </Stack>
      </Container>
    </>
  );
};

export default Page;
