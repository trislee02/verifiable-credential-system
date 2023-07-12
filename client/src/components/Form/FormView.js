import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const IssueOne = () => {
    const [holderIdentifier, setHolderIdentifier] = useState("");
    const [issuerPrivateKey, setIssuePrivateKey] = useState("");
    const [credentialFields, setCredentialFields] = useState([{ key: "", value: "", error: false, helperText: "" }]);

    const onFieldKeyChange = (index, newKey) => {
        setCredentialFields((prev) => {
            if (index < 0 || index >= prev.length) return;
            let cloned = [...prev];
            cloned[index].key = newKey;
            if (cloned.filter((field) => field.key === newKey).length > 1) {
                cloned[index].error = true;
                cloned[index].helperText = "WARNING! This field's name is duplicated! All the above fields with the same name will be overwritten!";
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

    const onIssue = () => {
        let fields = credentialFields.filter((field) => field.key.trim().length > 0);
        let credential = {};
        for (const field of fields) {
            credential[field.key] = field.value;
        }
        console.log(credential);
    };

    return (
        <Box sx={{ marginInline: "5vw", display: "flex", justifyContent: "center" }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField value={holderIdentifier} onChange={(event) => setHolderIdentifier(event.target.value)} id="holder" label="Holder's identifier" variant="filled" fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField value={issuerPrivateKey} onChange={(event) => setIssuePrivateKey(event.target.value)} id="issuer" label="Issuer's Private Key" variant="filled" type="password" fullWidth required />
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
                <Grid item xs={12}>
                    <Button variant="contained" sx={{ width: "100%", padding: "10px 0px" }} onClick={onIssue}>
                        Issue
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default IssueOne;
