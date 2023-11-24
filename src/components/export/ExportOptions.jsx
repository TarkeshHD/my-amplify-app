import { Box } from '@mui/material';
import React from 'react';

import FileCopyIcon from '@mui/icons-material/FileCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { handleExportCsv, handleExportExcel, handleExportPdf } from '../../utils/exportTable';
import ExportButton from './ExportBtn';

const ExportOptions = ({ headers, exportRow, closeExportOptions }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <ExportButton
        onClick={() => {
          console.log(exportRow);
          handleExportCsv(headers, exportRow);
          closeExportOptions();
        }}
        variant="outlined"
      >
        <FileCopyIcon />
        <div>Export As CSV</div>
      </ExportButton>
      <ExportButton
        onClick={() => {
          handleExportExcel(headers, exportRow);
          closeExportOptions();
        }}
        variant="outlined"
      >
        <MicrosoftIcon />
        <div>Export As Excel</div>
      </ExportButton>
      <ExportButton
        onClick={() => {
          handleExportPdf(headers, exportRow);
          closeExportOptions();
        }}
        variant="outlined"
      >
        <PictureAsPdfIcon />
        <div>Export As PDF</div>
      </ExportButton>
    </Box>
  );
};

export default ExportOptions;
