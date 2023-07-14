import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box, Alert } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormView from "./FormView";
import useFetch from "../../hooks/useFetch";
import apiConstants from "../../constants/api";

const FormPage = () => {
    const [issueMode, setIssueMode] = useState("one"); 
    
    const [getForm, isGettingForm, getFormError] = useFetch();

    let { id } = useParams();
    console.log(id);

    useEffect(() => {
        const getMyForm = async () => {
            const credResponse = await getForm(`${apiConstants.BASE_API_URL}/api/forms/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.token}`
                },
            });
            if (credResponse !== null && getFormError === null)
                console.log(credResponse.data);
        } 
        getMyForm();
    }, []);

    return (
        <>
            { getFormError && 
                <Alert severity="error">{getFormError}</Alert>
            }
            { !getFormError && 
                <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Typography variant="h3">Form</Typography>
                    <Box sx={{ width: "100%", typography: "body1" }}>
                        <FormView />
                    </Box>
                </Grid>
            }
        </>
    );
};

export default FormPage;