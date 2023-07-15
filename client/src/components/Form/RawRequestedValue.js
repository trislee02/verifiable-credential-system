import { Box, TextField } from "@mui/material";

export function RawRequestedValue({ index, fieldName, value }) {
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
        value={fieldName}
        sx={{
          padding: "0px !important;",
          flex: 1,
        }}
        // error={data.error}
        // helperText={data.helperText}
      />
      <TextField
        label="Value"
        value={value}
        sx={{
          padding: "0px !important;",
          flex: 1,
        }}
        // error={data.error}
        // helperText={data.helperText}
      />
    </Box>
  );
}
