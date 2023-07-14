import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { Button, Alert } from "@mui/material"
import SelectedList from "./SelectedList";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useFetch from "../../hooks/useFetch";
import apiConstants from "../../constants/api";
import CredentialViewer from "./CredentialViewer";
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import { rsaDecrypt, convertPrivateKeyToRSAKey } from "../../lib/crypto_lib";

const HoldersPage = () => {    
    const [selectedCred, setSelectedCred] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openCredDialog, setOpenCredDialog] = useState(false);
    const [privateKey, setPrivateKey] = useState("");
    const [listCred, setListCred] = useState(null);
    const [credJson, setCredJson] = useState(null);

    const [getCreds, gettingCred, getCredError] = useFetch();
    
    useEffect(() => {
        const getCredentials = async () => {
            const credResponse = await getCreds(`${apiConstants.BASE_API_URL}/api/my-credentials/holding-credentials`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.token}`
                },
            });
            console.log(credResponse.data);
            setListCred(credResponse.data);
        } 
        getCredentials();
    }, []);

    const onSelectCred = (cred) => {
        setSelectedCred(cred);
        setOpenDialog(true);
    }

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleCredClose = () => {
        setOpenCredDialog(false);
    }

    const handleDecrypt = () => {
        var privateKeyText = privateKey;
        const rsaPrivateKey = convertPrivateKeyToRSAKey(privateKeyText);
        const decrypted = rsaDecrypt(rsaPrivateKey, selectedCred.holderPayload);
        handleClose();
        if (decrypted !== "false") {
            var json = JSON.parse(decrypted);
            console.log(json);
            setCredJson(json);
            setOpenCredDialog(true);
        }
        else {
            alert("Invalid private key!");
        }
    }

    return (
        <Box sx={{ width: "100%", typography: "body1" }}>
            {listCred !== null &&
                <SelectedList onSelectCred={onSelectCred} listCred={listCred}/>
            }
            {Array.isArray(listCred) && listCred.length === 0 &&
                <Alert severity="info">You have no credentials</Alert>
            }
            <Dialog open={openDialog} onClose={handleClose}>
                <DialogTitle>Holder's Private Key</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Please enter private key to decrypt the selected credential
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Holder's private key"
                    type="password"
                    fullWidth
                    variant="standard"
                    onChange={(event) => setPrivateKey(event.target.value)}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleDecrypt}>Decrypt</Button>
                </DialogActions>
            </Dialog>
            <CredentialViewer open={openCredDialog} scroll="paper" handleClose={handleCredClose}>
                <JsonView data={credJson} shouldInitiallyExpand={(level) => true} style={defaultStyles} />
            </CredentialViewer>
        </Box>
    );
};

export default HoldersPage;