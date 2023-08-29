import { Box, Divider, Grid, Typography } from "@mui/material";

interface TextComponentProps {
  text: string;
}

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

export default LandingComponent;
