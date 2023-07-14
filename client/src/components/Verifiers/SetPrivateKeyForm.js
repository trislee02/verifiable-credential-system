import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { Typography, Alert, List, ListItem } from "@mui/material";
import { JsonView, darkStyles, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import CredentialSelection from "../Form/CredentialSelection";
import SchemaComponent from "./SchemaComponent";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import CreateForm from "./CreateForm";
import { useDispatch, useSelector } from "react-redux";
import { verifyKeyPair } from "../../lib/crypto_lib";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { appActions } from "../../redux/slices/appSlice";

export const SetPrivateKeyForm = () => {
  const [userPrivateKey, setIssuePrivateKey] = useState("");
  const user = useSelector((store) => store.authSlice.user);
  const [acceptedPrivateKey, setAcceptedPrivateKey] = useState(null);
  const open = useSelector((store) => store.appSlice.openPrivateKeyForm);
  const dispatch = useDispatch();
  const handleClose = () =>  dispatch(appActions.setClosePrivateKeyForm());
 
  const setKey = () => {
    try {
      console.log("Verify key pair for ", userPrivateKey, user.publicKey ?? "")
      if (!verifyKeyPair(userPrivateKey, user.publicKey ?? "")) {
        throw new Error("Keys do not match");
      }
      setAcceptedPrivateKey(true);
      dispatch(appActions.setPrivateKey({ privateKey: userPrivateKey }));
    } catch (err) {
      console.log(err);
      setAcceptedPrivateKey(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Enter your private key that matches your public key
      </DialogTitle>
      <DialogContent>
        {/* <DialogContentText>
          To subscribe to this website, please enter your email address here. We
          will send updates occasionally.
        </DialogContentText> */}
        <TextField
          id="user"
          label="Verifier's Public Key"
          variant="filled"
          type="password"
          value={user.publicKey ?? ""}
          fullWidth
          disabled
        />
        <TextField
          value={userPrivateKey}
          onChange={(event) => setIssuePrivateKey(event.target.value)}
          id="user"
          label="Verifier's Private Key"
          variant="filled"
          type="password"
          fullWidth
          required
        />
        {acceptedPrivateKey !== null && acceptedPrivateKey === true && (
          <Grid item xs={12}>
            <Alert severity="success">Valid key</Alert>
          </Grid>
        )}
        {acceptedPrivateKey !== null && acceptedPrivateKey === false && (
          <Grid item xs={12}>
            <Alert severity="error">Invalid key</Alert>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" sx={{ padding: "10px" }} onClick={setKey} disabled = {acceptedPrivateKey}>
          Use key
        </Button>
        <Button sx={{ padding: "10px" }} onClick={handleClose}>
          {acceptedPrivateKey ? "Close" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
