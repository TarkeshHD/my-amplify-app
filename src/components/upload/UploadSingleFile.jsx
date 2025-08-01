import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import BlockContent from './BlockContent';
import MultiFilePreview from './MultiFilePreview';
import RejectionFiles from './RejectionFiles';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  overflow: 'hidden',
  position: 'relative',
  padding: theme.spacing(3, 1),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ----------------------------------------------------------------------

UploadSingleFile.propTypes = {
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  helperText: PropTypes.node,
  sx: PropTypes.object,
};

export default function UploadSingleFile({ error = false, file, onRemove = () => {}, helperText, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    ...other,
  });

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && {
            color: 'error.main',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }),
          ...(file && {
            padding: '12% 0',
          }),
        }}
      >
        <input {...getInputProps()} />

        <BlockContent />

        {/* {file && (
          <img
            alt="file preview"
            src={typeof file === 'string' ? file : file.preview}
            sx={{
              top: 8,
              left: 8,
              borderRadius: 1,
              position: 'absolute',
              // width: 'calc(100% - 16px)',
              // height: 'calc(100% - 16px)',
            }}
          />
        )} */}
      </DropZoneStyle>

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
      {file && <MultiFilePreview files={[file]} onRemove={onRemove} showButtons={false} onRemoveAll={() => {}} />}

      {helperText && helperText}
    </Box>
  );
}
