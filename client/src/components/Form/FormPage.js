import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormView from "./FormView";

const FormPage = () => {
    const [issueMode, setIssueMode] = useState("one"); 
    
    let { id } = useParams();
    console.log(id);

    return (
        <Grid container direction="column" justifyContent="center" alignItems="center">
            <Typography variant="h3">Form</Typography>
            <Box sx={{ width: "100%", typography: "body1" }}>
                <FormView />
            </Box>
        </Grid>
    );
};

export default FormPage;