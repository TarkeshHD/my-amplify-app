import PropTypes from 'prop-types';
import { useState } from 'react';

// @mui
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Grid, Tab } from '@mui/material';

import { useConfig } from '../../hooks/useConfig';

import { DeprecatedModuleForm } from './DeprecatedModuleForm';
import { JsonModuleForm } from './JsonModuleForm';

// ----------------------------------------------------------------------

ModuleForm.propTypes = {
  isEdit: PropTypes.bool,
  currentModule: PropTypes.object,
};

export default function ModuleForm({ isEdit, currentModule }) {
  const config = useConfig();
  const { data } = config;

  const [value, setValue] = useState(data?.features?.jsonLifecycleEvaluation?.state === 'on' ? '1' : '2');

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box>
          <TabContext value={value}>
            <Box
              sx={{
                padding: 1,
                width: '100%',
                paddingTop: 0,
                height: 'auto',

                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange}>
                  {data?.features?.jsonLifecycleEvaluation?.state === 'on' && <Tab label="Story Mode" value="1" />}
                  <Tab label="Deprecated " value="2" />
                </TabList>
              </Box>

              {/* List of all domains, disabled and prefilled for Admin */}

              <TabPanel
                value="1"
                sx={{
                  padding: '0px',
                  paddingTop: '20px',
                }}
              >
                <JsonModuleForm isEdit={isEdit} currentModule={currentModule} />
              </TabPanel>

              <TabPanel
                value="2"
                sx={{
                  padding: '0px',
                  paddingTop: '20px',
                }}
              >
                <DeprecatedModuleForm isEdit={isEdit} currentModule={currentModule} />
              </TabPanel>
            </Box>
          </TabContext>
        </Box>
      </Grid>
    </Grid>
  );
}
