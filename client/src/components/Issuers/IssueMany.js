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
import Papa from "papaparse";

const IssueMany = () => {
    const [issuerPrivateKey, setIssuePrivateKey] = useState("");
    const [csv, setCsv] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

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

    const onIssue = () => {};

    console.log("csv", csv);

    let columns = [];
    if (csv && csv[0])
        columns = Object.keys(csv[0]).map((key) => {
            return {
                id: key,
                name: key,
                label: key,
                minWidth: 120,
                align: "left",
            };
        });

    const rows = csv ? csv : [];

    console.log("columns", columns);
    console.log("rows", rows);

    return (
        <Box sx={{ marginInline: "5vw", display: "flex", justifyContent: "center" }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField value={issuerPrivateKey} onChange={(event) => setIssuePrivateKey(event.target.value)} id="issuer" label="Issuer's Private Key" variant="filled" type="password" fullWidth required />
                </Grid>
                {csv !== null && (
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
                        {csv === null && "Upload CSV File"}
                        {csv !== null && "Change CSV File"}
                        <input type="file" accept=".csv" onChange={CSVChangedHandler} hidden />
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" fullWidth sx={{ padding: "10px 0px" }} onClick={onIssue}>
                        Issue
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default IssueMany;
