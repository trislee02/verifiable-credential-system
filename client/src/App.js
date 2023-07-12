import React from "react";
import Header from "./components/Header/Header";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import IssuersPage from "./components/Issuers/IssuersPage";
import FormPage from "./components/Form/FormPage";
import HoldersPage from "./components/Holders/HoldersPage";

const App = () => {
    const authenticated = useSelector((store) => store.authSlice.isAuthenticated);
    if (!authenticated) return <Navigate to="/auth/login" />;
    return (
        <React.Fragment>
            <Header />
            <Routes>
                <Route path="issuers" element={<IssuersPage />} />
                <Route path="holders" element={<HoldersPage />} />
                <Route path="f/:id" element={<FormPage/>}/>
                <Route path="verifiers" element={<h1>This is Verifiers page</h1>} />
            </Routes>
        </React.Fragment>
    );
};

export default App;
