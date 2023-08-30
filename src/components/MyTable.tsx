import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { SERVER_URL, STATUS_PATH } from "../constants";
import { AID, Report } from "../types";
import { SignifyClient } from "signify-ts";

interface MyTableProps {
  client: SignifyClient;
  setSelectedComponent: any;
  selectedAid: AID | undefined;
  selectedAcdc: string | null;
}
const MyTable: React.FC<MyTableProps> = ({
  client,
  setSelectedComponent,
  selectedAid,
  // selectedAcdc,
}) => {
  const [data, setData] = useState<Array<any>>();
  const [selectedReport, setSelectedReport] = useState<Report | undefined>(
    undefined
  );
  const [openModalTable, setOpenModalTable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const _fakedata: Report[] = [
    {
      filename: "File 1",
      size: "10 MB",
      message: "last update 2023-06-01",
      status: "Uploaded",
    },
    {
      filename: "File 2",
      size: "5 MB",
      message: "last update 2023-06-02",
      status: "Failed",
    },
    {
      filename: "File 3",
      size: "2 MB",
      message: "last update 2023-06-03",
      status: "Uploaded",
    },
    {
      filename: "File 4",
      size: "1 MB",
      message: "last update 2023-06-04",
      status: "Processing",
    },
  ];
  useEffect(() => {
    // Simulating fetch request
    const fetchData = async () => {
      try {
        // Replace this with your actual fetch URL
        setLoading(true);
        let d = await checkUpload(selectedAid!);
        console.log("Response data is type and data", typeof d, d);
        let newData = new Set<any>();
        let statuses = Object.keys(d).map((item: any) => {
          return d[item].map((status: any) => {
            newData.add(status);
          });
        });
        console.log(
          "Status data converted type and data",
          typeof statuses,
          statuses
        );
        console.log(
          "New data converted type and data",
          typeof newData,
          newData
        );
        setData(Array.from(newData));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setOpenModalTable(true);
  };

  const handleCloseModal = () => {
    setOpenModalTable(false);
  };

  // Function to perform the upload request
  async function checkUpload(aid: AID): Promise<any> {
    // // Send signed request
    const response_signed = await client.signedFetch(
      SERVER_URL,
      `${STATUS_PATH}/${aid.prefix}`,
      "GET",
      null,
      aid.name
    );
    const response_signed_data = await response_signed.json();
    console.log(response_signed_data);
    return response_signed_data;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "80%",
        gap: 2,
      }}
    >
      <Typography variant="h4">Check Status</Typography>
      {loading && (
        <CircularProgress
          sx={{
            margin: "auto",
          }}
        />
      )}

      {(!data || data.length == 0) && !loading && (
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setSelectedComponent("Upload Report");
              }}
            >
              Upload Report
            </Button>
          }
        >
          You don't have any reports yet.
        </Alert>
      )}
      {data && !loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item: any) => (
                <TableRow
                  key={item.filename}
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell>
                    {item.filename == undefined
                      ? "unknown"
                      : item.filename.substring(0, 75)}
                  </TableCell>
                  <TableCell>
                    {item.size == undefined ? "unknown" : item.size}
                  </TableCell>
                  <TableCell
                    style={
                      item.status === "verified"
                        ? { color: "green" }
                        : item.status === "failed"
                        ? { color: "red" }
                        : { color: "yellow" }
                    }
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </TableCell>
                  <TableCell>
                    {item.message == undefined
                      ? "unknown"
                      : item.message.substring(0, 75)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal open={openModalTable} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#348ceb",
            boxShadow: 24,
            p: 4,
            minWidth: 275,
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {selectedReport && (
            <>
              <Typography variant="h6" gutterBottom>
                Report Details
              </Typography>
              <Typography variant="body1" gutterBottom>
                Filename: {selectedReport.filename}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Size: {selectedReport.size}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Status: {selectedReport.status}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Message: {selectedReport.message}
              </Typography>
            </>
          )}
        </Box>
      </Modal>

      {!loading && (
        <Fab
          color="primary"
          aria-label="add"
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={async () => {
            setData(_fakedata);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default MyTable;
