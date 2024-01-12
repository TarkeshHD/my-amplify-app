import PropTypes from 'prop-types';

// @mui
import { Close, FileUpload } from '@mui/icons-material';
import { IconButton, List, ListItem, ListItemText } from '@mui/material';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

MultiFilePreview.propTypes = {
  files: PropTypes.array.isRequired,
  onRemove: PropTypes.func,
  showPreview: PropTypes.bool,
};

export default function MultiFilePreview({ showPreview = false, files, onRemove }) {
  const hasFile = files.length > 0;

  return (
    <List disablePadding sx={{ ...(hasFile && { my: 3 }) }}>
      {files.map((file, index) => {
        const { key = `${file.name}_${index}`, name, size, preview } = file;

        if (showPreview) {
          return (
            <ListItem
              key={key}
              component={'div'}
              sx={{
                p: 0,
                m: 0.5,
                width: 80,
                height: 80,
                borderRadius: 1.25,
                overflow: 'hidden',
                position: 'relative',
                display: 'inline-flex',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              <img alt="preview" src={preview} ratio="1/1" />

              {onRemove && (
                <IconButton
                  size="small"
                  onClick={() => onRemove(file)}
                  sx={{
                    top: 6,
                    p: '2px',
                    right: 6,
                    position: 'absolute',
                    color: 'common.white',
                    bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                    },
                  }}
                >
                  <Close />
                </IconButton>
              )}
            </ListItem>
          );
        }

        return (
          <ListItem
            key={key}
            component={'div'}
            sx={{
              my: 1,
              px: 2,
              py: 0.75,
              borderRadius: 0.75,
              border: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            <FileUpload sx={{ width: 28, height: 28, color: 'text.secondary', mr: 2 }} />

            <ListItemText
              primary={typeof file === 'string' ? file : name}
              secondary={typeof file === 'string' ? '' : `${size}` || 0}
              primaryTypographyProps={{ variant: 'subtitle2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />

            {onRemove && (
              <IconButton edge="end" size="small" onClick={() => onRemove(file)}>
                <Close />
              </IconButton>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}
