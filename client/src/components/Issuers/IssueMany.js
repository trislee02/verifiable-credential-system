import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from "@mui/material/CircularProgress";
import { JsonView, defaultStyles } from 'react-json-view-lite';
import Papa from "papaparse";
import { useSelector } from "react-redux";
import useFetch from "../../hooks/useFetch";
import apiConstants from "../../constants/api";
import { convertPrivateKeyToRSAKey, rsaDecrypt, verifyKeyPair } from "../../lib/crypto_lib";
import moment from "moment";
import { issueVC, verifyValidVC } from "../../lib/vc_protocol";
import { getPublicCredential } from "../../lib/vc";

const IssueMany = () => {
    const [issuerPrivateKey, setIssuePrivateKey] = useState("");
    const [issuerPrivateKeyValidate, setIssuerPrivateKeyValidate] = useState({ error: false, helperText: "" });
    const [expirationDate, setExpirationDate] = useState(new Date());
    const [csv, setCsv] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [issueState, setIssueState] = useState({ state: null, message: "" });
    const [publicCredentials, setPublicCredentials] = useState([]);

    const [issueFetch, isIssueFetching] = useFetch().slice(0, 2);

    const user = useSelector(store => store.authSlice.user);
    const jwt = useSelector(store => store.authSlice.jwt);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const validateIssuerPrivateKey = (value) => {
        // Check if issuer private key not empty
        if (!value || value.trim().length === 0) {
            setIssuerPrivateKeyValidate({ error: true, helperText: "Issuer's Private Key is required!" });
            return false;
        }

        // Check if issuer private key and public match
        try {
            if (!verifyKeyPair(issuerPrivateKey, user.publicKey)) throw new Error();
        } catch (error) {
            setIssuerPrivateKeyValidate({ error: true, helperText: "Issuer's Private Key and Public Key not match!" });
            return false;
        }

        setIssuerPrivateKeyValidate({ error: false, helperText: "" });
        return true;
    }

    const CSVChangedHandler = (event) => {
        if (event.target.files.length) {
            const inputFile = event.target.files[0];
            const reader = new FileReader();
            reader.onload = async ({ target }) => {
                const csv = Papa.parse(target.result, { header: true });
                const parsedData = csv?.data;
                setCsv(parsedData);
            };
            reader.readAsText(inputFile);
        }
    };

    const onIssue = async () => {
        try {
            if (!user || !jwt) throw new Error("Authentication Error! Re-login and try again!");
            if (csv.length <= 0) throw new Error("CSV Data is required!");

            // Check for holder's identifier column in the CSV
            const keysMustInclude = ["holder", "holder_email", "holder_username"];
            const includedIdentifiers = Object.keys(csv[0]).filter(key => keysMustInclude.includes(key));
            if (includedIdentifiers.length !== 1) {
                setIssueState({ state: "error", message: 'CSV must has one and only one of these columns: "holder", "holder_email", "holder_username"' })
                return;
            }

            // Validate issuer's private key & Expiration Date
            if (!validateIssuerPrivateKey(issuerPrivateKey)) throw new Error();
            if (!(expirationDate && expirationDate instanceof Date && expirationDate.toString() !== "Invalid Date")) throw new Error("Missing Expiration Date!");

            const holderIncludedIdentifier = includedIdentifiers[0];
            let localPublicCredentials = [];
            for (let i = 0; i < csv.length; i++) {
                const item = csv[i];

                // Check holder existence
                const holderIdentifier = item[holderIncludedIdentifier];
                if (!holderIdentifier) continue;
                const holder = await getHolder(holderIdentifier);
                if (!holder) throw new Error(`Row #${i}: HOLDER ${holderIdentifier} DOES NOT EXIST`);

                // Issue this credentials
                let credentialSubject = {...item};
                delete credentialSubject[holderIncludedIdentifier];
                try {
                    const publicCredential = await issue(holderIdentifier, holder.publicKey, credentialSubject);
                    localPublicCredentials.push({ ...publicCredential, holderId: holder.id });

                } catch (error) {
                    let message = "An error occurred while issuing! Re-check your inputs and try again!";
                    if (error && error.message) message = error.message;
                    setIssueState({ state: "error", message: `Row #${i}: ${message}` });
                    return;
                }
            }

            // Get & reply challenge from server
            const challenge = await getChallenge();
            if (!challenge) throw new Error('An error occurred while contacting with server! Re-login and try again!');
            const challengeReply = rsaDecrypt(convertPrivateKeyToRSAKey(issuerPrivateKey), challenge);
            if (!challengeReply) throw new Error('An error occurred while contacting with server! Re-login and try again!');

            // Save issued public credentials to server
            await saveCredentialToServer(challengeReply, localPublicCredentials);
            
            setPublicCredentials(localPublicCredentials);
            setIssueState({ state: "success", message: JSON.stringify(localPublicCredentials) });

        } catch (error) {
            let message = "An error occurred while issuing! Re-check your inputs and try again!";
            if (error && error.message) message = error.message;
            setIssueState({ state: "error", message: message });
        }
    };

    const issue = async (holderIdentifier, holderPublicKey, credentialSubject) => {
        const fullCredential = await issueVC({
            issuer: user.username,
            holder: holderIdentifier,
            issuerPublicKey: user.publicKey,
            issuerPrivateKey: issuerPrivateKey,
            holderPublicKey: holderPublicKey,
            expirationDate: expirationDate.toISOString(),
            credentialSubject: {...credentialSubject},
        });
        if (!verifyValidVC(fullCredential)) throw new Error();
        const publicCredential = getPublicCredential(fullCredential);
        return publicCredential;
    }

    const getHolder = async (identifier) => {
        const holder = await issueFetch(`${apiConstants.BASE_API_URL}/api/u?identifier=${identifier}`, {
            headers: { "Authorization": `Bearer ${jwt}` }
        });
        return holder;
    }

    const getChallenge = async () => {
        const challengeResponseData = await issueFetch(`${apiConstants.BASE_API_URL}/api/my-credentials/challenge`, {
            headers: { 'Authorization': `Bearer ${jwt}` }
        });
        if (!challengeResponseData) return null;
        return challengeResponseData.data.challenge;
    }

    const saveCredentialToServer = async (replyingChallenge, publicCredentials) => {
        // console.log("HELLO", publicCredentials);
        if (publicCredentials.length <= 0) return;
        const responseData = await issueFetch(`${apiConstants.BASE_API_URL}/api/credentials`, {
            method: "POST",
            body: JSON.stringify({
                credentials: publicCredentials.map(publicCredential => {
                    return {
                        payload: publicCredential,
                        holder: publicCredential.holderId,
                        holderPayload: publicCredential.encryptedData,
                        issuerPayload: publicCredential.encryptedDataForIssuer,
                        expirationDate: publicCredential.expirationDate,
                        issuanceDate: publicCredential.issuanceDate,
                        proof: publicCredential.proof,
                    }
                }),
                replyingChallenge: replyingChallenge
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`
            }
        });
        // console.log("resData", responseData);
        if (!responseData) throw new Error("Cannot save issued credentials to server!");
    }

    const downloadPublicCredentials = () => {
        if (!publicCredentials) return;
        const link = document.createElement("a");
        link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(publicCredentials))}`;
        link.download = "credentials.json";
        link.click();
    }

    let columns = [];
    if (csv && csv[0])
        columns = Object.keys(csv[0]).map((key) => {
            return {
                id: key,
                name: key,
                label: key,
                minWidth: 100,
                align: "left",
            };
        });

    const rows = csv ? csv : [];

    // console.log("public credentials", publicCredentials);

    return (
        <Box sx={{ marginInline: "5vw", display: "flex", justifyContent: "center" }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField value={issuerPrivateKey} onChange={(event) => setIssuePrivateKey(event.target.value)} onBlur={(event) => validateIssuerPrivateKey(event.target.value)} error={issuerPrivateKeyValidate.error} helperText={issuerPrivateKeyValidate.helperText} label="Issuer's Private Key" variant="filled" type="password" fullWidth required />
                </Grid>
                <Grid item xs={12}>
                    <TextField variant="filled" label="Expiration Date" value={moment(expirationDate).format("YYYY-MM-DD")} onChange={(event) => setExpirationDate(new Date(event.target.value))} inputProps={{ type: 'date' }} fullWidth required/>
                </Grid>
                {csv !== null && csv.length > 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ width: "100%", overflow: "hidden" }}>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth, backgroundColor: "#010409", color: "white" }}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align}>
                                                                {column.format && typeof value === "number" ? column.format(value) : value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination rowsPerPageOptions={[10, 25, 100]} component="div" count={rows.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
                        </Paper>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Button variant="outlined" component="label" fullWidth>
                        {(csv === null || csv.length === 0) && "Upload CSV File"}
                        {(csv !== null && csv.length > 0) && "Change CSV File"}
                        <input type="file" accept=".csv" onChange={CSVChangedHandler} hidden />
                    </Button>
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
                            <Button color="inherit" onClick={downloadPublicCredentials}>
                                DOWNLOAD
                            </Button>
                        </Box>
                    }>
                        <AlertTitle>Issued Successfully</AlertTitle>
                        <JsonView data={JSON.parse(issueState.message)} shouldInitiallyExpand={(level) => true} style={defaultStyles} />
                    </Alert>
                </Grid>}
                <Grid item xs={12}>
                    <Button variant="contained" fullWidth sx={{ padding: "10px 0px" }} onClick={onIssue}>
                        { !isIssueFetching && "Issue" }
                        { isIssueFetching && <CircularProgress color="inherit" /> }
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default IssueMany;
