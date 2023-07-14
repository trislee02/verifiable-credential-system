import React, { useEffect } from "react";
import Header from "./components/Header/Header";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import IssuersPage from "./components/Issuers/IssuersPage";
import { testRSA } from "./lib/crypto_lib";
import { runVCProtocolTest } from "./lib/vc_protocol";
import FormPage from "./components/Form/FormPage";
import HoldersPage from "./components/Holders/HoldersPage";
import VerifierPage from "./components/Verifiers/VerifierPage";
import { SetPrivateKeyForm } from "./components/Verifiers/SetPrivateKeyForm";

const TestRSACrypto = () => {
  useEffect(() => {
    testRSA();
    runVCProtocolTest();
  }, []);
  return <>Hello RSA</>;
};

const App = () => {
  const authenticated = useSelector((store) => store.authSlice.isAuthenticated);
  if (!authenticated) return <Navigate to="/auth/login" />;
  return (
    <React.Fragment>
      <Header />
      <Routes>
        <Route path="/" element={<TestRSACrypto />} />
        <Route path="issuers" element={<IssuersPage />} />
        <Route path="holders" element={<HoldersPage />} />
        <Route path="f/:id" element={<FormPage />} />
        <Route path="verifiers" element={<VerifierPage />} />
      </Routes>
      <SetPrivateKeyForm />
    </React.Fragment>
  );
};

export default App;
