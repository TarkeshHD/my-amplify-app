import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Grid, Stack, SvgIcon, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { read, utils, writeFile } from 'xlsx';
import { FormProvider } from '../hook-form';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';
import { toast } from 'react-toastify';

import DownloadIcon from '@mui/icons-material/Download';
import { LoadingButton } from '@mui/lab';

import ExcelJS from 'exceljs';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../hooks/useConfig';

const expectedValues = ['Name', 'Employee Code', 'Domain', 'Department'];

const ImportDataForm = ({ setOpenImportDataForm }) => {
  const navigate = useNavigate();
  const [sendFiles, setSendFiles] = useState([]);
  const methods = useForm({});
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const config = useConfig();
  const { data } = config;
  if (data?.features?.traineeType?.state === 'on' && !expectedValues.includes('Trainee Type')) {
    expectedValues.push('Trainee Type');
  }

  const handleDrop = useCallback(
    (acceptedFiles, name) => {
      const file = acceptedFiles[0];

      if (file) {
        if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          toast.error('Please upload a valid .xlsx file. File type is not .xlsx');
          return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const lastCell = sheet['!ref'].split(':').pop();
          // Extract the headers from 'A1' to the last cell in the first row
          const headersRange = 'A1:' + lastCell;
          // Extract headers using the specified range
          const headers = utils.sheet_to_json(sheet, {
            range: headersRange,
            header: 1, // Treat the first row as headers
          })[0];
          // Sort the arrays for comparison
          const sortedArrayToCheck = headers.slice().sort();
          const sortedExpectedValues = expectedValues.slice().sort();

          // Check if the sorted arrays are equal
          const arraysMatch = JSON.stringify(sortedExpectedValues) === JSON.stringify(sortedArrayToCheck);
          //   Check if all the expected headers are present
          if (!arraysMatch) {
            console.log('Error from error match');
            toast.error('Please upload a valid .xlsx format. Headers are in the wrong order/format');
            return;
          }
          // Define the range for data rows, starting from the first row
          const dataRange = 'A1:' + lastCell;
          // Extract data rows using the specified range
          const dataRows = utils.sheet_to_json(sheet, {
            range: dataRange,
          });

          //   Check all the required fields are present
          for (const row of dataRows) {
            if (
              !row.Name ||
              !row['Employee Code'] ||
              !row.Domain ||
              !row.Department ||
              (data?.features?.traineeType?.state === 'on' && !row['Trainee Type'])
            ) {
              toast.error('Please upload a valid Excel format. Values are missing');
              return;
            }
          }

          setSendFiles(dataRows);

          setValue(
            name,
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            }),
          );
        };

        reader.readAsArrayBuffer(file);
      }
    },
    [setValue],
  );

  const handleDownloadExcelTemplate = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Define the header row
    const header = expectedValues;

    // Add the header row to the worksheet
    worksheet.addRow(header);

    // Generate a buffer for the Excel file
    return workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_format.xlsx';
      a.click();
    });
  };

  const handleRemove = useCallback(
    (name) => {
      setSendFiles([]);
      setValue(name, null);
    },
    [setValue],
  );

  const onSubmit = async () => {
    if (sendFiles.length < 1) {
      toast.error('Please upload a valid .xlsx format (Values are missing)');
      return;
    }

    try {
      // Send data to the backend
      await axios.post('user/bulk', { userData: sendFiles });
      toast.success('Successfully bulk imported users');

      setOpenImportDataForm(false);
      navigate(0);
    } catch (error) {
      toast.error(`${error?.message || 'Server error'} `);
    }

    // const response = await axios.post('user/bulk', { userData: sendFiles });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2">
              Click to{' '}
              <a
                href="#"
                onClick={handleDownloadExcelTemplate}
                sx={{
                  textDecoration: 'underline',
                }}
              >
                Download
              </a>{' '}
              required .xlsx format
            </Typography>
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Excel User Data
            </Typography>
            <RHFUploadSingleFile
              name="excel"
              label="excel"
              accept=".xlsx"
              onDrop={(v) => {
                handleDrop(v, 'excel');
              }}
              onRemove={() => {
                handleRemove('excel');
              }}
            />
          </Box>
          {/* <Box>
            <input type="file" accept=".xlsx" onChange={handleFileUpload} />
          </Box> */}
        </Grid>
        <Grid item xs={12}>
          <Stack alignItems="flex-end" sx={{ mt: 1 }}>
            <LoadingButton type="submit" variant="contained" loading={false}>
              Upload File
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default ImportDataForm;
