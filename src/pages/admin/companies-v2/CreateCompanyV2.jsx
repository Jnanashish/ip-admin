import React from "react";
import CompanyFormV2 from "./CompanyFormV2";
import { defaultCompanyValues } from "validators/v2/companyFormSchema";

const CreateCompanyV2 = () => (
    <CompanyFormV2 mode="create" initialValues={defaultCompanyValues()} />
);

export default CreateCompanyV2;
