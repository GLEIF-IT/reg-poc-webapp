import React, { useCallback, useEffect, useState } from "react";
import {
  AppBar,
  Alert,
  Toolbar,
  DialogTitle,
  DialogContent,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  Box,
  CircularProgress,
  Tooltip,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Circle, FileUpload, Menu, UploadFile } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BadgeIcon from "@mui/icons-material/Badge";
import GridViewIcon from "@mui/icons-material/GridView";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { useAutonomicIDContext } from "./contexts/AutonomicID";
import {
  resetAcdcOption,
  resetAidOption,
  setAcdcOption,
  setAidOption,
} from "./features/options/options-slice";
import {
  incrementStep,
  setStatus,
  setStep,
} from "./features/shared/shared-slice";
import { useAuthenticChainedDataContainerContext } from "./contexts/AuthenticChainedDataContainer";
import MyTable from "./components/MyTable";

import { ACDC, AID, Report } from "./types";
import { SignifyClient } from "signify-ts";
import { LOGIN_PATH, UPLOAD_PATH } from "./constants";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const MainComponent = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // Open drawer by default
  const [passcode, setPasscode] = useState("");
  const steps = [
    "Insert passcode",
    "Choose an identifier",
    "Choose a credential",
    "Done",
  ];
  const [modalError, setModalError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<Report | null>(null);
  const [errorUpload, setErrorUpload] = useState<string>("");
  const [submitResult, setSubmitResult] = useState<string>("");

  const { aids, client, setClient, handleCreateAgent, getSelectedAid } =
    useAutonomicIDContext();
  const { acdcs, handleSelectACDC, getSelectedAcdc } =
    useAuthenticChainedDataContainerContext();

  const dispatch = useAppDispatch();

  const currentStep = useAppSelector((state) => state.shared.value);
  const connectionStatus = useAppSelector((state) => state.shared.status);

  const aidOption = useAppSelector((state) => state.options.aidOption);
  const acdcOption = useAppSelector((state) => state.options.acdcOption);

  // Function to handle the API request and response

  // Function to perform the ping request

  // async function ping(): Promise<string> {
  //   const url = `${SERVER_URL}${pingPath}`;

  //   // Make the API request using the fetch function
  //   const response = await fetch(url);
  //   const responseData = await response.json();

  //   // Return the pong message
  //   return responseData;
  // }

  // Function to perform the login request
  async function login(aid: string, said: string, vlei: string): Promise<any> {
    const url = `${SERVER_URL}${LOGIN_PATH}`;

    // Create the request body object
    const requestBody = {
      aid,
      said,
      vlei,
    };

    // Make the API request using the fetch function
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    // Return the response data
    return responseData;
  }

  const toggleDrawer = (open: any) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    if (client !== undefined && connectionStatus !== "Connected") return;
    setOpen(false);
    setModalError("");
  }, [client, connectionStatus]);

  // const checkHeaderSignatures = async (aid: any, name: any) => {
  //   console.log("Checking header signatures");
  //   const response_signed = await client!.signedFetch(
  //     SERVER_URL,
  //     `${VER_SIG_PATH}`,
  //     "GET",
  //     null,
  //     name
  //   );
  //   const response_signed_data = await response_signed.json();
  //   console.log("header signature verification response", response_signed_data);
  // };

  const loginReal = async () => {
    const creds = client!.credentials();
    let vlei_cesr = await creds.get(aidOption, acdcOption, true);
    console.log("vlei cesr", vlei_cesr);

    let logged_in = await login(
      getSelectedAid()!.prefix,
      acdcOption,
      vlei_cesr
    );
    console.log("logged in result", logged_in);
    if (logged_in.aid === getSelectedAid()!.prefix) {
      dispatch(setStatus("Connected"));
      setModalError("");
      // await checkHeaderSignatures(getSelectedAid().prefix,getSelectedAid().name);
    } else if (JSON.stringify(logged_in).includes("Exception")) {
      dispatch(setStatus("Failed"));
      setModalError("Login Failed. Please pick different credential");
    } else {
      dispatch(setStatus("Connecting"));
      setModalError("Waiting for verificaiton");
    }
  };

  const renderComponent = useCallback(
    (componentName: any) => {
      //check if the client is not null then render the component otherwise set the drwar to true
      if (client === undefined || acdcOption === "") {
        setDrawerOpen(true);
        setModalError(`Please connect to the agent first`);
        setOpen(true);
        return;
      }
      setSelectedComponent(componentName);
    },
    [client, acdcOption]
  );

  const resetAidSelected = () => {
    dispatch(setStep(1));
    handleClickOpen();
    dispatch(resetAidOption());
    dispatch(resetAcdcOption());
    dispatch(setStatus("Connecting"));
    setModalError("Select a new identifier and credential");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "100vh",
        width: "100vw",
      }}
    >
      <AppBar position="fixed" sx={{ width: "100%" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(!drawerOpen)}
          >
            <Menu />
          </IconButton>
          <Box
            onClick={toggleDrawer(!drawerOpen)}
            sx={{
              ":hover": {
                cursor: "pointer",
              },
            }}
          >
            <Typography variant="h6">Menu</Typography>
          </Box>
          <Button
            sx={{
              marginLeft: "auto",
              backgroundColor: "lightblue",
              color: "black",
              "&:hover": {
                color: "white",
              },
            }}
            onClick={handleClickOpen}
            variant="contained"
            startIcon={
              <Circle
                sx={{
                  color:
                    connectionStatus === "Connected"
                      ? "green"
                      : connectionStatus === "Connecting"
                      ? "orange"
                      : "red",
                }}
              />
            }
          >
            {connectionStatus}
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
            {["Check Status", "Upload Report"].map((text, index) => (
              <ListItem
                key={text}
                onClick={() => renderComponent(text)}
                sx={{
                  "&:hover": {
                    backgroundColor: "lightblue",
                    cursor: "pointer",
                  },
                }}
              >
                {index === 0 ? (
                  <ListItemIcon>
                    {" "}
                    <GridViewIcon />{" "}
                  </ListItemIcon>
                ) : (
                  <ListItemIcon>
                    {" "}
                    <FileUpload />{" "}
                  </ListItemIcon>
                )}
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </div>
        {client != undefined && connectionStatus === "Connected" && (
          <div style={{ marginTop: "auto", textAlign: "center" }}>
            <Divider />
            <List>
              {[getSelectedAid(), getSelectedAcdc()].map((text, index) => (
                <Tooltip
                  title={
                    index == 0 ? (text as AID)!.prefix : (text as ACDC)!.sad.d
                  }
                  placement="right"
                  key={index == 0 ? "Identifier" : "Credential"}
                >
                  <ListItem
                    key={(text as AID)!.prefix}
                    onClick={() => renderComponent(text)}
                  >
                    {index === 0 ? (
                      <ListItemIcon>
                        {" "}
                        <FingerprintIcon />{" "}
                      </ListItemIcon>
                    ) : (
                      <ListItemIcon>
                        {" "}
                        <BadgeIcon />
                      </ListItemIcon>
                    )}
                    {index === 0 ? (
                      <ListItemText
                        primary={reduceString((text as AID)?.name)}
                      />
                    ) : (
                      <ListItemText
                        primary={reduceString(
                          (text as ACDC)?.sad.a.engagementContextRole
                        )}
                      />
                    )}
                  </ListItem>
                </Tooltip>
              ))}

              <ListItem
                key="picknew"
                disableGutters={true}
                disablePadding={true}
              >
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginX: 2, marginLeft: "25%" }}
                  onClick={() => {
                    resetAidSelected();
                  }}
                >
                  Refresh
                </Button>
              </ListItem>
            </List>
          </div>
        )}
      </Drawer>
      <Dialog open={open} onClose={handleClose} disableEscapeKeyDown={true}>
        <DialogTitle>
          <Button
            sx={{
              "&.Mui-disabled": {
                color: "black",
              },
            }}
            onClick={handleClickOpen}
            disabled={true}
            startIcon={
              <Circle
                sx={{
                  color:
                    connectionStatus === "Connected"
                      ? "green"
                      : connectionStatus === "Connecting"
                      ? "orange"
                      : "red",
                }}
              />
            }
          >
            {connectionStatus}
          </Button>
          <Tooltip title="Close" key={"close"}>
            <IconButton
              component="div"
              sx={{ position: "absolute", right: 10, top: 10 }}
              onClick={handleClose}
              disabled={client !== undefined && connectionStatus === "Failed"}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          {modalError !== "" && (
            <Alert
              severity={modalError.includes("agent") ? "error" : "warning"}
            >
              <Typography variant="body2">{modalError}</Typography>
            </Alert>
          )}
          <Stepper activeStep={currentStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {index === 0 && client === undefined && (
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
                        onClick={async () => {
                          await handleCreateAgent(passcode);
                        }}
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
                        value={aidOption}
                        onChange={(e) => dispatch(setAidOption(e.target.value))}
                      >
                        {aids.map((aid, index) => (
                          <Tooltip
                            title={aid.name}
                            placement="right"
                            key={aid.prefix}
                          >
                            <FormControlLabel
                              key={index}
                              value={aid.name}
                              control={<Radio />}
                              label={aid.name}
                            />
                          </Tooltip>
                        ))}
                      </RadioGroup>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={aidOption === ""}
                        onClick={async () => {
                          await handleSelectACDC();
                        }}
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
                        value={acdcOption}
                        onChange={(e) =>
                          dispatch(setAcdcOption(e.target.value))
                        }
                      >
                        {acdcs.map((acdc, index) => (
                          <Tooltip
                            title={acdc.sad.d}
                            placement="right"
                            key={acdc.sad.d}
                          >
                            <FormControlLabel
                              key={index}
                              value={acdc["sad"]["d"]}
                              control={<Radio />}
                              label={acdc.sad.a.engagementContextRole}
                            />
                          </Tooltip>
                        ))}
                      </RadioGroup>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={acdcOption === ""}
                        onClick={async () => {
                          dispatch(incrementStep());
                          await loginReal();
                        }}
                      >
                        Next
                      </Button>
                    </>
                  )}

                  {index === 3 && (
                    <>
                      {connectionStatus === "Connecting" && (
                        <CircularProgress sx={{ marginLeft: "35%" }} />
                      )}

                      <Box
                        display="flex"
                        justifyContent="center"
                        paddingTop={2}
                        //make the items inside of this with some space between them
                      >
                        {connectionStatus === "Failed" && (
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ m: 1 }}
                            onClick={() => {
                              resetAidSelected();
                            }}
                          >
                            Reset
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="error"
                          sx={{ m: 1 }}
                          disabled={
                            connectionStatus === "Connecting" ||
                            connectionStatus === "Failed"
                          }
                          onClick={() => {
                            dispatch(setStep(0));
                            setClient(null);
                            dispatch(resetAidOption());
                            dispatch(resetAcdcOption());
                            dispatch(setStatus("Connect"));
                            setPasscode("");
                            handleClose();
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
      {client === undefined && (
        <LandingComponent text="Welcome to EBA portal" />
      )}
      {selectedComponent === "Check Status" && client !== undefined && (
        <MyTable
          client={client}
          setSelectedComponent={setSelectedComponent}
          selectedAcdc={acdcOption}
          selectedAid={getSelectedAid()}
        />
      )}
      {selectedComponent === "Upload Report" && client !== undefined && (
        <DragAndDropUploader
          client={client}
          errorUpload={errorUpload}
          setErrorUpload={setErrorUpload}
          submitResult={submitResult}
          setSubmitResult={setSubmitResult}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          setSelectedComponent={setSelectedComponent}
          resetAidSelected={resetAidSelected}
          selectedAcdc={acdcOption}
          selectedAid={getSelectedAid()}
        />
      )}
    </Box>
  );
};

//write a function that takes a string and adds ellipses to it if it is too long in the middle of the string, only show 4 characters on each side of the ellipses
const reduceString = (str: string) => {
  if (str.length > 40) {
    //TODO change to smaller number
    return str.slice(0, 6) + "..." + str.slice(str.length - 6, str.length);
  }
  return str;
};

interface TextComponentProps {
  text: string;
}

// const TextComponent: React.FC<TextComponentProps> = ({ text }) => (
//   <Grid item xs={1} lg={1} left={"50%"}>
//     <Box>
//       <Typography> {text}</Typography>
//     </Box>
//   </Grid>
// );

const LandingComponent: React.FC<TextComponentProps> = ({ text }) => (
  <Grid item xs={1} lg={1} left={"50%"}>
    <Box textAlign={"center"}>
      <Typography variant="h1">{text}</Typography>
      <br />
      <Divider />
      <br />
      <br />
      <Typography variant="h5">
        Please start by connecting using the button in the top right.
      </Typography>
    </Box>
  </Grid>
);

interface DragAndDropUploaderProps {
  client: SignifyClient;
  errorUpload: any;
  setErrorUpload: (error: string) => void;
  submitResult: string;
  setSubmitResult: (result: string) => void;
  selectedFile: Report | null;
  setSelectedFile: (file: Report | null) => void;
  setSelectedComponent: (component: any) => void;
  resetAidSelected: () => void;
  selectedAid: AID | undefined;
  selectedAcdc: any;
}

const DragAndDropUploader: React.FC<DragAndDropUploaderProps> = ({
  client,
  errorUpload,
  setErrorUpload,
  submitResult,
  setSubmitResult,
  selectedFile,
  setSelectedFile,
  setSelectedComponent,
  // resetAidSelected,
  selectedAid,
  selectedAcdc,
}) => {
  useEffect(() => {
    setErrorUpload("");
    setSelectedFile(null);
    setSubmitResult("");
  }, []);

  const setFile = (file: any) => {
    const acceptedTypes = [
      "application/zip",
      "application/x-zip-compressed",
      "multipart/x-zip",
      "application/zip-compressed",
      "application/octet-stream",
    ];

    if (!acceptedTypes.includes(file.type)) {
      setSelectedFile(null);
      setErrorUpload(
        `${file.name} is not a zip file. \n Please select a zip file.`
      );
      setSubmitResult("");
      return;
    }
    setErrorUpload("");
    setSubmitResult("");
    setSelectedFile(file);
  };
  const handleFileSelect = (event: any) => {
    let file = event.target.files[0];
    setFile(file);
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    let file = event.dataTransfer.files[0];
    setFile(file);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  // Function to perform the upload request
  async function upload(
    aid: AID,
    said: string,
    report: Report | null
  ): Promise<any> {
    const formData = new FormData();
    formData.append("upload", report!.filename);

    // // Send signed request
    console.log("Form data is", formData.get("upload"));
    const response_signed = await client.signedFetch(
      SERVER_URL,
      `${UPLOAD_PATH}/${aid.prefix}/${said}`,
      "POST",
      formData,
      aid.name
    );
    const response_signed_data = await response_signed.json();
    console.log("upload response", response_signed_data);

    // Return the response data
    return response_signed_data;
  }

  const handleSubmit = async () => {
    // Add your upload logic her
    setSubmitResult("uploading");
    //wait 2 seconds
    //await new Promise(r => setTimeout(r, 2000));
    await upload(selectedAid!, selectedAcdc, selectedFile);

    setSubmitResult(`done|${selectedFile!.filename}`);
    // await new Promise(r => setTimeout(r, 2000));
    // setSubmitResult(`fail|${selectedFile.name}` )
    setSelectedFile(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // justifyContent: 'center',
        gap: 2,
        height: "80%",
      }}
    >
      <Typography variant="h4">Upload your report</Typography>

      {errorUpload !== "" && <Alert severity="error">{errorUpload}</Alert>}

      {submitResult.split("|")[0] === "fail" && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setSubmitResult(""), setSelectedComponent("Check Status");
              }}
            >
              Check Status
            </Button>
          }
        >
          Failed submitted the report {submitResult.split("|")[1]}
        </Alert>
      )}

      {submitResult.split("|")[0] === "done" && (
        <Alert
          severity="success"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setSubmitResult(""), setSelectedComponent("Check Status");
              }}
            >
              Check Status
            </Button>
          }
        >
          Successfuly submitted the report {submitResult.split("|")[1]}
        </Alert>
      )}

      {submitResult === "uploading" && (
        <Alert severity="info">Uploading {selectedFile?.filename}</Alert>
      )}

      {errorUpload === "" && selectedFile !== null && submitResult === "" && (
        <Alert severity="success">
          Succesfully loaded report {selectedFile.filename}
          {<br />}
          Submit your report next.
        </Alert>
      )}
      <Box
        sx={{
          width: "100%",
          height: "200px",
          border: "2px dashed gray",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          p: 1,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {selectedFile ? (
          <>
            <UploadFile /> <p>Selected File: {selectedFile.filename}</p>
          </>
        ) : (
          <>
            <UploadFile />
            <p>
              Drag and drop a file here or <br /> click the button to select a
              file.
            </p>
          </>
        )}
        <input
          type="file"
          id="file-input"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        <label htmlFor="file-input">
          <Button variant="contained" component="span">
            Select File
          </Button>
        </label>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={async () => {
          await handleSubmit();
        }}
        disabled={!selectedFile}
      >
        Submit Report
      </Button>
    </Box>
  );
};

export default MainComponent;
