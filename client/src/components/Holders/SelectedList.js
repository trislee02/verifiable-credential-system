import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';

export default function SelectedList({ onSelectCred, listCred }) {
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (event, index, cred) => {
    setSelectedIndex(index);
    onSelectCred(cred);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="main mailbox folders">
        {listCred.map((cred, index) => (
            <>
                <ListItemButton
                    key={index}
                    selected={selectedIndex === index}
                    onClick={(event) => handleListItemClick(event, index, cred)}>
                    <ListItemIcon>
                        <InboxIcon />
                    </ListItemIcon>
                    <ListItemText primary={`Credential ${index + 1}`} />
                </ListItemButton>
                <Divider />
            </>
        ))}
      </List>
    </Box>
  );
}


