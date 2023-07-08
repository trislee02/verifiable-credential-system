import { React, useState } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import PersonIcon from "@mui/icons-material/Person";

const DEFAULT_PAGES = [{
        title: "Issuers",
        href: "/issuers",
    }, {
        title: "Holders",
        href: "/holders"
    }, {
        title: "Verifiers",
        href: "/verifiers"
    }
];

function Header({ pages = DEFAULT_PAGES, settings = [] }) {
    document.body.style.paddingTop = "64px";

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        dispatch(authActions.logout());
        navigate("/");
    };

    const hasPages = pages.length > 0;

    return (
        <AppBar position="fixed" sx={{ paddingInline: "5vw" }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h3"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: "none", md: "flex", alignItems: "center" },
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: ".3rem",
                            color: "inherit",
                            textDecoration: "none",
                        }}>
                        <LockOutlinedIcon sx={{ mr: 2, p: 0, height: 50, width: "auto" }} />
                        VCs
                    </Typography>
                    {hasPages && (
                        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                            <IconButton size="large" aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleOpenNavMenu} color="inherit">
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: "block", md: "none" },
                                }}>
                                {pages.map((page) => (
                                    <MenuItem key={page.href} sx={{ ml: 1, mr: 1 }}>
                                        <Typography component="a" href={page.href} noWrap 
                                            sx={{ color: "inherit", textDecoration: "none", fontSize: "120%" }}>
                                            {page.title}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    )}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                            mr: 2,
                            display: { xs: "flex", md: "none", alignItems: "center" },
                            flexGrow: 1,
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: ".3rem",
                            color: "inherit",
                            textDecoration: "none",
                        }}>
                        <LockOutlinedIcon sx={{ mr: 2, p: 0, height: 30, width: "auto" }} />
                        VCs
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                        {pages.map((page) => (
                            <MenuItem key={page.href} sx={{ ml: 1, mr: 1 }}>
                                <Typography component="a" href={page.href} noWrap 
                                    sx={{ color: "inherit", textDecoration: "none", fontSize: "120%" }}>
                                    {page.title}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }} color="inherit">
                                <PersonIcon sx={{ border: "0.5px solid white", borderRadius: "50%", padding: "10px" }} />
                            </IconButton>
                        </Tooltip>
                        <Menu sx={{ mt: "45px", minWidth: 100 }} id="menu-appbar" anchorEl={anchorElUser} anchorOrigin={{ vertical: "top", horizontal: "right" }} keepMounted transformOrigin={{ vertical: "top", horizontal: "right" }} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu} sx={{ minWidth: "150px" }}>
                                    <Typography textAlign="end" sx={{ width: "100%" }}>
                                        {setting}
                                    </Typography>
                                </MenuItem>
                            ))}
                            <MenuItem onClick={handleLogout} sx={{ minWidth: "150px" }}>
                                <Typography textAlign="end" sx={{ width: "100%" }}>
                                    Logout
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default Header;
