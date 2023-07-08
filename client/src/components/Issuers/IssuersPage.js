import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import IssueOne from "./IssueOne";

const IssuersPage = () => {
    const [issueMode, setIssueMode] = useState("one"); // "one" or "many"

    return (
        <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={issueMode}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={(event, newMode) => setIssueMode(newMode)} sx={{ paddingInline: "5vw"}}>
                        <Tab label="Issue one credential" value="one" />
                        <Tab label="Issue many credentials" value="many" />
                    </TabList>
                </Box>
                <TabPanel value="one"><IssueOne /></TabPanel>
                <TabPanel value="many">Item Two</TabPanel>
            </TabContext>
        </Box>
    );
};

export default IssuersPage;
