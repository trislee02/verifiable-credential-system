import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const FormPage = () => {
    const [issueMode, setIssueMode] = useState("one"); 
    
    let { id } = useParams();
    console.log(id);

    return (
        <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={issueMode}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={(event, newMode) => setIssueMode(newMode)} sx={{ paddingInline: "5vw"}}>
                        <Tab label="Issue one credential" value="one" />
                        <Tab label="Issue many credentials" value="many" />
                    </TabList>
                </Box>
                <TabPanel value="one">
                    <Button>
                        <Typography sx={{ display: { xs: "none", md: "inline" } }}>One</Typography>
                    </Button>
                </TabPanel>
                <TabPanel value="many">
                    <Button>
                        <Typography sx={{ display: { xs: "none", md: "inline" } }}>Many</Typography>
                    </Button>
                </TabPanel>
            </TabContext>
        </Box>
    );
};

export default FormPage;