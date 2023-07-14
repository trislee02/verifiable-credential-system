import React, { useState } from "react";
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
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { Alert, AlertTitle } from "@mui/material";
import useFetch from "../../hooks/useFetch";
import apiConstants from "../../constants/api";

const Register = () => {
    const DEFAULT_ACCOUNT_TYPE = "indi";

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [type, setType] = useState(DEFAULT_ACCOUNT_TYPE);
    const [publicKey, setPublicKey] = useState("");

    const [emailValidate, setEmailValidate] = useState({ error: false, helperText: "" });
    const [usernameValidate, setUsernameValidate] = useState({ error: false, helperText: "" });
    const [nameValidate, setNameValidate] = useState({ error: false, helperText: "" });
    const [passwordValidate, setPasswordValidate] = useState({ error: false, helperText: "" });
    const [passwordConfirmValidate, setPasswordConfirmValidate] = useState({ error: false, helperText: "" });
    const [publicKeyValidate, setPublicKeyValidate] = useState({ error: false, helperText: "" });

    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [register, registering, registerError] = useFetch();

    const validateName = (name) => {
        if (!name || name.trim().length === 0) {
            setNameValidate({
                error: true,
                helperText: "Name is required!",
            });
            return false;
        }
        setNameValidate({
            error: false,
            helperText: "",
        });
        return true;
    };

    const validateEmail = (email) => {
        if (!email || email.trim().length === 0) {
            setEmailValidate({
                error: true,
                helperText: "Email Address is required!",
            });
            return false;
        }

        if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
            setEmailValidate({
                error: true,
                helperText: "Invalid email address!",
            });
            return false;
        }

        setEmailValidate({
            error: false,
            helperText: "",
        });

        return true;
    };

    const validateUsername = (username) => {
        if (!username || username.trim().length === 0) {
            setUsernameValidate({
                error: true,
                helperText: "Username is required!",
            });
            return false;
        }
        setUsernameValidate({
            error: false,
            helperText: "",
        });
        return true;
    };

    const validatePassword = (password) => {
        if (!password || password.trim().length === 0) {
            setPasswordValidate({
                error: true,
                helperText: "Password is required!",
            });
            return false;
        }
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(password)) {
            setPasswordValidate({
                error: true,
                helperText: "Password must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters!",
            });
            return false;
        }
        setPasswordValidate({
            error: false,
            helperText: "",
        });
        return true;
    };

    const validatePasswordConfirm = (input) => {
        if (!input || input.trim().length === 0 || input.trim() !== password.trim()) {
            setPasswordConfirmValidate({
                error: true,
                helperText: "Password not match!",
            });
            return false;
        }
        setPasswordConfirmValidate({
            error: false,
            helperText: "",
        });
        return true;
    };

    const validatePublicKey = (input) => {
        if (!input || input.trim().length === 0) {
            setPublicKeyValidate({
                error: true,
                helperText: "Public Key is required!",
            });
            return false;
        }
        setPublicKeyValidate({
            error: false,
            helperText: "",
        });
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validName = validateName(name);
        const validUsername = validateUsername(username);
        const validEmail = validateEmail(email);
        const validPassword = validatePassword(password) && validatePasswordConfirm(passwordConfirm);
        const validPublicKey = validatePublicKey(publicKey);

        if (!(validName && validUsername && validEmail && validPassword && validPublicKey)) return;
        
        const requestBody = { 
            name: name, 
            username: username, 
            email: email, 
            password: password, 
            type: type, 
            publicKey: publicKey
        };

        // Send API request
        const registerResponse = await register(`${apiConstants.BASE_API_URL}/api/auth/local/register`, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (registerResponse) setRegisterSuccess(true);
    };

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Box sx={{ marginTop: 8, marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up for VCs
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField value={name} onChange={(event) => setName(event.target.value)} onBlur={(event) => validateName(event.target.value)} onKeyUp={(event) => validateName(event.target.value)} error={nameValidate.error} helperText={nameValidate.helperText} autoComplete="full-name" name="name" required fullWidth id="name" label="Name" />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField value={username} onChange={(event) => setUsername(event.target.value)} onBlur={(event) => validateUsername(event.target.value)} onKeyUp={(event) => validateUsername(event.target.value)} error={usernameValidate.error} helperText={usernameValidate.helperText} name="username" required fullWidth id="username" label="Username" />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField value={email} onChange={(event) => setEmail(event.target.value)} onBlur={(event) => validateEmail(event.target.value)} onKeyUp={(event) => validateEmail(event.target.value)} error={emailValidate.error} helperText={emailValidate.helperText} required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField value={password} onChange={(event) => setPassword(event.target.value)} onBlur={(event) => validatePassword(event.target.value)} onKeyUp={(event) => validatePassword(event.target.value)} error={passwordValidate.error} helperText={passwordValidate.helperText} required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} onBlur={(event) => validatePasswordConfirm(event.target.value)} onKeyUp={(event) => validatePasswordConfirm(event.target.value)} error={passwordConfirmValidate.error} helperText={passwordConfirmValidate.helperText} required fullWidth name="passwordConfirm" label="Confirm Password" type="password" id="passwordConfirm" />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField id="account-type-select" select label="Account Type" value={type} onChange={(event) => setType(event.target.value)} fullWidth>
                                <MenuItem value="indi"> Individual</MenuItem>
                                <MenuItem value="org"> Organization</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <TextField value={publicKey} onChange={(event) => setPublicKey(event.target.value)} onBlur={(event) => validatePublicKey(event.target.value)} onKeyUp={(event) => validatePublicKey(event.target.value)} error={publicKeyValidate.error} helperText={publicKeyValidate.helperText} name="publickey" required fullWidth id="publickey" label="Public Key" />
                        </Grid>
                    </Grid>
                    {registerError && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            <AlertTitle>Register Failed!</AlertTitle>
                            {registerError}
                        </Alert>
                    )}
                    {!registerError && registerSuccess && (
                        <Alert severity="success" sx={{ mt: 3 }}>
                            <AlertTitle>Registered Successfully!</AlertTitle>
                            Your account has been successfully created —{" "}
                            <strong>
                                <a href="/auth/login">Login now!</a>
                            </strong>
                        </Alert>
                    )}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, padding: 1.5 }}>
                        {!registering && "Sign up"}
                        {registering && <CircularProgress color="inherit" />}
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
    );
};

export default Register;
