import { Grid, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormProvider, RHFTextField } from '../hook-form';

const ArchiveGrid = ({ archiveData }) => {
  // Archive Grids is a component that displays the archive grid with dynamic values
  const defaultValues = {};
  const methods = useForm({
    defaultValues,
  });
  const archiveDataComponent = Object.entries(archiveData).map(([key, value]) => {
    if (value.length < 25 || value.length === undefined) {
      return (
        <Grid item xs={6} key={key}>
          <Typography color={'text.disabled'} variant="caption" display={'block'}>
            {key}
          </Typography>
          <RHFTextField name={`${key}-${value}`} placeholder={value} defaultValue={value} />
        </Grid>
      );
    } else if (value.length < 50) {
      return (
        <Grid item xs={12} key={key}>
          <Typography color={'text.disabled'} variant="caption" display={'block'}>
            {key}
          </Typography>
          <RHFTextField name={`${key}-${value}`} placeholder={value} defaultValue={value} />
        </Grid>
      );
    } else {
      return (
        <Grid item xs={12} key={key}>
          <Typography color={'text.disabled'} variant="caption" display={'block'}>
            {key}
          </Typography>
          <RHFTextField name={`${key}-${value}`} multiline rows={12} placeholder={value} defaultValue={value} />
        </Grid>
      );
    }
  });

  return (
    <FormProvider methods={methods}>
      <Grid container spacing={2}>
        {archiveDataComponent}
      </Grid>
    </FormProvider>
  );
};

export default ArchiveGrid;
