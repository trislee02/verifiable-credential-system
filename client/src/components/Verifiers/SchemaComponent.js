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
import { Link } from "@mui/material";

const SchemaCheck = ({ check, index }) => {
  const [entries, setEntries] = useState(Object.entries(check));

  useEffect(() => {
    setEntries(Object.entries(check));
  }, [check]);

  console.log("check");
  console.log(check);

  return (
    <CardContent>
      {entries.map(
        (entry, index) =>
          index <= 0 && (
            <div
              style={{ display: "flex", flexDirection: "row", width: "100%" }}
            >
              <TextField defaultValue={`${entry[0]}`} style={{ flex: 1 }} disabled/>
              <FormControl style={{ flex: 1 }} disabled>
                <Select value={entry[1][0]}>
                  <MenuItem value={entry[1][0]}>{entry[1][0]}</MenuItem>
                </Select>
              </FormControl>
              <TextField defaultValue={entry[1][1]} style={{ flex: 1 }} disabled/>
            </div>
          )
      )}
    </CardContent>
  );
};

const RequestInput = ({ index, request }) => (
  <CardContent>
    <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
      <TextField
        label="Credential index"
        defaultValue={Number((request ?? " . ").split(".")[0]) + 1}
        style={{ flex: 1 }}
        disabled
      />
      <TextField
        label="Field Name"
        defaultValue={(request ?? " . ").split(".")[1]}
        style={{ flex: 1 }}
        disabled
      />
    </div>
  </CardContent>
);

const SchemaComponent = ({ curSchema }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      style={{ width: "100%" }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3bh-content"
        id="panel3bh-header"
      >
        <Typography sx={{ width: "33%", flexShrink: 0 }}>Form ID</Typography>
        {/* <Typography sx={{ color: "text.secondary" }}>{curSchema.form_id_server}</Typography> */}
        {curSchema?.form_id_server && <Link href={`/f/${curSchema.form_id_server}`}>{`Go to form`}</Link>}
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body1">Verifier: {curSchema.verifier}</Typography>
        <Typography variant="body1">
          Created on: {new Date(curSchema.issuanceDate).toString()}
        </Typography>
        <Typography variant="body1" style={{ marginBottom: 10 }}>
          Checks:
        </Typography>
        {curSchema.checks.map((check, index) => (
          <SchemaCheck key={index} check={check} index={index} />
        ))}
        <Typography
          variant="body1"
          style={{ marginTop: 10, marginBottom: 10, border: "none" }}
        >
          Requested fields from credentials:
        </Typography>
        {curSchema.requests.map((request, index) => (
          <RequestInput key={index} index={index} request={request} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default SchemaComponent;
