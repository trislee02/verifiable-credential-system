import React, { useState, useRef } from "react";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';

const options = [
    'None',
    'Atria',
    'Callisto',
    'Dione',
    'Ganymede',
    'Hangouts Call',
    'Luna',
    'Oberon',
    'Phobos',
    'Pyxis',
    'Sedna',
    'Titania',
    'Triton',
    'Umbriel',
  ];

const CredentialSelection = ({ id, onClose, open, credList, valueProp}) => {
    const [value, setValue] = useState(valueProp);
    const radioGroupRef = useRef(null);

    React.useEffect(() => {
        if (!open) {
            setValue(valueProp);
        }
    }, [valueProp, open]);

    const handleEntering = () => {
        if (radioGroupRef.current != null) {
            radioGroupRef.current.focus();
        }
    };

    const handleCancel = () => {
        onClose(null);
    };

    const handleOk = () => {
        onClose(credList[value]);
    };

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
            maxWidth="xs"
            TransitionProps={{ onEntering: handleEntering }}
            open={open}
        >
        <DialogTitle>Phone Ringtone</DialogTitle>
        <DialogContent dividers>
            <RadioGroup
                ref={radioGroupRef}
                aria-label="ringtone"
                name="ringtone"
                value={value}
                onChange={handleChange}
                >

                {credList.map((cred, index) => (
                    <FormControlLabel
                        value={index}
                        key={index}
                        control={<Radio />}
                        label={`Credential ${index + 1}`}
                    />
                ))}
                {/* {options.map((option) => (
                    <FormControlLabel
                        value={option}
                        key={option}
                        control={<Radio />}
                        label={option}
                    />
                ))} */}
            </RadioGroup>
        </DialogContent>
        <DialogActions>
            <Button autoFocus onClick={handleCancel}>
                Cancel
            </Button>
            <Button onClick={handleOk}>Ok</Button>
        </DialogActions>
        </Dialog>
    );
}

export default CredentialSelection;