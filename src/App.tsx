import React, { useEffect, useState, } from 'react';
import {
  AppBar,
  Alert,
  // Paper,
  Toolbar,
  DialogTitle,
  // DialogContentText,
  DialogContent,
  // DialogActions,
  IconButton,
  Typography,
  Button,
  Dialog,
  List,
  ListItem,
  ListItemText,
  Drawer,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  // FormControl,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  // Divider, 
  Grid,
  // Stack, 
  Box,
  CircularProgress,
  // Modal,
  // Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  // Card, 
  // CardContent, 
  Tooltip,
  // Accordion, AccordionSummary, AccordionDetails,
  Divider,
  // ListItemButton,
  ListItemIcon,
} from '@mui/material';
import {
  Circle, FileUpload, Menu,
  // UploadFile 
} from '@mui/icons-material';
// import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import BadgeIcon from '@mui/icons-material/Badge';
import {
  SignifyClient, ready,
  CredentialTypes
} from 'signify-ts';
import GridViewIcon from '@mui/icons-material/GridView';
const MainComponent = () => {

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [client, setClient] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // Open drawer by default
  // const url = 'https://keria-dev.rootsid.cloud'
  const url = 'http://localhost:3901'
  // Define the base URL for the API server
  const baseUrl = 'http://127.0.0.1:8000';
  const [passcode, setPasscode] = useState('');
  const [status, setStatus] = useState('Connect');
  const [selectedOption1, setSelectedOption1] = useState(''); // Step 2 Selection
  const [selectedOption2, setSelectedOption2] = useState(''); // Step 3 Selection
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Insert passcode', 'Choose an identifier', 'Choose a credential', 'Done'];
  const [modalError, setModalError] = useState('');


  let _aids: string[] = [];
  const [aids, setAids] = useState([]);

  let _acdcs: string[] = [];
  const [acdcs, setAcdcs] = useState([]);


  useEffect(() => {
    ready().then(() => {
      console.log("signify client is ready")
    })
  }, [])

  // Define the endpoint paths
  const pingPath = '/ping';
  const loginPath = '/login';

  // Function to handle the API request and response

  // Function to perform the ping request
  async function ping(): Promise<string> {
    const url = `${baseUrl}${pingPath}`;

    // Make the API request using the fetch function
    const response = await fetch(url);
    const responseData = await response.json();

    // Return the pong message
    return responseData;
  }

  // Function to perform the login request
  async function login(aid: string, said: string, vlei: string): Promise<any> {
    const url = `${baseUrl}${loginPath}`;

    // Create the request body object
    const requestBody = {
      aid,
      said,
      vlei
    };

    // Make the API request using the fetch function
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    // Return the response data
    return responseData;
  }

  const toggleDrawer = (open: any) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    console.log('menu')
    setDrawerOpen(open);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    if (client !== null && status !== 'Connected')
      return;
    setOpen(false);
    setModalError('')

  };

  const loginReal = async () => {
    //wait for 2 seconds
    // await new Promise(r => setTimeout(r, 2000));
    //generate a random number between 0 and 1

    const creds = client.credentials()
    let vlei_cesr = await creds.export(selectedOption1, selectedOption2)
    console.log(vlei_cesr)

    let logged_in = await login(selectedOption1, selectedOption2, vlei_cesr)
    console.log(logged_in)
    if (logged_in.aid === selectedOption1) {
      setStatus('Connected')
      setModalError('')
    }
    else if (JSON.stringify(logged_in).includes('Exception')) {
      setStatus('Failed')
      setModalError('Login Failed. Please pick different credential')
    } else {
      setStatus('Connecting')
      setModalError('Waiting for verificaiton')
    }

  }
  //create async function that wait for 2 seconds and either return 'in progress' or 'almost done' with a 40% chance
  const checkStatus = async () => {
    //wait for 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    let _aids = ['EBcIURLpxmVwahksgrsGW6_dUw0zBhyEHYFk17eWrZfk']
    let _acdcs = ['EJYGavdmOrtMh022whOAiqd59ZA5ikHuBTSjlACJ880K']
    //
    if (selectedOption1 === _aids[0] && selectedOption2 === _acdcs[0]) {
      setStatus('Connected')
      return
    }
    setModalError('Pick a different credential/identifier pair')
    setStatus('Failed')

  }



  const renderComponent = (componentName: any) => {
    //check if the client is not null then render the component otherwise set the drwar to true
    if (client === null || selectedOption2 === '') {
      setDrawerOpen(true);
      setModalError(`Please connect to the agent first`)
      setOpen(true);
      return;
    }
    setSelectedComponent(componentName);
  };

  const getSelectedAid = (aid: string) => {
    const aid_found = aids.find(aid => aid.prefix === selectedOption1)
    if (aid_found !== undefined) {
      return aid_found
    }
    return undefined
    return 
  }

  const getSelectedAcdc = (acdc: string) => {
    const acdc_found = acdcs.find(acdc => acdc.sad.d === selectedOption2)
    if (acdc_found !== undefined) {
      return acdc_found
    }
    return undefined
  }

    const resetAidSelected = () => {
      setActiveStep(1)
      handleClickOpen()
      setSelectedOption1('')
      setSelectedOption2('')
      setStatus('Connecting')
      setModalError('Select a new identifier and credential')
    }

    const connectToAgent = async (client: SignifyClient) => {
      try {
        await client.connect()
        const controller = await client.state();
        console.log(JSON.stringify(controller.controller, null, 2))

      } catch (e) {
        console.log('controller not found')
        await client.boot();
        await client.connect()
        const controller = await client.state();
        console.log(JSON.stringify(controller, null, 2))
      }
    }
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          height: '100vh',
          width: '100vw'
        }}
      >
        <AppBar position="fixed" sx={{ width: '100%' }}>
          <Toolbar sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(!drawerOpen)}>
              <Menu />
            </IconButton>
            <Box
              onClick={toggleDrawer(!drawerOpen)}
              sx={{
                ':hover': {
                  cursor: 'pointer'

                }
              }}
            >
              <Typography variant="h6">
                Menu
              </Typography>
            </Box>
            <Button
              sx={{
                marginLeft: 'auto', backgroundColor: 'lightblue', color: 'black', '&:hover': {
                  color: 'white'
                }
              }} onClick={handleClickOpen} variant='contained'
              startIcon={
                <Circle sx={{
                  color: status === 'Connected' ? 'green' : (status === 'Connecting' ? 'orange' : 'red')
                }} />
              }
            >
              {status}
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
          <div
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <List>
              {['Check Status', 'Upload Report'].map((text, index) => (
                <ListItem key={text} onClick={() => renderComponent(text)

                }
                  sx={{
                    '&:hover': {
                      backgroundColor: 'lightblue',
                      cursor: 'pointer'
                    }
                  }}
                >
                  {index === 0 ? <ListItemIcon> <GridViewIcon /> </ListItemIcon> : <ListItemIcon> <FileUpload /> </ListItemIcon>}
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          </div>
          {client !== null && status === 'Connected' &&
            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
              <Divider />
              <List>
                {[getSelectedAid(selectedOption1), getSelectedAcdc(selectedOption2)].map((text, index) => (
                  <Tooltip
                    title={index == 0 ? text?.prefix : text?.sad.d}
                    placement="right"
                    key={index == 0 ? 'Identifier' : 'Credential'}>
                    <ListItem key={text} onClick={() => renderComponent(text)}>
                      {index === 0 ? <ListItemIcon> <FingerprintIcon /> </ListItemIcon> : <ListItemIcon> <BadgeIcon /></ListItemIcon>}
                      {index === 0 ? <ListItemText primary={reduceString(text?.name)} /> : <ListItemText primary={reduceString(text?.sad.a.engagementContextRole)} />}
                    </ListItem>
                  </Tooltip>
                ))}

                <ListItem key='picknew'
                  disableGutters={true}
                  disablePadding={true}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginX: 2, marginLeft: '25%' }}
                    onClick={() => {
                      resetAidSelected();
                    }}
                  >
                    Refresh
                  </Button>
                </ListItem>
              </List>
            </div>}

        </Drawer>
        <Dialog open={open} onClose={handleClose} disableEscapeKeyDown={true}>
          <DialogTitle>
            <Button

              sx={{
                "&.Mui-disabled": {
                  color: "black"
                }
              }} onClick={handleClickOpen}
              disabled={true}
              startIcon={
                <Circle sx={{
                  color: status === 'Connected' ? 'green' : (status === 'Connecting' ? 'orange' : 'red')
                }} />
              }
            >
              {status}
            </Button>
            <Tooltip title="Close" key={'close'}>
              <IconButton
                component="div"
                sx={{ position: 'absolute', right: 10, top: 10 }}
                onClick={handleClose}
                disabled={client !== null && status === 'Failed'}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </DialogTitle>
          <DialogContent>
            {modalError !== '' && <Alert severity={modalError.includes('agent') ? 'error' : 'warning'}>
              <Typography variant="body2">
                {modalError}
              </Typography>
            </Alert>}
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    {index === 0 && client === null && (
                      <>
                        <TextField
                          id="outlined-password-input"
                          label="Passcode"
                          type="text"
                          autoComplete="current-password"
                          variant="outlined"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          helperText="Passcode must be at least 21 characters"
                          error={passcode.length < 21 && passcode.length > 0}
                        />
                        <br />
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={passcode.length < 21}
                          onClick={
                            async () => {
                              setModalError('')
                              setStatus('Connecting')
                              const client = new SignifyClient(url, passcode);
                              console.log(client.controller.pre)
                              setClient(client)
                              await connectToAgent(client)
                              // setAids(['EJEWp997uRp0HFSgnp1Hb26kC33v6t3iMhaj283isU5J', 'EHCQxd86mjMk_sMhB7XH5PJrObCmYBiv8wZ7zIZr0kLC', 'EA7mBw8OLM597_yRCr6OaYXUCyTXHgk1Hy214jB6yMmd'])
                              const identifiers = client.identifiers()
                              const _ids = await identifiers.list_identifiers()
                              console.log(_ids)
                              if (_ids.length === 0) {
                                setModalError('No identifiers found. Please add one from the agent')
                                setStatus('Connecting')
                                return
                              } else {
                                setAids(_ids)
                                setActiveStep(prevStep => prevStep + 1)
                              }


                            }
                          }
                        >
                          Connect
                        </Button>
                      </>
                    )}

                    {index === 1 && (
                      <>
                        <RadioGroup
                          aria-label="step2"
                          name="step2"
                          value={selectedOption1}
                          onChange={e => setSelectedOption1(e.target.value)}
                        >
                          {aids.map((aid, index) => (
                            <Tooltip title={aid.prefix} placement="right" key={aid.prefix}>
                              <FormControlLabel key={index} value={aid.prefix} control={<Radio />} label={aid.name} />
                            </Tooltip>
                          ))}
                        </RadioGroup>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={selectedOption1 === ''}
                          onClick={async () => {
                            setModalError('')
                            const credentials = client.credentials()
                            const _creds = await credentials.list(selectedOption1, CredentialTypes.received, '')
                            console.log(_creds)
                            let saids: string[] = [];
                            _creds.forEach(cred => {
                              saids.push(cred)
                            })

                            setActiveStep(prevStep => prevStep + 1)
                            setAcdcs(saids)
                            // setAcdcs(['EAIcKG4UERhMZpX0M43sFr3qUDJDtRMZpX0MdpZ9z1', 'EBIcAFV1EqUDJDtRbgSMs44aBIcKAtRbQzHEdmpZ9z2', 'ECIcKAVUERhMZpX0MCgSMs7a65RrJDtRbQzHd66mpZ9z3']) 

                          }

                          }
                        >
                          Next
                        </Button>
                      </>
                    )}

                    {index === 2 && (
                      <>
                        <RadioGroup
                          aria-label="step3"
                          name="step3"
                          value={selectedOption2}
                          onChange={e => setSelectedOption2(e.target.value)}
                        >
                          {acdcs.map((acdc, index) => (
                            <Tooltip title={acdc.sad.d} placement="right" key={acdc.sad.d}>
                              <FormControlLabel key={index} value={acdc['sad']['d']} control={<Radio />} label={acdc.sad.a.engagementContextRole} />
                            </Tooltip>
                          ))}

                        </RadioGroup>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={selectedOption2 === ''}
                          onClick={
                            async () => {
                              setActiveStep(prevStep => prevStep + 1)
                              //call api function from lance and handle it here
                              await checkStatus()
                              //login real
                              // await loginReal()
                            }
                          }
                        >
                          Next
                        </Button>
                      </>
                    )}

                    {index === 3 && (
                      <>
                        {status === 'Connecting' && <CircularProgress sx={{ marginLeft: '35%' }} />}


                        <Box display="flex" justifyContent="center" paddingTop={2}
                        //make the items inside of this with some space between them
                        >

                          {status === 'Failed' && <Button
                            variant="contained"
                            color="primary"
                            sx={{ m: 1 }}
                            onClick={() => {
                              resetAidSelected();
                            }}
                          >
                            Reset
                          </Button>}
                          <Button
                            variant="contained"
                            color="error"
                            sx={{ m: 1 }}
                            disabled={status === 'Connecting' || status === 'Failed'}

                            onClick={() => {
                              setActiveStep(0);
                              setClient(null);
                              setSelectedOption1('');
                              setSelectedOption2('');
                              setStatus('Connect');
                              setPasscode('');
                              handleClose()
                            }}
                          >
                            disconnect
                          </Button>

                        </Box>
                      </>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </DialogContent>
        </Dialog>
        {client === null && <LandingComponent text='Welcome to EBA portal' />}
        {/* {selectedOption2 !== '' && !open && Info(selectedOption1, selectedOption2, resetAidSelected)} */}
        {selectedComponent === 'Check Status' && client !== null && <TextComponent text='Check Status' />}
        {selectedComponent === 'Upload Report' && client !== null && <TextComponent text='Upload Report' />}

      </Box>
    );
  };

  //write a function that takes a string and adds ellipses to it if it is too long in the middle of the string, only show 4 characters on each side of the ellipses
  const reduceString = (str: string) => {
    if (str.length > 40) { //TODO change to smaller number
      return str.slice(0, 6) + '...' + str.slice(str.length - 6, str.length)
    }
    return str
  }

  interface TextComponentProps {
    text: string;
  }

  const TextComponent: React.FC<TextComponentProps> = ({ text }) => (
    <Grid item xs={1} lg={1} left={'50%'}><Box><Typography> {text}</Typography></Box></Grid>
  )

  const LandingComponent: React.FC<TextComponentProps> = ({ text }) => (
    <Grid item xs={1} lg={1} left={'50%'}>
      <Box textAlign={'center'}>
        <Typography variant='h1'>{text}</Typography>
        <br />
        <Divider />
        <br />
        <br />
        <Typography variant='h5'>Please start by connecting using the button in the top right.</Typography>
      </Box>
    </Grid>
  )
  export default MainComponent;
