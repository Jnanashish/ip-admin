import React from "react";
import { useLocation } from "react-router-dom";
import JobFormV2 from "./JobFormV2";
import { defaultJobValues } from "validators/v2/jobFormSchema";

const CreateJobV2 = () => {
    const { state } = useLocation();
    const initialValues = state?.duplicateFrom
        ? { ...defaultJobValues(), ...state.duplicateFrom }
        : defaultJobValues();
    return <JobFormV2 mode="create" initialValues={initialValues} />;
};

export default CreateJobV2;
