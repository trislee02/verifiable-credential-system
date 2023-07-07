import React from "react";
import Header from "./components/Header/Header";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const App = () => {
    const authenticated = useSelector(store => store.authSlice.isAuthenticated);
    if (!authenticated) return <Navigate to="/auth/login" />;
    return (
        <React.Fragment>
            <Header />
            <h1>Hello World!</h1>
        </React.Fragment>
    );
}

export default App;
