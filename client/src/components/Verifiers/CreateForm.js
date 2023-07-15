import React, { useEffect, useState } from "react";
import moment from "moment";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import CircularProgress from "@mui/material/CircularProgress";
import {
  createSchema,
  issueVC,
  verifyValidSchema,
  verifyValidVC,
} from "../../lib/vc_protocol";
import {
  verifyKeyPair,
  rsaDecrypt,
  convertPrivateKeyToRSAKey,
} from "../../lib/crypto_lib";
import { useDispatch, useSelector } from "react-redux";
import {
  NativeOperator,
  getOperatorText,
  getPublicCredential,
  mapOperatorToSymbol,
} from "../../lib/vc";
import apiConstants from "../../constants/api";
import useFetch from "../../hooks/useFetch";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { FormCheckField } from "./FormCheckField";
import { RequestedField } from "./RequestedField";
import { appActions } from "../../redux/slices/appSlice";

const emptyCheckField = {
  fieldName: "",
  operator: "$EQ",
  fieldValue: "",
};
const CreateForm = ({ onNewForm }) => {
  const user = useSelector((store) => store.authSlice.user);
  const token = useSelector((store) => store.authSlice.jwt);
  const [issueFetch, isIssueFetching] = useFetch().slice(0, 2);
  const [holderIdentifier, setHolderIdentifier] = useState("");
  const [formCheckFields, setFormCheckFields] = useState([
    { ...emptyCheckField },
  ]);
  const [requestedFields, setRequestedFields] = useState([""]);
  const [createFormResult, setCreateFormResult] = useState({
    state: null,
    message: "",
  });

  const [fetcher, isFetching, fetchingError] = useFetch().slice(0, 2);

  // const validateVerifierPrivateKey = (value) => {
  //   if (!value || value.trim().length === 0) {
  //     setVerifierPrivateKeyValidate({
  //       error: true,
  //       helperText: "Verifier's Private Key is required!",
  //     });
  //     return false;
  //   }
  //   setVerifierPrivateKeyValidate({ error: false, helperText: "" });
  //   return true;
  // };

  // const onFieldKeyChange = (index, newKey) => {
  //   setFormCheckFields((prev) => {
  //     if (index < 0 || index >= prev.length) return;
  //     let cloned = [...prev];
  //     cloned[index].key = newKey;
  //     if (
  //       cloned.filter((field) => field.key.trim() === newKey.trim()).length > 1
  //     ) {
  //       cloned[index].error = true;
  //       cloned[index].helperText =
  //         "WARNING! This field's name is duplicated! All the above fields with the same name will be overwritten!";
  //     } else if (!/^[a-zA-Z0-9_-]+$/.test(newKey)) {
  //       cloned[index].error = true;
  //       cloned[index].helperText =
  //         "Field's name only accepts alphanumeric characters, hyphen, and underscore!";
  //     } else {
  //       cloned[index].error = false;
  //       cloned[index].helperText = "";
  //     }
  //     return cloned;
  //   });
  // };

  const onCheckFieldChange = (index, newData) => {
    setFormCheckFields([
      ...formCheckFields.map((_, i) => (i === index ? newData : _)),
    ]);
  };

  const onDeleteCheckField = (index) => {
    setFormCheckFields([...formCheckFields.filter((_, i) => i !== index)]);
  };

  const onAddCheckField = () => {
    setFormCheckFields([...formCheckFields, { ...emptyCheckField }]);
  };
  const onAddRequestedFields = () => {
    setRequestedFields([...requestedFields, ""]);
  };

  const dispatch = useDispatch();
  const { privateKey } = useSelector((store) => store.appSlice);

  const getPrivateKey = async function () {
    if (!privateKey) {
      dispatch(appActions.setOpenPrivateKeyForm());
    } else return privateKey;
  };

  const onCreate = async () => {
    try {
      setCreateFormResult({
        state: null,
        message: "",
      });
      if (!user || !token) {
        throw new Error("Please login first!");
      }

      // Get credential subject (remove fields which has error)
      let fields = formCheckFields.filter(
        (field) =>
          field.fieldName.trim().length > 0 &&
          field.fieldValue.trim().length > 0 &&
          field.operator.trim().length > 0
      );
      console.log(requestedFields);
      let rr = requestedFields.filter((field) => {
        console.log(field);
        return field.length > 0;
      });

      console.log(formCheckFields);
      console.log(fields);

      if (formCheckFields.length <= 0 && requestedFields.length <= 0) {
        throw new Error("The form must not be empty");
      }

      if (
        fields.length < formCheckFields.length ||
        rr.length < requestedFields.length
      ) {
        throw new Error("All inputs must not be empty");
      }

      let onlyCheck = {};
      for (let i = 0; i < formCheckFields.length; ++i) {
        onlyCheck[formCheckFields[i].fieldName] = [
          formCheckFields[i].operator,
          formCheckFields[i].fieldValue,
        ];
      }

      if (!(await getPrivateKey())) return;

      // Issue
      await createForm(
        user.username,
        user.publicKey,
        privateKey,
        onlyCheck,
        requestedFields
      );
    } catch (err) {
      console.log(err);
      setCreateFormResult({
        state: "error",
        message: err.message,
      });
      return;
    }
  };

  const createForm = async (
    verifierIdentifier,
    verifierPublicKey,
    verifierPrivateKey,
    onlyCheck,
    requestedFields
  ) => {
    try {
      const fullForm = await createSchema({
        name: "Form",
        verifier: verifierIdentifier,
        verifierPublicKey,
        verifierPrivateKey,
        checks: [onlyCheck],
        requests: [...requestedFields.map((_) => "0." + _)],
      });

      if (!verifyValidSchema(fullForm))
        throw new Error("Error while creating new form");

      await saveForm(fullForm);

      onNewForm(fullForm);

      setRequestedFields([""]);
      setFormCheckFields([{ ...emptyCheckField }]);
      
      setCreateFormResult({
        state: "success",
        message: JSON.stringify(fullForm),
      });
    } catch (error) {
      const message =
        error && error.message
          ? error.message
          : "An error occurred while issuing! Re-check your inputs and try again!";
      setCreateFormResult({ state: "error", message: message });
      return;
    }
  };

  const saveForm = async (fullForm) => {
    const holder = await getHolder();
    console.log(holder);
    console.log(fullForm);

    const responseData = await fetcher(
      `${apiConstants.BASE_API_URL}/api/forms`,
      {
        method: "POST",
        body: JSON.stringify({
          "name": "My Form",
          "description": "A form for people",
          "schema": fullForm,
          "holder": holder.id
        }),
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(fetchingError);
    console.log(responseData);
    if (fetchingError) {
      console.log(fetchingError);
      throw new Error();
    }
  };

  // const downloadForm = () => {
  //   if (!publicCred) return;
  //   const link = document.createElement("a");
  //   link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
  //     JSON.stringify(publicCred)
  //   )}`;
  //   link.download = "credential.json";
  //   link.click();
  // };

  // const disableIssueButton =
  //   holderIdentifierValidate.error ||
  //   holderIdentifier.trim().length === 0 ||
  //   verifierPrivateKeyValidate.error ||
  //   verifierPrivateKey.trim().length === 0 ||
  //   formCheckFields.filter((field) => field.error).length > 0;

  const getHolder = async () => {
      const holder = await issueFetch(`${apiConstants.BASE_API_URL}/api/u?identifier=${holderIdentifier}`, {
          headers: { "Authorization": `Bearer ${token}` }
      });
      if (!holder) {
          return null;
      }
      return holder;
  }

  return (
    <Box
      sx={{ marginInline: "5vw", display: "flex", justifyContent: "center" }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
            <TextField 
                value={holderIdentifier} onChange={(event) => setHolderIdentifier(event.target.value)} 
                label="Holder's identifier" variant="filled" fullWidth required />
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ display: "block" }}>
            Checks{" "}
            <Button
              variant="contained"
              // color="yello"
              endIcon={<AddIcon />}
              onClick={onAddCheckField}
            >
              Add check field
            </Button>
          </Typography>

          {formCheckFields.map((obj, index) => {
            return (
              <FormCheckField
                index={index}
                data={obj}
                onCheckFieldChange={onCheckFieldChange}
                onDeleteCheckField={onDeleteCheckField}
              />
            );
          })}
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ display: "block" }}>
            Request fields{" "}
            <Button
              variant="contained"
              // color="yello"
              endIcon={<AddIcon />}
              onClick={onAddRequestedFields}
            >
              Add request field
            </Button>
          </Typography>

          {requestedFields.map((obj, index) => {
            return (
              <RequestedField
                index={index}
                data={obj}
                onRequestedFieldChange={(index, newValue) => {
                  setRequestedFields([
                    ...requestedFields.map((x, i) =>
                      i === index ? newValue : x
                    ),
                  ]);
                }}
                onDeleteRequestedField={(_) => {
                  setRequestedFields([
                    ...requestedFields.filter((data, i) => i !== index),
                  ]);
                }}
              />
            );
          })}
        </Grid>
        {createFormResult.state === "error" && (
          <Grid item xs={12}>
            <Alert
              severity="error"
              onClose={() => setCreateFormResult({ state: null, message: "" })}
            >
              <AlertTitle>Error</AlertTitle>
              {createFormResult.message}
            </Alert>
          </Grid>
        )}
        {createFormResult.state === "success" && (
          <Grid item xs={12}>
            <Alert
              severity="success"
              action={
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Button
                    color="inherit"
                    onClick={() =>
                      setCreateFormResult({ state: null, message: "" })
                    }
                  >
                    CLOSE
                  </Button>
                  {/* <Button color="inherit" onClick={downloadForm}>
                    DOWNLOAD
                  </Button> */}
                </Box>
              }
            >
              <AlertTitle>Create new form successfully</AlertTitle>
              {createFormResult.message}
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            variant="contained"
            sx={{ width: "100%", padding: "10px 0px" }}
            onClick={onCreate}
            disabled={isFetching}
          >
            {isFetching ? <CircularProgress color="inherit" /> : "Create"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateForm;
