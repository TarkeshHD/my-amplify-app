import { Alert, Box, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { read, utils } from 'xlsx';

import { LoadingButton } from '@mui/lab';

import ExcelJS from 'exceljs';
import { useNavigate } from 'react-router-dom';
import { set } from 'lodash';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';
import { FormProvider } from '../hook-form';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { readExcelFile } from '../../utils/utils';

const expectedValues = ['Name', 'Domain'];

const ImportDepartmentDataForm = ({ setOpenImportDataForm }) => {
  const navigate = useNavigate();
  const [sendFiles, setSendFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const validateHeaders = (workbook, sheet, lastCell) => {
    const headersRange = `A1:${lastCell}`;
    const headers = utils.sheet_to_json(sheet, {
      range: headersRange,
      header: 1,
    })[0];
    const sortedHeaders = headers.slice().sort();
    const sortedExpectedValues = expectedValues.slice().sort();
    return JSON.stringify(sortedHeaders) === JSON.stringify(sortedExpectedValues);
  };

  const validateDataRows = (sheetData) => {
    for (const row of sheetData) {
      if (!row.Name || !row.Domain) {
        return false;
      }
    }
    return true;
  };

  const handleDrop = useCallback(
    async (acceptedFiles, name) => {
      const file = acceptedFiles[0];

      if (!file) return;

      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        toast.error('Please upload a valid .xlsx file. File type is not .xlsx');
        return;
      }

      try {
        const workbook = await readExcelFile(file);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const lastCell = sheet['!ref'].split(':').pop();

        if (!validateHeaders(workbook, sheet, lastCell)) {
          toast.error('Please upload a valid .xlsx format. Headers are in the wrong order/format');
          return;
        }

        const dataRows = utils.sheet_to_json(sheet, { range: `A1:${lastCell}` });
        if (!validateDataRows(dataRows)) {
          toast.error('Please upload a valid Excel format. Values are missing');
          return;
        }

        setSendFiles(dataRows);

        setValue(
          name,
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        );
      } catch (error) {
        console.error('Error reading the file:', error);
        toast.error('An error occurred while processing the file. Please try again.');
      }
    },
    [setValue],
  );

  const handleDownloadExcelTemplate = async () => {
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
    setIsLoading(true);
    if (sendFiles.length < 1) {
      toast.error('Please upload a valid .xlsx format (Values are missing)');
      setIsLoading(false);
      console.log('isLoading', isLoading);
      return;
    }

    try {
      // Send data to the backend
      await axios.post('department/bulk', { departmentData: sendFiles });
      toast.success('Successfully bulk imported departments');
      setIsLoading(false);
      setOpenImportDataForm(false);
      navigate(0);
    } catch (error) {
      setIsLoading(false);
      toast.error(`${error?.message || 'Server error'} `);
    }

    // const response = await axios.post('domain/bulk', { domainData: sendFiles });
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
              Excel Department Data
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
            <LoadingButton
              loadingPosition="center" // Can be 'start', 'end', or 'center'
              loadingIndicator={<CircularProgress color="inherit" size={16} />}
              type="submit"
              variant="contained"
              loading={isLoading}
            >
              Upload File
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default ImportDepartmentDataForm;
