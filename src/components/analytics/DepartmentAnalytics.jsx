import { useState, useEffect, useMemo, useContext } from 'react';
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
import {
  Check,
  Groups,
  HourglassFull,
  ImportContacts,
  InvertColorsRounded,
  Mode,
  People,
  Sensors,
  Verified,
} from '@mui/icons-material';
import _ from 'lodash';
import axios from '../../utils/axios';
import { DashboardDiffCard } from '../../sections/dashboard/DashboardDiffCard';
import { useConfig } from '../../hooks/useConfig';
import { useSharedData } from '../../hooks/useSharedData';

const DepartmentAnalytics = () => {
  const config = useConfig();
  const { data: configData } = config;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTop, setShowTop] = useState(true);
  const [sessionType, setSessionType] = useState('evaluation');
  const [columnFilters, setColumnFilters] = useState([]);
  const { domains, departments } = useSharedData();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState({ getAllDept: true, id: 'all', name: 'All Departments' });

  const filteredDepartments = useMemo(() => {
    return departments?.filter((dept) => dept.domainId?._id === selectedDomain?.id) || [];
  }, [departments, selectedDomain]);

  useEffect(() => {
    if (domains?.length && departments?.length && !selectedDomain) {
      const defaultDomain = domains[0];
      setSelectedDomain({ id: defaultDomain._id, name: defaultDomain.name });

      const depts = departments.filter((dept) => dept.domainId?._id === defaultDomain._id);
      if (depts.length > 0) {
        setSelectedDepartment({ getAllDept: true, id: 'all', name: 'All Departments' })
      }
    }
  }, [domains, departments]);

  const tableData = useMemo(() => {
    try {
      if (!data?.modules?.[sessionType]?.length) return [];

      let filteredData = data?.modules?.[sessionType]?.map((module) => ({
        ...module,
        completionPercentage: parseFloat(module?.completionPercentage || 0),
      }));

      if (columnFilters.length > 0) {
        filteredData = filteredData.filter((row) =>
          columnFilters.every((filter) => {
            if (filter?.id === 'moduleName' && Array.isArray(filter?.value)) {
              return filter.value.includes(row?.moduleName);
            }
            return true;
          }),
        );
      }

      const sortedData = filteredData.sort((a, b) =>
        showTop
          ? parseFloat(b?.completionPercentage || 0) - parseFloat(a?.completionPercentage || 0)
          : parseFloat(a?.completionPercentage || 0) - parseFloat(b?.completionPercentage || 0),
      );

      return sortedData.length > 5 ? sortedData.slice(0, 5) : sortedData;
    } catch (error) {
      console.error('Error processing table data:', error);
      return [];
    }
  }, [data, showTop, sessionType, columnFilters]);

  const columns = useMemo(() => {
    const moduleNameList = data?.modules?.[sessionType]
      ? data?.modules?.[sessionType].map((item) => item.moduleName)
      : [];

    const list = [
      {
        accessorKey: 'moduleName',
        header: 'Module Name',
        size: 300,
        filterVariant: 'multi-select',
        filterSelectOptions: moduleNameList,
      },
      {
        accessorKey: 'totalDepartmentUsers',
        header: 'Users added',
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
          const value = cell.getValue();
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

    return list;
  }, [sessionType, data]);

  const getStats = useMemo(() => {
    try {
      const defaultStats = {
        totalDepartments: 0,
        activeDepartments: 0,
        totalSessions: 0,
        uniqueParticipants: 0,
        totalDepartmentSessions: 0,
        departmentSessionsCompletedPercentage: 0,
      };

      if (!data?.stats) return defaultStats;

      return {
        totalDepartments: data?.stats?.totalDepartments || 0,
        activeDepartments: data?.stats?.activeDepartments || 0,
        totalSessions: data?.stats?.totalSessions || 0,
        uniqueParticipants: data?.stats?.uniqueParticipants || 0,
        totalDepartmentSessions: parseFloat(data?.stats?.[sessionType]?.totalSessions || 0),
        departmentSessionsCompletedPercentage: parseFloat(data?.stats?.[sessionType]?.completionPercentage || 0),
      };
    } catch (error) {
      console.error('Error processing stats:', error);
    }
  }, [data, sessionType]);

  const fetchData = async () => {
    try {
      if (!selectedDomain?.id) return;

      setLoading(true);
      const params = new URLSearchParams();
      params.append('domainId', selectedDomain.id);
      if (selectedDepartment?.id) {
        params.append('departmentId', selectedDepartment.id);
        params.append('getAllDept', selectedDepartment.getAllDept);
      }

      const response = await axios.get(`/analytic/departments?${params.toString()}`);
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

  const getSessionTypes = useMemo(() => {
    const types = [];
    if (configData?.features?.training?.state === 'on') {
      types.push({ value: 'trainings', label: 'Training Sessions' });
    }
    if (configData?.features?.evaluation?.state === 'on') {
      types.push({ value: 'evaluations', label: 'Evaluation Sessions' });
    }
    return types;
  }, [configData]);

  useEffect(() => {
    if (getSessionTypes.length > 0 && !getSessionTypes.find((t) => t.value === sessionType)) {
      setSessionType(getSessionTypes[0].value);
    }
  }, [getSessionTypes, sessionType]);

  useEffect(() => {
    if (selectedDomain?.id) {
      const depts = departments?.filter((dept) => dept.domainId?._id === selectedDomain.id) || [];
      if (!selectedDepartment && depts.length > 0) {
        setSelectedDepartment({ getAllDept: true, id: 'all', name: 'All Departments' });
      } else if (selectedDepartment) {
        const deptExists = depts.some((dept) => dept._id === selectedDepartment.id);
        if (!deptExists) {
          setSelectedDepartment(depts.length > 0 ? { getAllDept: true, id: 'all', name: 'All Departments' } : null);
        }
      }
      fetchData();
    }
  }, [selectedDomain?.id, departments]);

  useEffect(() => {
    if (selectedDepartment?.id) {
      fetchData();
    }
  }, [selectedDepartment?.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Overall Department Analytics
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardDiffCard
              title="Total Departments"
              value={getStats.totalDepartments}
              icon={<Groups />}
              info="Total number of departments available"
              iconColor="#0000ffc7"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardDiffCard
              title="Total sessions"
              icon={<Sensors />}
              iconColor="#612baf"
              value={getStats.totalSessions}
              info="Total number of sessions completed"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardDiffCard
              title="Unique participants"
              icon={<People />}
              iconColor="primary.main"
              value={getStats.uniqueParticipants}
              info="Total number of unique participants"
            />
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          pt: 2,
          mb: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {selectedDepartment?.name || 'Department'} Analytics
        </Typography>
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
                  <InputLabel>Domain Name</InputLabel>
                  <Select
                    value={selectedDomain?.id || ''}
                    label="Domain Name"
                    onChange={(e) => {
                      const domain = domains.find((d) => d._id === e.target.value);

                      setSelectedDomain({ id: domain._id, name: domain.name });
                    }}
                  >
                    {domains.map((domain) => (
                      <MenuItem key={domain.name} value={domain._id}>
                        {domain.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedDepartment?.id || ''}
                    label="Department"
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        setSelectedDepartment({ getAllDept: true, id: 'all', name: 'All Departments' });
                      } else {
                        const department = filteredDepartments?.find((d) => d._id === e.target.value);
                        setSelectedDepartment(department ? { id: department._id, name: department.name } : null);
                      }
                    }}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {filteredDepartments?.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* <ToggleButtonGroup
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
              </ToggleButtonGroup> */}
            </Box>
            <MaterialReactTable
              columns={columns}
              data={tableData}
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enablePagination={false}
              enableColumnActions={false}
              enableColumnFilters
              initialState={{
                columnFilters: [],
                showColumnFilters: true,
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
            <DashboardDiffCard
              title="Total sessions"
              icon={<Verified />}
              iconColor="green"
              value={getStats?.totalDepartmentSessions}
              suffix="%"
              info={`${selectedDepartment?.name || 'Department'} - ${sessionType} sessions completed`}
            />
            <DashboardDiffCard
              title="Session Completion percentage"
              value={getStats?.departmentSessionsCompletedPercentage}
              icon={<HourglassFull />}
              iconColor={'orange'}
              suffix="%"
              info={`${selectedDepartment?.name || 'Department'} - ${sessionType} sessions completion %`}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepartmentAnalytics;
