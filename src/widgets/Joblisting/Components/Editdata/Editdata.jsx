import { useState } from "react";

// import ck editor
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { config } from "../../../../Config/editorConfig";

import Custombutton from "../../../../Components/Button/Custombutton";
import { addJobDataHelper } from "../../../Addjobs/Helpers";
import { showErrorToast, showInfoToast, showSuccessToast } from "../../../../Helpers/toast";
import CustomDivider from "../../../../Components/Divider/Divider";
import { updateJobDetails } from "../../../Addjobs/Helpers";
import { Badge } from "Components/ui/badge";
import { Input } from "Components/ui/input";
import { categorytags } from "../../../Addjobs/Helpers/staticdata";

const EditData = (props) => {
    ClassicEditor.defaultConfig = config;

    // state to store all the links data
    const [jobDetails, setJobDetails] = useState({
        title: props.data.title || "",
        role: props.data.role || "",
        batch: props.data.batch || "",
        jobtype: props.data.jobtype || "",
        degree: props.data.degree || "",
        salary: props.data.salary || "",
        link: props.data.link || "",
        jobdesc: props.data.jobdesc || "",
        eligibility: props.data.eligibility || "",
        experience: props.data.experience || "",
        lastdate: props.data.lastdate || "",
        skills: props.data.skills || "",
        responsibility: props.data.responsibility || "",
        aboutCompany: props.data.aboutCompany || "",
        location: props.data.location || "",
        imagePath: props.data.imagePath || "",
        jdpage: props?.data?.jdpage || "",
        companytype: props?.data?.companytype || "",
        companyName: props?.data?.companyName || "",
        jdbanner: props?.data?.jdbanner || "",
        tags: props?.data?.tags || [],
    });

    // Add loading state
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Add validation state
    const [errors, setErrors] = useState({});

    const id = props.data._id;

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};

        if (!jobDetails.title.trim()) newErrors.title = "Title is required";
        if (!jobDetails.companyName.trim()) newErrors.companyName = "Company name is required";
        if (!jobDetails.link.trim()) newErrors.link = "Registration link is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // update the selected job details
    const updateJobData = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showErrorToast("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await updateJobDetails(jobDetails, id);

            if (!!res) {
                showInfoToast("Data Updated Successfully");
                props.setSeletedJobId(true);
            } else {
                showErrorToast("An error Occurred");
            }
        } catch (error) {
            showErrorToast(error.message || "An error occurred while updating job");
        } finally {
            setIsSubmitting(false);
        }
    };

    // repost job edited data
    const repostJob = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showErrorToast("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await addJobDataHelper(jobDetails);

            if (res?.status === 200) {
                showSuccessToast("Job reposted");
                props.setSeletedJobId(true);
            } else {
                showErrorToast("Failed to repost job");
            }
        } catch (error) {
            showErrorToast(error.message || "An error occurred while reposting job");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJobdetailsChange = (key, value) => {
        setJobDetails((prevState) => ({
            ...prevState,
            [key]: value,
        }));

        // Clear error for this field if it exists
        if (errors[key]) {
            setErrors(prev => ({
                ...prev,
                [key]: null
            }));
        }
    };

    // when category tags clicked
    const handleCategoryTagClick = (tag, jobdetails) => {
        // if tag already selected remove the tag
        if (jobdetails.tags.includes(tag)) {
            setJobDetails((prevState) => ({
                ...prevState,
                tags: prevState.tags.filter((item) => item !== tag),
            }));
        } else {
            setJobDetails((prevState) => ({
                ...prevState,
                tags: [...prevState.tags, tag],
            }));
        }
    };

    // Custom input field component to reduce repetition
    const InputField = ({ label, name, value, placeholder = "" }) => (
        <div className="flex items-start mb-4 max-lg:flex-col">
            <h3 className="w-1/4 text-base mt-2 pr-4 text-foreground text-right max-lg:w-full max-lg:text-left max-lg:mb-2">{label}</h3>
            <div className="w-3/4 max-lg:w-full">
                <Input
                    value={value}
                    onChange={(e) => handleJobdetailsChange(name, e.target.value)}
                    placeholder={placeholder}
                    className={errors[name] ? "border-red-500" : ""}
                />
                {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
            </div>
        </div>
    );

    // Custom CKEditor field component
    const EditorField = ({ label, name, value }) => (
        <div className="flex mb-6 max-lg:flex-col">
            <h3 className="w-1/4 text-base mt-2 pr-4 text-foreground text-right max-lg:w-full max-lg:text-left max-lg:mb-2">{label}</h3>
            <div className="w-3/4 ml-auto max-lg:w-full max-lg:ml-0 max-lg:mt-2 [&_.ck-editor__editable]:min-h-[150px]">
                <CKEditor
                    editor={ClassicEditor}
                    data={value}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        handleJobdetailsChange(name, data);
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="w-full mx-auto mb-8 p-6 bg-[#f9f9f9] rounded-lg shadow-sm">
            <div className="w-full mx-auto mb-8 p-6 bg-[#f9f9f9] rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-center py-4">Edit Job Details</h2>
            </div>

            <form method="POST" onSubmit={updateJobData}>
                <InputField
                    label="Title of the Job :"
                    name="title"
                    value={jobDetails.title}
                    placeholder="Title of the job"
                />

                <InputField
                    label="Company name :"
                    name="companyName"
                    value={jobDetails.companyName}
                    placeholder="Company name"
                />

                <InputField
                    label="Link to register :"
                    name="link"
                    value={jobDetails.link}
                    placeholder="Registration link"
                />

                <InputField
                    label="Batch :"
                    name="batch"
                    value={jobDetails.batch}
                />

                <InputField
                    label="Role for the job :"
                    name="role"
                    value={jobDetails.role}
                />

                <div className="flex items-start mb-4 max-lg:flex-col">
                    <h3 className="w-1/4 text-base mt-2 pr-4 text-foreground text-right max-lg:w-full max-lg:text-left max-lg:mb-2">Categories :</h3>
                    <div className="w-3/4 ml-auto max-lg:w-full max-lg:ml-0 max-lg:mt-2">
                        <div className="flex flex-row flex-wrap gap-2">
                            {categorytags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant={jobDetails.tags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => handleCategoryTagClick(tag, jobDetails)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <InputField
                    label="Job Type :"
                    name="jobtype"
                    value={jobDetails.jobtype}
                />

                <InputField
                    label="Degree :"
                    name="degree"
                    value={jobDetails.degree}
                />

                <InputField
                    label="Salary :"
                    name="salary"
                    value={jobDetails.salary}
                />

                <InputField
                    label="Last application date :"
                    name="lastdate"
                    value={jobDetails.lastdate}
                />

                <InputField
                    label="Experience needed :"
                    name="experience"
                    value={jobDetails.experience}
                />

                <InputField
                    label="Location :"
                    name="location"
                    value={jobDetails.location}
                />

                <EditorField
                    label="Description of job :"
                    name="jobdesc"
                    value={jobDetails.jobdesc}
                />

                <EditorField
                    label="Eligibility Criteria :"
                    name="eligibility"
                    value={jobDetails.eligibility}
                />

                <EditorField
                    label="Responsibility of the job :"
                    name="responsibility"
                    value={jobDetails.responsibility}
                />

                <EditorField
                    label="Skills needed :"
                    name="skills"
                    value={jobDetails.skills}
                />

                <EditorField
                    label="About the company :"
                    name="aboutCompany"
                    value={jobDetails.aboutCompany}
                />

                <InputField
                    label="Image Path :"
                    name="imagePath"
                    value={jobDetails.imagePath}
                />

                <div className="flex gap-5 my-6 justify-center max-sm:flex-col max-sm:items-center [&>*]:min-w-[200px] [&>*]:max-w-[260px] max-sm:[&>*]:w-full">
                    <Custombutton
                        type="button"
                        onClick={updateJobData}
                        label={isSubmitting ? "Updating..." : "Update"}
                        disabled={isSubmitting}
                        startIcon={isSubmitting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                    />
                    <Custombutton
                        type="button"
                        onClick={repostJob}
                        label={isSubmitting ? "Reposting..." : "Repost"}
                        disabled={isSubmitting}
                        startIcon={isSubmitting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                    />
                </div>
            </form>
        </div>
    );
};

export default EditData;
