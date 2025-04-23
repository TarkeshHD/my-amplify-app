import { useState, useEffect, useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import {
  LinearProgress,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { HourglassFull, People, Sensors, Verified, ViewInAr } from '@mui/icons-material';
import _ from 'lodash';
import axios from '../../utils/axios';
import { DashboardDiffCard } from '../../sections/dashboard/DashboardDiffCard';
import { useConfig } from '../../hooks/useConfig';
import { useSharedData } from '../../hooks/useSharedData';

const ModuleAnalytics = () => {
  const config = useConfig();
  const { data: configData } = config;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTop, setShowTop] = useState(true);
  const [sessionType, setSessionType] = useState('evaluation');
  const [columnFilters, setColumnFilters] = useState([]);
  const { modules } = useSharedData();
  console.log('modules', modules);
  const [selectedModule, setSelectedModule] = useState(modules?.[0] || { id: 'NA', name: 'NA' });
  console.log('selected modules', selectedModule);

  const getSessionTypes = useMemo(() => {
    const types = [];
    if (configData?.features?.training?.state === 'on') {
      types.push({ value: 'training', label: 'Training Sessions' });
    }
    if (configData?.features?.evaluation?.state === 'on') {
      types.push({ value: 'evaluation', label: 'Evaluation Sessions' });
    }
    return types;
  }, [configData]);

  useEffect(() => {
    if (getSessionTypes.length > 0 && !getSessionTypes.find((t) => t.value === sessionType)) {
      setSessionType(getSessionTypes[0].value);
    }
  }, [getSessionTypes, sessionType]);

  const tableData = useMemo(() => {
    try {
      if (!data?.[sessionType]?.data?.length) return [];

      let filteredData = data[sessionType]?.data?.map((module) => ({
        ...module,
        completionPercentage: parseFloat(module?.completionPercentage || 0),
        passedPercentage: module?.passedPercentage === 'NaN' ? 0 : parseFloat(module?.passedPercentage || 0),
      }));

      if (columnFilters.length > 0) {
        filteredData = filteredData.filter((row) =>
          columnFilters.every((filter) => {
            if (filter?.id === 'name' && Array.isArray(filter?.value)) {
              return filter.value.includes(row?.name);
            }
            return true;
          }),
        );
      }

      // Sort based on completion percentage
      const sortedData = filteredData.sort((a, b) =>
        showTop
          ? parseFloat(b?.completionPercentage || 0) - parseFloat(a?.completionPercentage || 0)
          : parseFloat(a?.completionPercentage || 0) - parseFloat(b?.completionPercentage || 0),
      );

      // Return top 5 if filtered data is more than 5
      return sortedData;
    } catch (error) {
      console.error('Error processing table data:', error);
      return [];
    }
  }, [data, showTop, sessionType, columnFilters]);

  const columns = useMemo(() => {
    try {
      const domainName = data?.[sessionType]?.data?.length
        ? [...new Set(data[sessionType].data.map((item) => item?.name))]
        : [];

      const list = [
        {
          accessorKey: 'name',
          header: 'Domain Name',
          size: 300,
          filterVariant: 'multi-select',
          filterSelectOptions: domainName,
        },
        {
          accessorKey: 'totalDomainUsers',
          header: 'Users Added',
          size: 120,
          enableColumnFilter: false,
        },
        {
          accessorKey: 'completedUniqueUsers',
          header: 'Users attempted',
          size: 120,
          enableColumnFilter: false,
        },
        {
          accessorKey: 'completionPercentage',
          header: 'Completion Rate',
          size: 250,
          enableColumnFilter: false,
          Cell: ({ cell }) => {
            const value = parseFloat(cell?.getValue?.() || 0);
            let color = 'error.main';
            if (value >= 80) {
              color = 'success.main';
            } else if (value >= 50) {
              color = 'warning.main';
            }
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{ height: 10, borderRadius: 5 }}
                    color={color.includes('success') ? 'success' : (color.includes('warning') && 'warning') || 'error'}
                  />
                </Box>
                <Typography variant="body2">{`${Number(value)?.toFixed(2)}%`}</Typography>
              </Box>
            );
          },
        },
      ];

      // if (sessionType === 'evaluation') {
      //   list.push({
      //     accessorKey: 'passedPercentage',
      //     header: 'Pass Rate',
      //     size: 250,
      //     enableColumnFilter: false,
      //     Cell: ({ cell }) => {
      //       const value = parseFloat(cell?.getValue?.() || 0);
      //       let color = 'error.main';
      //       if (value >= 80) {
      //         color = 'success.main';
      //       } else if (value >= 50) {
      //         color = 'warning.main';
      //       }
      //       return (
      //         <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
      //           <Box sx={{ width: '100%' }}>
      //             <LinearProgress
      //               variant="determinate"
      //               value={value}
      //               sx={{ height: 10, borderRadius: 5 }}
      //               color={color.includes('success') ? 'success' : (color.includes('warning') && 'warning') || 'error'}
      //             />
      //           </Box>
      //           <Typography variant="body2">{`${Number(value)?.toFixed(2)}%`}</Typography>
      //         </Box>
      //       );
      //     },
      //     hidden: sessionType === 'training',
      //   });
      // }
      return list;
    } catch (error) {
      console.error('Error processing columns:', error);
      return [];
    }
  }, [sessionType, data]);

  const getStats = useMemo(() => {
    try {
      const defaultStats = {
        totalModules: 0,
        activeModules: 0,
        totalSessions: 0,
        uniqueParticipants: 0,
        passPercentage: 0,
        completionPercentage: 0,
      };

      if (!data?.stats) return defaultStats;

      return {
        totalModules: data?.stats?.totalModules || 0,
        activeModules: data?.stats?.activeModules || 0,
        totalSessions: data?.stats?.totalSessions || 0,
        uniqueParticipants: data?.stats?.uniqueParticipants || 0,
        passPercentage: parseFloat(data?.[sessionType]?.overall?.passPercentage || 0),
        completionPercentage: parseFloat(data?.[sessionType]?.overall?.completionPercentage || 0),
      };
    } catch (error) {
      console.error('Error processing stats:', error);
    }
  }, [data, sessionType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/analytic/modules${selectedModule?.id !== 'all' ? `?moduleId=${selectedModule?.id}` : ''}`);
      if (response?.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedModule?.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2 }}>
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6} md={4}>
            <DashboardDiffCard
              title="Total Modules"
              value={getStats?.totalModules}
              icon={<ViewInAr />}
              info="Total number of modules available"
              iconColor="#0000ffc7"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DashboardDiffCard
              title="Total sessions"
              icon={<Sensors />}
              iconColor="#612baf"
              value={getStats?.totalSessions}
              info={`Total number of sessions completed for ${selectedModule?.id !== 'all' ? `${selectedModule?.name} module` : "All modules"}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DashboardDiffCard
              title="Unique participants"
              icon={<People />}
              iconColor="primary.main"
              value={getStats?.uniqueParticipants}
              info={`Total number of unique participants for ${selectedModule?.id !== 'all' ? `${selectedModule?.name} module` : "All modules"}`}
            />
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                {getSessionTypes.length > 1 && (
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Session Type</InputLabel>
                    <Select value={sessionType} label="Session Type" onChange={(e) => setSessionType(e.target.value)}>
                      {getSessionTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Module Name</InputLabel>
                  <Select
                    value={selectedModule?.id || ''}
                    label="Domain Name"
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        setSelectedModule({ id: 'all', name: 'All Modules' });
                      } else {
                        const module = modules.find((d) => d._id === e.target.value);
                        setSelectedModule({ id: module._id, name: module.name });
                      }
                    }}
                  >
                    {modules.map((module) => (
                      <MenuItem key={module.name} value={module._id}>
                        {module.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <ToggleButtonGroup
                value={showTop}
                exclusive
                onChange={(_, value) => value !== null && setShowTop(value)}
                size="small"
              >
                <ToggleButton value>
                  <TrendingUpIcon sx={{ mr: 1 }} /> Top Performing
                </ToggleButton>
                <ToggleButton value={false}>
                  <TrendingDownIcon sx={{ mr: 1 }} /> Needs Attention
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <MaterialReactTable
              columns={columns}
              data={tableData}
              enableTopToolbar={false}
              enableColumnActions={false}
              enableColumnFilters
              muiTablePaginationProps={{
                rowsPerPageOptions: [5, 10, 20],
              }}
              initialState={{
                columnFilters: [],
                showColumnFilters: true,
                pagination: {
                  pageIndex: 0,
                  pageSize: 5
                }
              }}
              onColumnFiltersChange={setColumnFilters}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: '100%',
              justifyContent: 'flex-start',
              pt: { xs: 0, md: 5 },
            }}
          >
            {/* {sessionType === 'evaluation' && (
              <DashboardDiffCard
                title="Pass percentage"
                icon={<Verified />}
                iconColor="green"
                value={getStats?.passPercentage}
                suffix="%"
              />
            )} */}
            <DashboardDiffCard
              title="Completion percentage"
              value={getStats?.completionPercentage}
              icon={<HourglassFull />}
              iconColor={'orange'}
              suffix="%"
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModuleAnalytics;
