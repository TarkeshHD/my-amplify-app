import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material';

import { Add } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import MenuIcon from '@mui/icons-material/Menu';
import { Box } from '@mui/system';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFRadioGroup, RHFTextField } from '../hook-form';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';
import { getFile } from '../../utils/utils';

// ----------------------------------------------------------------------

ModuleQuestionForm.propTypes = {
  isEdit: PropTypes.bool,
  currentModule: PropTypes.object,
};

export default function ModuleQuestionForm({ isEdit, currentModule }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

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
      .required(`${data?.labels?.evaluation?.singular || 'Evaluation'} array is required`),
    noOfQuestion: Yup.number().required('Number of assessment questions is required').min(1, 'Minimum value is 1'),
    passPercentage: Yup.number()
      .required('Pass percentage is required')
      .min(1, 'Minimum value is 1')
      .max(100, 'Maximum value is 100'),
    thumbnail: Yup.mixed(),

    // .length(formValues?.evaluation?.length || 0, 'Evaluation array length must be 10')), // Minimum value from config file from backend
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
              weightage: v?.weightage || 1,
            };
            // if (v?.infoImage?.path) {
            //   const file = await axios.get(getFile(v?.infoImage?.path));
            //   obj.image = file;
            // }
            return obj;
          })
        : [...new Array(data.minQuestions)].map((v) => ({
            // Get the minimum questions from config file from backend
            title: v?.title || 'sample',
            image: v?.image || null,
            answer: v?.answer || 'c',
            options: {
              a: v?.options?.a || 'sample -1',
              b: v?.options?.b || 'sample -2 ',
              c: v?.options?.c || 'sample 3',
              d: v?.options?.d || 'sample 5',
            },
            weightage: v?.weightage || 1,
          })),
      noOfQuestion: isEdit ? currentModule?.noOfQuestion : 10,
      passPercentage: isEdit ? currentModule?.passPercentage : 50,
      description: currentModule?.description || '',
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

      Object.keys(values).map((key) => formData.append(key, values[key]));
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

      if (evaluation.length < data.minQuestions) {
        // If the questions are below minimum value
        toast.error(`Minimum questions needed is ${data.minQuestions}`);
        return;
      }
      const reqObj = {
        evaluation,
        passPercentage: values.passPercentage,
        noOfQuestion: values.noOfQuestion,
        description: values.description,
      };

      if (evaluation.length < values.noOfQuestion) {
        toast.error('Number of assessment questions should be less than or equal to the total number of questions ');
        return;
      }

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

  const { fields, append, insert, remove, move } = useFieldArray({
    control,
    name: 'evaluation',
  });

  const addQuestion = () => {
    // Specify the last index
    const indexToInsert = values?.evaluation?.length;

    // Insert a new item at the specified index
    insert(indexToInsert, {
      title: 'sample',
      image: null,
      answer: 'c',
      options: {
        a: 'sample -1',
        b: 'sample -2 ',
        c: 'sample 3',
        d: 'sample 5',
      },
      weightage: 1,
    });
  };

  const removeQuestion = (index) => {
    // Remove the item at the specified index
    remove(index);
  };

  const handleDrag = ({ source, destination }) => {
    if (destination) {
      move(source.index, destination.index);
    }
  };

  const [expanded, setExpanded] = useState(true);

  // Handle the external toggle button click
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleAccordionClick = (event) => {
    event.stopPropagation(); // Prevents the accordion from toggling on click
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {expanded && (
        <Grid spacing={3} container sx={{ mb: 5 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Number Of Assessment Questions
            </Typography>
            <RHFTextField name="noOfQuestion" placeholder="" type="number" />
          </Grid>
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
          <Grid item xs={12}>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Description
            </Typography>
            <RHFTextField rows={5} multiline name="description" label="Description" />
          </Grid>
        </Grid>
      )}
      <Grid item xs={12} lg={6}>
        <Box mb={5}>
          <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
            Thumbnail
          </Typography>
          <RHFUploadSingleFile
            name="thumbnail"
            label="Thumbnail"
            onDrop={(v) => {
              handleDrop(v, 'thumbnail');
            }}
            onRemove={() => {
              handleRemove('thumbnail');
            }}
          />
        </Box>
      </Grid>

      <DragDropContext onDragEnd={handleDrag}>
        <Droppable droppableId="evaluation-items">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={`evaluation[${index}]`} draggableId={`item-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <Grid
                      container
                      mb={2}
                      spacing={3}
                      key={field.id}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Accordion
                        key={field.id}
                        expanded={expanded}
                        onChange={handleAccordionClick}
                        sx={{ padding: '0px 0px 0px 16px', boxShadow: 'none !important' }}
                      >
                        <AccordionSummary aria-controls={`panel${index}d-content`} id={`panel${index}d-header`}>
                          <Grid display="flex" item xs={12} alignItems="center" justifyContent={'space-between'}>
                            <div
                              style={{
                                display: 'flex',
                              }}
                            >
                              {!expanded && (
                                <Tooltip title="Reorder by dragging the field">
                                  <span
                                    {...provided.dragHandleProps}
                                    style={{
                                      cursor: 'grab',
                                      marginRight: '10px',
                                      color: 'rgba(17, 25, 39, 0.38)',
                                    }}
                                  >
                                    <MenuIcon
                                      fontSize="medium"
                                      style={{
                                        marginBottom: '0px',
                                      }}
                                    />
                                  </span>
                                </Tooltip>
                              )}

                              <Typography variant="subtitle1" color={'text'}>
                                Question - {expanded ? `${index + 1} ` : `${field.title}`}{' '}
                              </Typography>
                            </div>

                            {/* <Button
              variant="outlined"
              color="error"
              onClick={() => removeQuestion(index)} // Pass the current form values to addQuestion
            >
              Delete
            </Button> */}
                            {expanded && (
                              <Tooltip title="Delete">
                                <IconButton>
                                  <DeleteIcon
                                    sx={{ fontSize: '24px' }}
                                    onClick={() => removeQuestion(index)}
                                    color="error"
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Grid>
                        </AccordionSummary>

                        <AccordionDetails>
                          <Grid container mb={0} spacing={3}>
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
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color={'text.disabled'}>
                                Time required to answer the question (Optional)
                              </Typography>
                              <RHFTextField name={`evaluation[${index}].timeRequired`} label={``} />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color={'text.disabled'}>
                                points for the question (Default to 1)
                              </Typography>
                              <RHFTextField
                                name={`evaluation[${index}].weightage`}
                                label={``}
                                type="number"
                                InputProps={{ inputProps: { min: 1 } }}
                              />
                            </Grid>
                            <Grid item xs={12} />

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
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {expanded && (
        <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              <LoadingButton
                variant="text"
                loading={isSubmitting}
                startIcon={<Add />}
                onClick={addQuestion} // Use the addQuestion function when the button is clicked
              >
                Add Question
              </LoadingButton>
            </Stack>
          </Grid>
          <Grid sx={{ display: 'flex', mr: 2, mt: 1 }}>
            <Typography variant="h6" color={'text.disabled'}>
              Total Points:{' '}
              {values?.evaluation?.reduce((acc, curr) => {
                const currentWeightage = parseInt(curr.weightage);
                return acc + (isNaN(currentWeightage) ? 0 : currentWeightage);
              }, 0)}
            </Typography>
          </Grid>
        </Grid>
      )}

      <Grid item xs={12}>
        <Stack sx={{ mt: 2 }} display={'flex'} justifyContent={'flex-end'} flexDirection={'row'}>
          <LoadingButton variant="outlined" sx={{ mr: 2 }} onClick={handleToggle}>
            {expanded ? 'Reorder Questions And Actions' : 'Back To Edit Mode'}
          </LoadingButton>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {!isEdit ? `Create ${data?.labels?.module?.singular || 'Module'}` : 'Save Changes'}
          </LoadingButton>
        </Stack>
      </Grid>
    </FormProvider>
  );
}
