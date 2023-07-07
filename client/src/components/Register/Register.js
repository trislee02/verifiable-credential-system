import React, { useRef, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

const Register = () => {
    const [accountType, setAccountType] = useState("personal");
    const nameRef = useRef();
    const emailRef = useRef();

    const [emailValidate, setEmailValidate] = useState({ error: false, helperText: "" });
    const [nameValidate, setNameValidate] = useState({ error: false, helperText: "" });

    const handleAccountTypeChange = (event) => {
        setAccountType(event.target.value);
    };

    const validateName = (name) => {
        if (!name || name.trim().length === 0) {
            setNameValidate({
                error: true,
                helperText: "Name is required!"
            });
            return false;
        }
        setNameValidate({
            error: true,
            helperText: ""
        });
        return true;
    }

    const validateEmail = (email) => {
        if (!email || email.trim().length === 0) {
            setEmailValidate({
                error: true,
                helperText: "Email Address is required!"
            });
            return false;
        }

        if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
            setEmailValidate({
                error: true,
                helperText: "Invalid email address!"
            });
            return false;
        }

        setEmailValidate({
            error: false,
            helperText: ""
        });

        return true;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = nameRef.current.value;
        const email = emailRef.current.value;

        if (!validateName(name)) return;
        if (!validateEmail(email)) return;
           
        console.log({
            email: data.get("email"),
            password: data.get("password"),
            accountType: data.get("account-type"),
            publicKey: data.get("publickey")
        });
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up for VCs
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                { !nameValidate.error && <TextField ref={nameRef} autoComplete="full-name" name="name" required fullWidth id="name" label="Name" autoFocus />}
                                { nameValidate.error && <TextField ref={nameRef} error helperText={nameValidate.helperText} autoComplete="full-name" name="name" required fullWidth id="name" label="Name" autoFocus />}
                            </Grid>
                            <Grid item xs={12}>
                                { !emailValidate.error && <TextField ref={emailRef} required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />}
                                { emailValidate.error && <TextField ref={emailRef} required error helperText={emailValidate.helperText} fullWidth id="email" label="Email Address" name="email" autoComplete="email" />}
                            </Grid>
                            <Grid item xs={12}>
                                <TextField required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl sx={{ minWidth: 80 }} fullWidth required>
                                    <InputLabel id="account-type-label">Account Type</InputLabel>
                                    <Select labelId="account-type-label" name="account-type" id="account-type" value={accountType} onChange={handleAccountTypeChange} label="Account Type" required>
                                        <MenuItem value="personal">Personal Account</MenuItem>
                                        <MenuItem value="business">Business Account</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField name="publickey" required fullWidth id="publickey" label="Public Key" />
                            </Grid>
                        </Grid>
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/auth/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Register;
