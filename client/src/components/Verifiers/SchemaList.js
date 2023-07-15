import React, { useState, useEffect } from "react";
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
import CreateForm from "./CreateForm";
import { useSelector } from "react-redux";
import { SetPrivateKeyForm } from "./SetPrivateKeyForm";
import useFetch from "../../hooks/useFetch";
import apiConstants from "../../constants/api";

const tmpSchema = {
  verifier: "C",
  verifierPublicKey:
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB",
  issuanceDate: "2023-07-13T16:16:31.980Z",
  checks: [
    {
      types: ["$EQ", "UniversityDegreeCredential"],
      degree_type: ["$EQ", "BachelorDegree"],
      year: ["$LT", 2025],
    },
    { types: ["$EQ", "UniversityDegreeCredential"] },
  ],
  requests: ["0.school_name", "1.degree_name"],
  id: "99eeea9702c8edbe7a5419c8a84cf24e0f1009cd8a13db3ee54865307fb3471c",
  proof: {
    type: "RSASignature",
    created: "2023-07-13T16:16:31.980Z",
    proofPurpose: "ASSERTION",
    value:
      "E85vJaymqAzQF5ibfUBdwmYuyo36Sr+jPBzA4KoLd8bWZEN7PZXDPFg95vOfxDPxZFIy8rYxMHciFqc6br7y4/mKTVCXbHr5P2HfP5iuzyvv8TwilFvgrlOOfiNX/uC0HqWEPccs85V3UC7AqJK/4dl3jV5QHT+ndvxdSGL0Xtk=",
    verificationMethod:
      "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB",
  },
};

const SchemaList = () => {
  const user = useSelector((store) => store.authSlice.user);
  const token = useSelector((store) => store.authSlice.jwt);

  const [json, setJson] = useState(null);
  const [createdForms, setCreatedForms] = useState([tmpSchema]);
  const [fetcher, isFetching, fetchingError] = useFetch().slice(0, 2);

  useEffect(() => {
    const getMySchemas = async () => {
      const responseData = await fetcher(
        `${apiConstants.BASE_API_URL}/api/my-forms/sending-forms`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!responseData) {
        console.log(fetchingError);
        return;
      }
      var myCreatedForms = responseData.data.map((data) => {
        data.schema.form_id_server = data.id;
        return data.schema;
      });
      console.log(myCreatedForms);
      console.log(responseData.data);
      setCreatedForms(myCreatedForms);
    };
    getMySchemas();
  }, [])

  const [open, setOpen] = useState(false);
  const [cred, setCred] = useState("");

  const [unencrypted, setUnencrypted] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  return (
    <Box
      sx={{
        marginInline: "5vw",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        Your Form
      </h1>
      <CreateForm onNewForm = {(_) => setCreatedForms([...createdForms, _])}/>

      <List>
        {createdForms.map((schema, index) => (
          <ListItem key={index}>
            <SchemaComponent curSchema={schema} />
          </ListItem>
        ))}
      </List>

      {/* <CredentialSelection
        id="ringtone-menu"
        keepMounted
        open={open}
        onClose={handleClose}
        valueProp={cred}
      /> */}
    </Box>
  );
};

export default SchemaList;
