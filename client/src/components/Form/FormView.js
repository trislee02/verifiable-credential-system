import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Typography, Alert } from "@mui/material";
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import CredentialSelection from "./CredentialSelection";

const FormView = () => {
    const [issuerPrivateKey, setIssuePrivateKey] = useState("");
    const [json, setJson] = useState(null);

    const [open, setOpen] = useState(false);
    const [cred, setCred] = useState("");

    const [unencrypted, setUnencrypted] = useState(false);
    const [accepted, setAccepted] = useState(null);

    const JSONChangedHandler = (event) => {
        if (event.target.files.length) {
            const inputFile = event.target.files[0];
            const reader = new FileReader();
            reader.onload = async ({ target }) => {
                var json = JSON.parse(target.result);
                console.log(json);
                setJson(json);
                setCred("");
                setUnencrypted(true);
            };
            reader.readAsText(inputFile);
        }
    };

    const onSelectCredential = () => {
        setOpen(true);
    };

    const handleClose = (newValue) => {
        console.log(newValue);
        setOpen(false);
    
        if (newValue) {
          setCred(newValue);
          setJson(null);
          setUnencrypted(false);
        }
      };

    const onSubmit = () => {
        setAccepted(true);
    };

    return (
        <Box sx={{ marginInline: "5vw", display: "flex", justifyContent: "center" }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField value="fadf1f3a1e54451f5a1df11f3e1321" 
                               onChange={(event) => setIssuePrivateKey(event.target.value)} 
                               id="issuer" 
                               label="Verifier's Public Key" 
                               variant="filled" 
                               type="password" fullWidth
                               disabled/>
                </Grid>

                {!unencrypted && (
                    <Grid item xs={12}>
                        <TextField value={issuerPrivateKey} 
                                onChange={(event) => setIssuePrivateKey(event.target.value)} 
                                id="issuer" 
                                label="Holder's Private Key" 
                                variant="filled" 
                                type="password" fullWidth required />
                    </Grid>
                )}
                {cred !== "" && (
                    <Grid item xs={12}>
                        <Typography variant="subtitle">Selected credential: {cred}</Typography>
                    </Grid>
                )}
                {json !== null && (
                    <Grid item xs={12}>
                        <JsonView data={json} shouldInitiallyExpand={(level) => true} style={defaultStyles} />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Button variant="outlined" component="label" fullWidth>
                        Upload raw JSON File
                        <input type="file" accept=".json" onChange={JSONChangedHandler} hidden />
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="outlined" component="label" fullWidth
                            onClick={onSelectCredential}>
                        Choose existing credential
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" fullWidth sx={{ padding: "10px 0px" }} onClick={onSubmit}>
                        Submit
                    </Button>
                </Grid>
                {accepted !== null && accepted === true && (
                    <Grid item xs={12}>
                        <Alert severity="success">Valid credential</Alert>
                    </Grid>
                )}
                {accepted !== null && accepted === false && (
                    <Grid item xs={12}>
                        <Alert severity="error">Invalid credential</Alert>
                    </Grid>
                )}

                
            </Grid>
            <CredentialSelection 
                id="ringtone-menu"
                keepMounted
                open={open}
                onClose={handleClose}
                valueProp={cred}/>
        </Box>
    );
};

export default FormView;
