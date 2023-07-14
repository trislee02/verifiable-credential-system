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
export function FormCheckField({
  index,
  data,
  onCheckFieldChange,
  onDeleteCheckField,
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
        value={data.fieldName}
        onChange={(e) => {
          onCheckFieldChange(index, {
            ...data,
            fieldName: e.target.value,
          });
        }}
        sx={{
          padding: "0px !important;",
          flex: 1,
        }}
        error={data.error}
        helperText={data.helperText}
      />
      <FormControl
        sx={{
          flex: 1,
        }}
      >
        <InputLabel>Operator</InputLabel>
        <Select
          id="demo-simple-select"
          value={data.operator}
          label="Operator"
          onChange={(e) => {
            onCheckFieldChange(index, {
              ...data,
              operator: e.target.value,
            });
          }}
        >
          {Object.values(NativeOperator).map(
            (operator, index) =>
              operator !== NativeOperator.INVALID_OP && (
                <MenuItem
                  key={index}
                  value={operator}
                  sx={{ textAlign: "center", justifyContent: "center" }}
                >
                  {mapOperatorToSymbol(operator)}
                </MenuItem>
              )
          )}
        </Select>
      </FormControl>
      <TextField
        label="Value"
        value={data.fieldValue}
        onChange={(e) => {
          onCheckFieldChange(index, {
            ...data,
            fieldValue: e.target.value,
          });
        }}
        sx={{
          padding: "0px !important;",
          flex: 1,
        }}
      />
      <Button
        variant="contained"
        color="error"
        endIcon={<DeleteIcon />}
        sx={{
          height: "50px",
          width: "auto"
        }}
        onClick={e => onDeleteCheckField(index)}
      >Delete
      </Button>
    </Box>
  );
}
