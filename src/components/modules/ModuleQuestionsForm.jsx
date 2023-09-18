import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// form
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Stack, Switch, Typography, FormControlLabel, Divider } from '@mui/material';

import { FormProvider, RHFRadioGroup, RHFSelect, RHFSwitch, RHFTextField } from '../hook-form';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';
import axios from '../../utils/axios';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';
import { getFile } from '../../utils/utils';
import { useConfig } from '../../hooks/useConfig';

// ----------------------------------------------------------------------

ModuleQuestionForm.propTypes = {
  isEdit: PropTypes.bool,
  currentModule: PropTypes.object,
};

export default function ModuleQuestionForm({ isEdit, currentModule }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;
  console.log('Is Edit', isEdit);
  console.log('Current Module', currentModule);

  const NewModuleQuestionSchema = Yup.object().shape({
    evaluation: Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.string().required('Question is required'),
          answer: Yup.string().required('Correct answer is required'),
          image: Yup.mixed().nullable(),
          options: Yup.object().shape({
            a: Yup.string().required('Fill values for this option'),
            b: Yup.string().required('Fill values for this option'),
            c: Yup.string().required('Fill values for this option'),
            d: Yup.string().required('Fill values for this option'),
          }),
        }),
      )
      .required(`${data?.labels?.evaluation?.singular || 'Evaluation'} array is required`)
      .length(10),
  });

  const defaultValues = useMemo(
    () => ({
      evaluation: isEdit
        ? currentModule?.evaluation?.map((v) => {
            const obj = {
              title: v?.title || '',
              image: v?.infoImage?.path || null,
              answer: v?.answer || '',
              options: {
                a: v?.options?.a || '',
                b: v?.options?.b || '',
                c: v?.options?.c || '',
                d: v?.options?.d || '',
              },
            };
            // if (v?.infoImage?.path) {
            //   const file = await axios.get(getFile(v?.infoImage?.path));
            //   obj.image = file;
            // }
            return obj;
          })
        : [...new Array(10)].map((v) => ({
            title: v?.title || 'sample',
            image: v?.image || null,
            answer: v?.answer || 'c',
            options: {
              a: v?.options?.a || 'sample -1',
              b: v?.options?.b || 'sample -2 ',
              c: v?.options?.c || 'sample 3',
              d: v?.options?.d || 'sample 5',
            },
          })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentModule],
  );

  const methods = useForm({
    resolver: yupResolver(NewModuleQuestionSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentModule) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentModule]);

  const onSubmit = async (values) => {
    try {
      // Make two requests and seperate Files from Body to seperate formdata and json request!
      console.log('Values', values);
      const evaluationArr = values.evaluation;
      const formData = new FormData();
      const evaluation = [];
      evaluationArr.map((ques, index) => {
        // Use note to Identify what files should be updated respective to question document on backend!
        if (ques.image !== null) {
          ques.note = `${ques?.image?.lastModified}`;
          formData.append(ques.note, ques.image);
        }
        delete ques.image;

        evaluation.push(ques);
        return ques;
      });
      const reqObj = {
        evaluation,
      };
      const responseJson = await axios.post(`/module/questions/update/${currentModule._id?.toString()}`, reqObj);

      const responseFiles = await axios.post(
        `/module/questions/files/update/${currentModule._id?.toString()}`,
        formData,
      );

      toast.success(!isEdit ? 'Create success!' : 'Update success!');
      navigate(0);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong!');
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles, name) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          name,
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        );
      }
    },
    [setValue],
  );
  const handleRemove = useCallback(
    (name) => {
      setValue(name, null);
    },
    [setValue],
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'evaluation',
  });

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {fields.map((item, index) => (
        <Grid container mb={2} spacing={3} key={index}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color={'text'}>
              Question - {index + 1}{' '}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <RHFTextField multiline rows={2} name={`evaluation[${index}].title`} label={`Question`} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color={'text.disabled'}>
              Fill all options values here in the respective fields
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <RHFTextField name={`evaluation[${index}].options.a`} label={`a`} />
          </Grid>
          <Grid item xs={6}>
            <RHFTextField name={`evaluation[${index}].options.b`} label={`b`} />
          </Grid>
          <Grid item xs={6}>
            <RHFTextField name={`evaluation[${index}].options.c`} label={`c`} />
          </Grid>
          <Grid item xs={6}>
            <RHFTextField name={`evaluation[${index}].options.d`} label={`d`} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color={'text.disabled'}>
              Select correct option for the question
            </Typography>
            <RHFRadioGroup
              name={`evaluation[${index}].answer`}
              options={[
                { label: 'a', value: 'a' },
                { label: 'b', value: 'b' },
                { label: 'c', value: 'c' },
                { label: 'd', value: 'd' },
              ]}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color={'text.disabled'}>
              Upload any file if available
            </Typography>
            <RHFUploadSingleFile
              name={`evaluation[${index}].image`}
              onDrop={(v) => {
                handleDrop(v, `evaluation[${index}].image`);
              }}
              onRemove={() => {
                handleRemove(`evaluation[${index}].image`);
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ borderColor: 'text.disabled' }} />
          </Grid>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Stack alignItems="flex-end" sx={{ mt: 3 }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {!isEdit ? 'Create ' + (data?.labels?.module?.singular || 'Module') : 'Save Changes'}
          </LoadingButton>
        </Stack>
      </Grid>
    </FormProvider>
  );
}
