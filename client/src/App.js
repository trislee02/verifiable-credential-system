import React from "react";
import Header from "./components/Header/Header";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import IssuersPage from "./components/Issuers/IssuersPage";

const App = () => {
    const authenticated = useSelector((store) => store.authSlice.isAuthenticated);
    if (!authenticated) return <Navigate to="/auth/login" />;
    return (
        <React.Fragment>
            <Header />
            <Routes>
                <Route path="issuers" element={<IssuersPage />} />
                <Route path="holders" element={<h1>This is Holders page</h1>} />
                <Route path="verifiers" element={<h1>This is Verifiers page</h1>} />
            </Routes>
        </React.Fragment>
    );
};

export default App;
