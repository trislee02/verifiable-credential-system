import React, { useState } from "react";
import moment from "moment";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from "@mui/material/CircularProgress";
import { issueVC, verifyValidVC } from "../../lib/vc_protocol";
import { verifyKeyPair, rsaDecrypt, convertPrivateKeyToRSAKey } from "../../lib/crypto_lib";
import { useSelector } from "react-redux";
import { getPublicCredential } from "../../lib/vc";
import apiConstants from "../../constants/api";
import useFetch from "../../hooks/useFetch";

const IssueOne = () => {
    const user = useSelector(store => store.authSlice.user);
    const token = useSelector(store => store.authSlice.jwt);

    const [holderIdentifier, setHolderIdentifier] = useState("");
    const [issuerPrivateKey, setIssuePrivateKey] = useState("");
    const [credentialFields, setCredentialFields] = useState([{ key: "", value: "", error: false, helperText: "" }]);
    const [expirationDate, setExpirationDate] = useState(new Date());

    const [holderIdentifierValidate, setHolderIdentifierValidate] = useState({ error: false, helperText: "" });
    const [issuerPrivateKeyValidate, setIssuerPrivateKeyValidate] = useState({ error: false, helperText: "" });
    const [issueState, setIssueState] = useState({ state: null, message: "" });

    const [issueFetch, isIssueFetching] = useFetch().slice(0, 2);

    const [publicCred, setPublicCred] = useState(null);

    const validateHolderIdentifier = (value) => {
        if (!value || value.trim().length === 0) {
            setHolderIdentifierValidate({ error: true, helperText: "Holder's Identifier is required!" });
            return false;
        }
        setHolderIdentifierValidate({ error: false, helperText: "" });
        return true;
    }

    const validateIssuerPrivateKey = (value) => {
        if (!value || value.trim().length === 0) {
            setIssuerPrivateKeyValidate({ error: true, helperText: "Issuer's Private Key is required!" });
            return false;
        }
        setIssuerPrivateKeyValidate({ error: false, helperText: "" });
        return true;
    }

    const onFieldKeyChange = (index, newKey) => {
        setCredentialFields((prev) => {
            if (index < 0 || index >= prev.length) return;
            let cloned = [...prev];
            cloned[index].key = newKey;
            if (cloned.filter((field) => field.key.trim() === newKey.trim()).length > 1) {
                cloned[index].error = true;
                cloned[index].helperText = "WARNING! This field's name is duplicated! All the above fields with the same name will be overwritten!";
            } else if (!/^[a-zA-Z0-9_-]+$/.test(newKey)) {
                cloned[index].error = true;
                cloned[index].helperText = "Field's name only accepts alphanumeric characters, hyphen, and underscore!";
            } else {
                cloned[index].error = false;
                cloned[index].helperText = "";
            }
            return cloned;
        });
    };

    const onFieldValueChange = (index, newValue) => {
        setCredentialFields((prev) => {
            if (index < 0 || index >= prev.length) return;
            let cloned = [...prev];
            cloned[index].value = newValue;
            return cloned;
        });
    };

    const onAddField = () => {
        setCredentialFields((prev) => {
            let cloned = [...prev];
            cloned.push({ key: "", value: "" });
            return cloned;
        });
    };

    const onDeleteField = (index) => {
        setCredentialFields((prev) => {
            if (index < 0 || index >= prev.length) return;
            let cloned = [...prev];
            cloned.splice(index, 1);
            return cloned;
        });
    };

    const onIssue = async () => {
        if (!user || !token) return;
        
        // Get credential subject (remove fields which has error)
        let fields = credentialFields.filter((field) => !field.error && field.key.trim().length > 0);
        let credential = {};
        for (const field of fields) credential[field.key] = field.value;
        
        // Call API to check if holder's identifier is valid and get holder's public key
        const holder = await getHolder();
        if (!holder) return;

        // Issue
        issue(user.username, user.publicKey, holder.publicKey, holder.id, credential);
    };

    const issue = async (issuerIdentifier, issuerPublicKey, holderPublicKey, holderId, credentialSubject) => {
        try {
            if (!validateHolderIdentifier(holderIdentifier) || 
                !validateIssuerPrivateKey(issuerPrivateKey) ||
                !(expirationDate && expirationDate instanceof Date && expirationDate.toString() !== "Invalid Date")) throw new Error("Missing information!");
            
            try {
                if (!verifyKeyPair(issuerPrivateKey, issuerPublicKey)) {
                    setIssuerPrivateKeyValidate({ error: true, helperText: "Issuer's private key and public key not match!" });
                    throw new Error("Issuer's keys not match!");
                }
            } catch (error) {
                setIssuerPrivateKeyValidate({ error: true, helperText: "Issuer's private key and public key not match!" });
                throw new Error("Issuer's keys not match!");
            }

            const fullCredential = await issueVC({
                issuer: issuerIdentifier,
                holder: holderIdentifier,
                issuerPublicKey: issuerPublicKey,
                issuerPrivateKey: issuerPrivateKey,
                holderPublicKey: holderPublicKey,
                expirationDate: expirationDate.toISOString(),
                credentialSubject: {...credentialSubject},
            });

            if (!verifyValidVC(fullCredential)) throw new Error();
            
            const publicCredential = getPublicCredential(fullCredential);

            // Get & reply challenge from server
            const challenge = await getChallenge();
            const challengeReply = rsaDecrypt(convertPrivateKeyToRSAKey(issuerPrivateKey), challenge);
            if (!challengeReply) throw new Error();

            // Save public credential to server
            await saveCredentialToServer(publicCredential, holderId, challengeReply);

            setIssueState({ state: "success", message: JSON.stringify(publicCredential) });
            setPublicCred(publicCredential);

        } catch (error) {
            const message = (error && error.message) ? error.message : "An error occurred while issuing! Re-check your inputs and try again!";
            setIssueState({ state: "error", message: message });
            return;
        }
    }

    const saveCredentialToServer = async (publicCredential, holderId, replyingChallenge) => {
        console.log({
            credentials: publicCredential,
            replyingChallenge: replyingChallenge
        });
        const responseData = await issueFetch(`${apiConstants.BASE_API_URL}/api/credentials`, {
            method: "POST",
            body: JSON.stringify({
                credentials: [
                    {
                        holder: publicCredential.holderId,
                        holderPayload: publicCredential.encryptedData,
                        issuerPayload: publicCredential.encryptedDataForIssuer,
                        expirationDate: publicCredential.expirationDate,
                        issuanceDate: publicCredential.issuanceDate,
                        proof: publicCredential.proof,
                        payload: publicCredential,
                        holder: holderId
                    }
                ],
                replyingChallenge: replyingChallenge
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if (!responseData) throw new Error();
    }

    const getChallenge = async () => {
        const challengeResponseData = await issueFetch(`${apiConstants.BASE_API_URL}/api/my-credentials/challenge`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!challengeResponseData) throw new Error();
        return challengeResponseData.data.challenge;
    }

    const getHolder = async () => {
        const holder = await issueFetch(`${apiConstants.BASE_API_URL}/api/u?identifier=${holderIdentifier}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!holder) {
            setHolderIdentifierValidate({ error: true, helperText: "This holder doesn't exist!"});
            return null;
        }
        return holder;
    }

    const downloadPublicCredential = () => {
        if (!publicCred) return;
        const link = document.createElement("a");
        link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(publicCred))}`;
        link.download = "credential.json";
        link.click();
    }

    const disableIssueButton = (
        holderIdentifierValidate.error || 
        holderIdentifier.trim().length === 0 ||
        issuerPrivateKeyValidate.error || 
        issuerPrivateKey.trim().length === 0 ||
        credentialFields.filter(field => field.error).length > 0
    );

    return (
        <Box sx={{ marginInline: "5vw", display: "flex", justifyContent: "center" }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        value={holderIdentifier} onChange={(event) => setHolderIdentifier(event.target.value)} 
                        error={holderIdentifierValidate.error} helperText={holderIdentifierValidate.helperText} 
                        onBlur={event => validateHolderIdentifier(event.target.value)} 
                        label="Holder's identifier" variant="filled" fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        value={issuerPrivateKey} onChange={(event) => setIssuePrivateKey(event.target.value)} 
                        error={issuerPrivateKeyValidate.error} helperText={issuerPrivateKeyValidate.helperText} 
                        onBlur={event => validateIssuerPrivateKey(event.target.value)}
                        label="Issuer's Private Key" variant="filled" type="password" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <TextField variant="filled" label="Expiration Date" value={moment(expirationDate).format("YYYY-MM-DD")} onChange={(event) => setExpirationDate(new Date(event.target.value))} inputProps={{ type: 'date' }} fullWidth required/>
                </Grid>
                <Grid item xs={12}>
                    {credentialFields.map((obj, index) => {
                        return (
                            <Box key={index} sx={{ display: "flex", gap: "10px", alignItems: "center", minHeight: "75px", minWidth: "70vw", maxWidth: "90vw" }}>
                                <TextField label="Field's name" value={obj.key} onChange={(event) => onFieldKeyChange(index, event.target.value)} sx={{ padding: "0px !important;", flex: 1, alignSelf: "flex-start" }} error={obj.error} helperText={obj.helperText} />
                                <TextField label="Value" value={obj.value} onChange={(event) => onFieldValueChange(index, event.target.value)} sx={{ padding: "0px !important;", flex: 1, alignSelf: "flex-start" }} />
                                <Button variant="contained" endIcon={<AddBoxIcon />} sx={{ height: "50px", width: "auto", alignSelf: "flex-start" }} onClick={onAddField}>
                                    <Typography sx={{ display: { xs: "none", md: "inline" } }}>Add</Typography>
                                </Button>
                                <Button variant="contained" color="error" endIcon={<DeleteIcon />} sx={{ height: "50px", width: "auto", alignSelf: "flex-start" }} onClick={() => onDeleteField(index)}>
                                    <Typography sx={{ display: { xs: "none", md: "inline" } }}>Delete</Typography>
                                </Button>
                            </Box>
                        );
                    })}
                    {credentialFields.length === 0 && (
                        <Button variant="contained" endIcon={<AddBoxIcon />} sx={{ height: "50px", width: "auto" }} onClick={onAddField}>
                            Add Field
                        </Button>
                    )}
                </Grid>
                { issueState.state === "error" && <Grid item xs={12}>
                    <Alert severity="error" onClose={() => setIssueState({ state: null, message: "" })}>
                        <AlertTitle>Error</AlertTitle>
                        {issueState.message}
                    </Alert>
                </Grid>}
                { issueState.state === "success" && <Grid item xs={12}>
                    <Alert severity="success" action={
                        <Box sx={{ display: "flex", flexDirection: "column"}}>
                            <Button color="inherit" onClick={() => setIssueState({ state: null, message: "" })}>
                                CLOSE
                            </Button>
                            <Button color="inherit" onClick={downloadPublicCredential}>
                                DOWNLOAD
                            </Button>
                        </Box>
                    }>
                        <AlertTitle>Issued Successfully</AlertTitle>
                        {issueState.message}
                    </Alert>
                </Grid>}
                <Grid item xs={12}>
                    <Button variant="contained" sx={{ width: "100%", padding: "10px 0px" }} onClick={onIssue} disabled={disableIssueButton}>
                        { !isIssueFetching && "Issue" }
                        { isIssueFetching && <CircularProgress color="inherit" /> }
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default IssueOne;
