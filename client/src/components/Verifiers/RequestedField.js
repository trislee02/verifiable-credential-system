import React, { useState } from "react";
import moment from "moment";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import CircularProgress from "@mui/material/CircularProgress";
import { issueVC, verifyValidVC } from "../../lib/vc_protocol";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { NativeOperator, mapOperatorToSymbol } from "../../lib/vc";

// {
//   fieldName,
//   operator,
//   fieldValue
// }
export function RequestedField({
  index,
  value,
  onRequestedFieldChange,
  onDeleteRequestedField,
}) {
  return (
    <Box
      key={index}
      sx={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        minHeight: "75px",
        minWidth: "70vw",
        maxWidth: "90vw",
      }}
    >
      <TextField
        label="Field name"
        value={value}
        onChange={(e) => {
          onRequestedFieldChange(index, e.target.value);
        }}
        sx={{
          padding: "0px !important;",
          flex: 1,
        }}
        // error={data.error}
        // helperText={data.helperText}
      />
      <Button
        variant="contained"
        color="error"
        endIcon={<DeleteIcon />}
        sx={{
          height: "50px",
          width: "auto"
        }}
        onClick={e => onDeleteRequestedField(index)}
      >Delete
      </Button>
    </Box>
  );
}
