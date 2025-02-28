import { Box } from '@mui/material';
import React from 'react';

import FileCopyIcon from '@mui/icons-material/FileCopy';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { handleExportCsv, handleExportExcel, handleExportPdf } from '../../utils/exportTable';
import ExportButton from './ExportBtn';

const ExportOptions = ({ source, exportRow, closeExportOptions }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
    }}
  >
    <ExportButton
      onClick={() => {
        handleExportCsv(source, exportRow);
        closeExportOptions();
      }}
      variant="outlined"
    >
      <FileCopyIcon />
      <div>Export As CSV</div>
    </ExportButton>
    <ExportButton
      onClick={() => {
        handleExportExcel(source, exportRow);
        closeExportOptions();
      }}
      variant="outlined"
    >
      <MicrosoftIcon />
      <div>Export As Excel</div>
    </ExportButton>
    <ExportButton
      onClick={() => {
        handleExportPdf(source, exportRow);
        closeExportOptions();
      }}
      variant="outlined"
    >
      <PictureAsPdfIcon />
      <div>Export As PDF</div>
    </ExportButton>
  </Box>
);

export default ExportOptions;
