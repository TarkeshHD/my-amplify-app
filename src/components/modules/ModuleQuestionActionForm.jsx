import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Divider, Grid, IconButton, InputAdornment, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';

import { Add } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFRadioGroup, RHFTextField } from '../hook-form';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';

// ----------------------------------------------------------------------

ModuleQuestionActionForm.propTypes = {
  isEdit: PropTypes.bool,
  currentModule: PropTypes.object,
};

export default function ModuleQuestionActionForm({ isEdit, currentModule }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewModuleQuestionSchema = Yup.object().shape({
    evaluation: Yup.array()
      .of(
        Yup.object().shape({
          type: Yup.string().oneOf(['question', 'action']).required('Type is required'),
          title: Yup.string().required('Title is required'),
          // Conditional validation based on the type
          answer: Yup.string().when('type', {
            is: 'question',
            then: () => Yup.string().required('Correct answer is required'),
            otherwise: () => Yup.string().notRequired(),
          }),
          descriptionSuccess: Yup.string().when('type', {
            is: 'action',
            then: () => Yup.string().required('Success description is required'),
            otherwise: () => Yup.string().notRequired(),
          }),
          descriptionFailure: Yup.string().when('type', {
            is: 'action',
            then: () => Yup.string().required('Failure description is required'),
            otherwise: () => Yup.string().notRequired(),
          }),
          options: Yup.object({
            a: Yup.string(),
            b: Yup.string(),
            c: Yup.string(),
            d: Yup.string(),
          }).when('type', {
            is: 'question', // Condition: when 'type' is exactly 'question'
            then: () =>
              Yup.object({
                a: Yup.string().required('Fill values for this option'),
                b: Yup.string().required('Fill values for this option'),
                c: Yup.string().required('Fill values for this option'),
                d: Yup.string().required('Fill values for this option'),
              }).required('Option values are required'), // Mark the entire object as required when 'type' is 'question'
            otherwise: () => Yup.object().notRequired(), // Not required for other types (like 'action')
          }),

          image: Yup.mixed().nullable(),
        }),
      )
      .required(`${data?.labels?.evaluation?.singular || 'Evaluation'} array is required`),
    passPercentage: Yup.number()
      .required('Pass percentage is required')
      .min(1, 'Minimum value is 1')
      .max(100, 'Maximum value is 100'),
    timeRequired: Yup.number().min(1, 'Minimum value is 1').max(100, 'Maximum value is 100'),
  });

  const defaultValues = useMemo(
    () => ({
      evaluation: isEdit
        ? currentModule?.evaluation?.map((v) => {
            const obj =
              v.type === 'action'
                ? {
                    title: v.title || '',
                    type: 'action',
                    descriptionSuccess: v.descriptionSuccess || '',
                    descriptionFailure: v.descriptionFailure || '',
                    timeRequired: v?.timeRequired || null,
                  }
                : {
                    // This is for 'question' type or any type not explicitly handled above
                    title: v.title || '',
                    type: 'question', // This can be dynamic based on your data structure
                    image: v.infoImage?.path || null,
                    answer: v.answer || '',
                    options: {
                      a: v.options?.a || '',
                      b: v.options?.b || '',
                      c: v.options?.c || '',
                      d: v.options?.d || '',
                    },
                    timeRequired: v?.timeRequired || null,
                  };

            // The commented out async axios call to get the file cannot be directly used inside the map function without additional async handling

            return obj;

            // if (v?.infoImage?.path) {
            //   const file = await axios.get(getFile(v?.infoImage?.path));
            //   obj.image = file;
            // }
            // console.log('Log this', obj);
          })
        : [...new Array(2)].map((v) => ({
            // Get the minimum questions from config file from backend
            title: v?.title || 'sample',
            image: v?.image || null,
            answer: v?.answer || 'c',
            type: 'question',
            options: {
              a: v?.options?.a || 'sample -1',
              b: v?.options?.b || 'sample -2 ',
              c: v?.options?.c || 'sample 3',
              d: v?.options?.d || 'sample 5',
            },
            timeRequired: isEdit ? v?.timeRequired : null,
          })),
      passPercentage: isEdit ? currentModule?.passPercentage : 50,
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
        passPercentage: values.passPercentage,
      };

      const responseJson = await axios.post(`/module/questionsAction/update/${currentModule._id?.toString()}`, reqObj);

      //   const responseFiles = await axios.post(
      //     `/module/questions/files/update/${currentModule._id?.toString()}`,
      //     formData,
      //   );

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

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: 'evaluation',
  });

  const addQuestion = () => {
    // Specify the last index
    const indexToInsert = values.evaluation.length;

    // Insert a new item at the specified index
    insert(indexToInsert, {
      title: 'sample',
      image: null,
      answer: 'c',
      type: 'question',
      options: {
        a: 'sample -1',
        b: 'sample -2 ',
        c: 'sample 3',
        d: 'sample 5',
      },
    });
  };

  const addAction = () => {
    const indexToInsert = values.evaluation.length; // Get the index for the new action

    // Insert a new item at the specified index with type 'action'
    insert(indexToInsert, {
      title: 'sample action title',
      descriptionSuccess: 'sample success description',
      descriptionFailure: 'sample failure description',
      type: 'action', // Default type for actions
    });
  };

  const removeQuestionAction = (index) => {
    // Remove the item at the specified index
    remove(index);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid spacing={3} container sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
            Pass Percentage
          </Typography>
          <RHFTextField
            name="passPercentage"
            placeholder=""
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
      {fields.map((field, index) =>
        // console.log(field, index);

        field.type === 'question' ? (
          <Grid container mb={2} spacing={3} key={field.id}>
            {/* Key should be field.id for useFieldArray remove function to work: It's the proper mui way*/}
            <Grid display="flex" item xs={12} alignItems="center" justifyContent={'space-between'}>
              <Typography variant="subtitle1" color={'text'}>
                Question - {index + 1}{' '}
              </Typography>
              {/* <Button
              variant="outlined"
              color="error"
              onClick={() => removeQuestion(index)} // Pass the current form values to addQuestion
            >
              Delete
            </Button> */}
              <Tooltip title="Delete">
                <IconButton>
                  <DeleteIcon sx={{ fontSize: '24px' }} onClick={() => removeQuestionAction(index)} color="error" />
                </IconButton>
              </Tooltip>
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
            <Grid item xs={6}>
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
            <Grid item xs={6}>
              <Typography variant="subtitle2" color={'text.disabled'}>
                Time required to answer the question (Optional)
              </Typography>
              <RHFTextField name={`evaluation[${index}].timeRequired`} label={``} />
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
        ) : (
          <Grid container mb={2} spacing={3} key={field.id}>
            <Grid display="flex" item xs={12} alignItems="center" justifyContent={'space-between'}>
              <Typography variant="subtitle1" color={'text'}>
                Action - {index + 1}{' '}
              </Typography>

              <Tooltip title="Delete">
                <IconButton>
                  <DeleteIcon sx={{ fontSize: '24px' }} onClick={() => removeQuestionAction(index)} color="error" />
                </IconButton>
              </Tooltip>
            </Grid>
            {/* Action Fields */}
            <Grid item xs={6}>
              <RHFTextField name={`evaluation[${index}].title`} label="Action Title" />
            </Grid>
            <Grid item xs={6}>
              <RHFTextField
                name={`evaluation[${index}].timeRequired`}
                label="Time required to complete the action (Optional)"
              />
            </Grid>
            <Grid item xs={6}>
              <RHFTextField name={`evaluation[${index}].descriptionSuccess`} label="Description Success" />
            </Grid>
            <Grid item xs={6}>
              <RHFTextField name={`evaluation[${index}].descriptionFailure`} label="Description Failure" />
            </Grid>
          </Grid>
        ),
      )}

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <LoadingButton
            variant="outlined"
            loading={isSubmitting}
            startIcon={<Add />}
            onClick={addQuestion} // Use the addQuestion function when the button is clicked
          >
            Add Question
          </LoadingButton>
          <LoadingButton
            variant="outlined"
            loading={isSubmitting}
            startIcon={<Add />}
            onClick={addAction} // Use the addAction function when this button is clicked
          >
            Add Action
          </LoadingButton>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Stack alignItems="flex-end" sx={{ mt: 2 }}>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {!isEdit ? `Create ${data?.labels?.module?.singular || 'Module'}` : 'Save Changes'}
          </LoadingButton>
        </Stack>
      </Grid>
    </FormProvider>
  );
}
