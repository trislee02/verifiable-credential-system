import React, { useEffect, useState } from "react";
// import { Box, TextField, FormControl, Select, MenuItem, Typography, Card } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { decryptVC, verifiyVCPresentation } from "../../lib/vc_protocol";
import { useDispatch, useSelector } from "react-redux";
import { appActions } from "../../redux/slices/appSlice";
import { rsaDecrypt } from "../../lib/crypto_lib";
import { JsonView, defaultStyles } from "react-json-view-lite";
import { RawRequestedValue } from "./RawRequestedValue";

const SubmissionComponent = ({ curSubmission, form }) => {
  const [expanded, setExpanded] = useState(false);
  const [validSubmission, setValidSubmission] = useState(null);
  const [rawSubmission, setRawSubmission] = useState(null);
  const [requestedValues, setRequestedValues] = useState(null);

  const dispatch = useDispatch();
  const { privateKey } = useSelector((store) => store.appSlice);

  const getPrivateKey = async function (openDiaglog) {
    if (!privateKey) {
      if(openDiaglog){
        dispatch(appActions.setOpenPrivateKeyForm());
      }else throw new Error("Private key not found")
    } else return privateKey;
  };

  const decryptSubmission = async (submission, openDiaglog = false) => {
    try {
      const priKey = await getPrivateKey(openDiaglog);
      console.log("Okay private key is ", priKey);
      console.log(form);
      console.log(submission);
      setRequestedValues(
        await verifiyVCPresentation({
          verifierPrivateKey: priKey,
          schema: form,
          presentation: submission,
        })
      );
      const _rawSubmission = {
        ...submission,
        credentials: JSON.parse(rsaDecrypt(priKey, submission.encryptedData)),
      };
      setValidSubmission(true);
      setRawSubmission(_rawSubmission);
    } catch (err) {
      console.log(err);
      setValidSubmission(false);
    }
  };

  useEffect(() => {
    if(!rawSubmission){
      decryptSubmission(curSubmission);
    }
  }, [privateKey])

  return (
    <Accordion
      expanded={expanded}
      onChange={() => {
        if(!expanded){
          if (!rawSubmission) decryptSubmission(curSubmission, !expanded);
        }
        setExpanded(!expanded);
      
      }}
      style={{ width: "100%" }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3bh-content"
        id="panel3bh-header"
      >
        <Typography sx={{ width: "33%", flexShrink: 0 }}>
          Submission ID
        </Typography>
        <Typography sx={{ color: validSubmission === null ? "text.secondary" : (validSubmission ? "green" : "red") }}>
          {curSubmission.id}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body1">Holder: {curSubmission.holder}</Typography>
        <Typography variant="body1">Created date: {curSubmission.issuanceDate}</Typography>
        <Typography variant="body1">
          Verifier: {curSubmission.verifier}
        </Typography>
        {rawSubmission?.credentials?.map((cred) => (
          <JsonView sx = {{marginBottom: 5}}
            data={cred}
            shouldInitiallyExpand={(level) => true}
            style={defaultStyles}
          />
        ))}
        <Typography variant="body1">
          Requested fields:
          {requestedValues?.map((_, i) => (
            <RawRequestedValue
              index={i}
              fieldName={form.requests[i].split(".")[1]}
              value={_}
            />
          ))}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default SubmissionComponent;
