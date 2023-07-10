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
import { Alert, AlertTitle } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch } from "react-redux";
import { authActions } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import apiConstants from "../../constants/api";

const Login = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [identifierValidate, setIdentifierValidate] = useState({ error: false, helperText: "" });
    const [passwordValidate, setPasswordValidate] = useState({ error: false, helperText: "" });

    const [login, loggingIn, loginError] = useFetch();
    const [loginSuccess, setLoginSuccess] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validateIdentifier = (identifier) => {
        if (!identifier || identifier.trim().length === 0) {
            setIdentifierValidate({
                error: true,
                helperText: "Email or Username is required!",
            });
            return false;
        }
        setIdentifierValidate({
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
        setPasswordValidate({
            error: false,
            helperText: "",
        });
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate inputs
        const validIdentifier = validateIdentifier(identifier);
        const validPassword = validatePassword(password);
        if (!(validIdentifier && validPassword)) return;

        // Send API request
        const loginResponse = await login(`${apiConstants.BASE_API_URL}/api/auth/local`, {
            method: "POST",
            body: JSON.stringify({ identifier, password }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!loginResponse) return;
        setLoginSuccess(true);

        dispatch(authActions.login(loginResponse));
        localStorage.setItem("token", loginResponse.jwt);
        localStorage.setItem("user", JSON.stringify(loginResponse.user));

        navigate("/");
    };

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Box sx={{ marginTop: 8, marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in to VCs
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField value={identifier} onChange={(event) => setIdentifier(event.target.value)} onKeyUp={(event) => validateIdentifier(event.target.value)} onBlur={(event) => validateIdentifier(event.target.value)} error={identifierValidate.error} helperText={identifierValidate.helperText} margin="normal" required fullWidth id="identifier" label="Email or Username" name="identifier" autoComplete="email" />
                    <TextField value={password} onChange={(event) => setPassword(event.target.value)} onKeyUp={(event) => validatePassword(event.target.value)} onBlur={(event) => validatePassword(event.target.value)} error={passwordValidate.error} helperText={passwordValidate.helperText} margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" />
                    {loginError && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            <AlertTitle>Login Failed!</AlertTitle>
                            {loginError}
                        </Alert>
                    )}
                    {!loginError && loginSuccess && (
                        <Alert severity="success" sx={{ mt: 3 }}>
                            <AlertTitle>Logged In Successfully!</AlertTitle>
                            You have been successfully logged in! Welcome...
                        </Alert>
                    )}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        {!loggingIn && "Sign In"}
                        {loggingIn && <CircularProgress color="inherit" />}
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="/auth/register" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
