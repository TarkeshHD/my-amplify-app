import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Container, SvgIcon, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Error404 from '../assets/errors/error-404.png';

const Page = () => (
  <>
    <Helmet>
      <title>404 | VRse Builder</title>
    </Helmet>
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexGrow: 1,
        minHeight: '100%',
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              mb: 3,
              textAlign: 'center',
            }}
          >
            <img
              alt="Under development"
              // src="/assets/errors/error-404.png"
              src={Error404}
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                width: 400,
              }}
            />
          </Box>
          <Typography align="center" sx={{ mb: 3 }} variant="h3">
            404: The page you are looking for isn’t here
          </Typography>
          <Typography align="center" color="text.secondary" variant="body1">
            You either tried some shady route or you came here by mistake. Whichever it is, you can click on the button
            below to go back.
          </Typography>
          <Button
            component={Link}
            to="/"
            startIcon={
              <SvgIcon fontSize="small">
                <ArrowBackIcon />
              </SvgIcon>
            }
            sx={{ mt: 3 }}
            variant="contained"
          >
            Go back to dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  </>
);

export default Page;
