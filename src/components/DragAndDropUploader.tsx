import { useCallback, useEffect } from "react";
import { SignifyClient } from "signify-ts";

import { UploadFile } from "@mui/icons-material";
import { Alert, Box, Button, Typography } from "@mui/material";
import { SERVER_URL, UPLOAD_PATH } from "../constants";
import { AID, Report } from "../types";


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
  
    const setFile = useCallback((file: any) => {
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
    }, [setSelectedFile, setSubmitResult, setErrorUpload]);


    const handleFileSelect = useCallback((event: any) => {
      let file = event.target.files[0];
      setFile(file);
    }, [setFile]);
  
    const handleDrop = useCallback((event: any) => {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      setFile(file);
    }, [setFile]);
  
    const handleDragOver = useCallback((event: any) => {
      event.preventDefault();
    }, []);
  
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
  
    const handleSubmit = useCallback(async () => {
      // Add your upload logic her
      setSubmitResult("uploading");
      //wait 2 seconds
      //await new Promise(r => setTimeout(r, 2000));
      await upload(selectedAid!, selectedAcdc, selectedFile);
  
      setSubmitResult(`done|${selectedFile!.filename}`);
      // await new Promise(r => setTimeout(r, 2000));
      // setSubmitResult(`fail|${selectedFile.name}` )
      setSelectedFile(null);
    }, [selectedAid, selectedAcdc, selectedFile]);
  
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

  export default DragAndDropUploader;