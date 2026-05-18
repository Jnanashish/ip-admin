import React from "react";
import { useLocation } from "react-router-dom";
import JobFormV2 from "./JobFormV2";
import { defaultJobValues } from "validators/v2/jobFormSchema";

const CreateJobV2 = () => {
    const { state } = useLocation();
    const seed = state?.duplicateFrom || state?.prefill || null;
    const initialValues = seed
        ? { ...defaultJobValues(), ...seed }
        : defaultJobValues();
    return <JobFormV2 mode="create" initialValues={initialValues} />;
};

export default CreateJobV2;
