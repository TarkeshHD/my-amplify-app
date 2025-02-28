import { useState } from 'react';

// @mui
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Grid, Tab } from '@mui/material';

import { useAuth } from '../../hooks/useAuth';
import DeptUserAssignModulesForm from './DeptAssignModulesForm';
import DomainAssignModulesForm from './DomainAssignModulesForm';
import UserAssignModulesForm from './UserAssignModulesForm';

// ----------------------------------------------------------------------

AssignModulesForm.propTypes = {};

export default function AssignModulesForm({
  isEdit = false,
  moduleAccess,
  domains = [],
  departments = [],
  selectedModules = [],
  users = [],
  handleRefresh,
  setOpenAssignForm,
  ...props
}) {
  const { user } = useAuth();

  const [value, setValue] = useState(user?.role === 'productAdmin' || user?.role === 'superAdmin' ? '1' : '2');

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
                height: 460,

                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange}>
                  {(user?.role === 'productAdmin' || user?.role === 'superAdmin') && <Tab label="Domain" value="1" />}
                  {user?.role === 'productAdmin' && <Tab label="Department Access " value="2" />}
                  {user?.role === 'productAdmin' && <Tab label=" User Special Access " value="3" />}
                </TabList>
              </Box>

              {/* List of all domains, disabled and prefilled for Admin */}

              <TabPanel
                value="1"
                sx={{
                  padding: '0px',
                }}
              >
                <DomainAssignModulesForm
                  isEdit={isEdit}
                  moduleAccess={moduleAccess}
                  domains={domains}
                  selectedModules={selectedModules}
                  users={users}
                  handleRefresh={handleRefresh}
                  setOpenAssignForm={setOpenAssignForm}
                />
              </TabPanel>

              <TabPanel
                value="2"
                sx={{
                  padding: '0px',
                }}
              >
                <DeptUserAssignModulesForm
                  isEdit={isEdit}
                  moduleAccess={moduleAccess}
                  departments={departments}
                  selectedModules={selectedModules}
                  users={users}
                  handleRefresh={handleRefresh}
                  setOpenAssignForm={setOpenAssignForm}
                />
              </TabPanel>

              <TabPanel
                value="3"
                sx={{
                  padding: '0px',
                }}
              >
                <UserAssignModulesForm
                  isEdit={isEdit}
                  moduleAccess={moduleAccess}
                  selectedModules={selectedModules}
                  users={users}
                  handleRefresh={handleRefresh}
                  setOpenAssignForm={setOpenAssignForm}
                />
              </TabPanel>
            </Box>
          </TabContext>
        </Box>
      </Grid>
    </Grid>
  );
}
