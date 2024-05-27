import { Download } from '@mui/icons-material';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { ArchiveTable } from '../sections/archive/ArchiveTable';
import axios from '../utils/axios';
const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);

  const config = useConfig();
  const { data: configData } = config;
  const { user } = useAuth();
  const [totalItems, setTotalItems] = useState(0);

  const filterValues = (response) => {
    const keysWithoutId = [];
    const keysWithId = [];
    const responseData = response?.data?.details;
    setTotalItems(responseData?.totalItems || 0);

    Object.keys(responseData?.items[0]).forEach((key) => {
      if (key.toLowerCase().includes('id')) {
        keysWithId.push(key);
      } else {
        keysWithoutId.push(key);
      }
    });

    // Concatenate arrays with desired order
    const sortedKeys = [...keysWithoutId, ...keysWithId];

    // Arrange data based on sorted keys
    const filteredData = responseData?.items?.map((obj) =>
      Object.fromEntries(sortedKeys.map((key) => [key, obj[key]])),
    );

    // Extract headers from the first object in the filtered array
    const headerVal = Object.keys(filteredData[0]);

    return [filteredData, headerVal];
  };

  const getData = async (pageIndex) => {
    try {
      setFetchingData(true);
      const response = await axios.get(`/archive?page=${pageIndex}`);

      const [filteredData, headerVal] = filterValues(response);

      setData(filteredData);
      setHeaders(headerVal);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const exportBtnFalse = () => {
    setExportBtnClicked(false);
  };

  useEffect(() => {
    getData(0);
  }, []);

  const handlePaginationChange = async (pagination) => {
    await getData(pagination.pageIndex);
  };

  return (
    <>
      <Helmet>
        <title>Archive | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Archive</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                onClick={() => {
                  setExportBtnClicked(true);
                }}
                variant="outlined"
                startIcon={
                  <SvgIcon fontSize="small">
                    <Download />
                  </SvgIcon>
                }
              >
                Export
              </Button>
            </Stack>
          </Stack>

          {/* Change this to archive table */}
          <ArchiveTable
            fetchingData={fetchingData}
            items={data}
            count={data.length}
            exportBtnClicked={exportBtnClicked}
            exportBtnFalse={exportBtnFalse}
            headers={headers}
            totalItems={totalItems}
            queryPageChange={handlePaginationChange}
          />
        </Stack>
      </Container>
    </>
  );
};

export default Page;
