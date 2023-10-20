import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { Upload, Add, CloseRounded } from '@mui/icons-material';
import { toast } from 'react-toastify';

import axios from '../utils/axios';
import { useAuth } from '../hooks/useAuth';
import CustomDialog from '../components/CustomDialog';
import { useConfig } from '../hooks/useConfig';
import { FileTable } from '../sections/knowledgeReps/FileTable';

import AddFileForm from '../components/knowledgeRep/AddFileForm';
import { FAKE_DATA } from '../components/knowledgeRep/fakeData';

const Page = () => {
  const [openFileUpload, setOpenFileUpload] = useState(false);
  const [fakeData, setFakeData] = useState(FAKE_DATA);

  const [workingDirectory, setWorkingDirectory] = useState([{ name: 'My Drive', index: 1 }]);

  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);

  const config = useConfig();
  const { data: configData } = config;

  const getDatas = async () => {
    try {
      // Fetch datas from backend
      //   const response = await axios.get('knowledgeRep/files/all');
      setData(fakeData);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getDatas();
  }, []);

  // Update new file to the fake data
  const updateNewFile = (newFile) => {
    // Get the name of the last directory in workingDirectory, if last directory is root add the value to root
    const lastDirectoryName = workingDirectory[workingDirectory.length - 1]?.name;
    if (lastDirectoryName === 'My Drive') setData((prevData) => [...prevData, newFile]);
    else {
      setFakeData((prevData) => {
        // Create a function to update items if the directory name matches
        const updateItems = (item) => {
          if (item.name === lastDirectoryName && item.type === 'Folder') {
            // Clone the item and add the newFile to its items, if the folder already  has items.
            return {
              ...item,
              items: [...(item.items || []), newFile],
            };
          }
          return item;
        };

        // Use map to update the data
        return fakeData.map(updateItems);
      });
    }
  };

  const moveWorkingDirectory = (newIndex) => {
    // To change the working directory.
    const newWorkingDirectory = workingDirectory.filter((item) => item.index <= newIndex);
    setWorkingDirectory(newWorkingDirectory);
  };

  const addWorkingDirectory = (newFolder) => {
    // To add a new folder to the working directory. and give it an index.
    setWorkingDirectory((prev) => [...prev, { name: newFolder, index: prev[prev.length - 1].index + 1 }]);
  };

  const getFiles = (folders, targetFolderName) => {
    // Get the files in the target folder, (Recursive function, when its called first, use fake ata as folders)
    if (targetFolderName === 'My Drive') return fakeData;

    for (const folder of folders) {
      // loop through the folders
      if (folder.name === targetFolderName) {
        return folder.items;
      } else if (folder.type === 'Folder' && folder.items && folder.items.length > 0) {
        // if not, and if it's a folder, and has items inside, call the function again with the items as folders
        const foundInSubfolder = getFiles(folder.items, targetFolderName);
        if (foundInSubfolder) {
          return foundInSubfolder;
        }
      }
    }
    return null; // Folder not found, for this function
  };

  useEffect(() => {
    // change data, whenevr new data is added to fake files or working directory is changed
    setData(getFiles(fakeData, workingDirectory[workingDirectory.length - 1].name));
  }, [workingDirectory, fakeData]);

  // Working directory button with ">" in between
  const workingDirectoryPath = workingDirectory.map((item, index) => (
    <React.Fragment key={item.index}>
      <Button
        variant="text"
        sx={{ maxWidth: '200px', display: 'inline !important' }}
        onClick={() => moveWorkingDirectory(item.index)}
      >
        {item.name}
      </Button>
      {/* if the index is last, no ">" sign after */}
      {index !== workingDirectory.length - 1 && (
        <Typography variant="subtitle1" sx={{ display: 'inline', mt: 5 }}>
          {'>'}
        </Typography>
      )}
    </React.Fragment>
  ));
  const { user } = useAuth();
  return (
    <>
      <Helmet>
        <title>Knowledge Repository | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Knowledge Repository</Typography>
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
                  setOpenFileUpload(true);
                }}
              >
                Add File
              </Button>
            </Stack>
          </Stack>
          <div>{workingDirectoryPath}</div>

          <FileTable items={data} fetchingData={fetchingData} addWorkingDirectory={addWorkingDirectory} />

          {/* ADD FILE */}
          <CustomDialog
            onClose={() => {
              setOpenFileUpload(false);
            }}
            open={openFileUpload}
            title={<>Add </>}
          >
            <AddFileForm user={user} updateNewFile={updateNewFile} setOpenFileUpload={setOpenFileUpload} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
