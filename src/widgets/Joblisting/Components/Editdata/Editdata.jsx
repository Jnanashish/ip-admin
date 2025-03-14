import { useState, useEffect } from "react";

// import css
import styles from "./editdata.module.scss";

// import ck editior
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { config } from "../../../../Config/editorConfig";

// import react toast
import Custombutton from "../../../../Components/Button/Custombutton";
import { addJobDataHelper } from "../../../Addjobs/Helpers";
import { showErrorToast, showInfoToast, showSuccessToast } from "../../../../Helpers/toast";
import CustomDivider from "../../../../Components/Divider/Divider";
import { updateJobDetails } from "../../../Addjobs/Helpers";
import { Stack, Chip, TextField, Typography, CircularProgress, Paper } from "@mui/material";
// Import from centralized config
import { categoryTags as categorytags } from "../../../../Config/categories";

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
        <div className={styles.admin_grid}>
            <h3 className={styles.admin_label}>{label}</h3>
            <TextField 
                className={styles.admin_input}
                value={value}
                onChange={(e) => handleJobdetailsChange(name, e.target.value)}
                placeholder={placeholder}
                fullWidth
                error={!!errors[name]}
                helperText={errors[name]}
                size="small"
                variant="outlined"
            />
        </div>
    );

    // Custom CKEditor field component
    const EditorField = ({ label, name, value }) => (
        <div className={styles.ck_grid}>
            <h3 className={styles.admin_label}>{label}</h3>
            <div className={styles.ck_input}>
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
        <div className={styles.admin}>
            <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h5" gutterBottom align="center">
                    Edit Job Details
                </Typography>
            </Paper>
            
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
                
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Categories :</h3>
                    <div className={styles.tags_container}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {categorytags.map((tag, index) => (
                                <Chip 
                                    key={index}
                                    label={tag} 
                                    variant={jobDetails.tags.includes(tag) ? "filled" : "outlined"} 
                                    color="primary" 
                                    onClick={() => handleCategoryTagClick(tag, jobDetails)} 
                                />
                            ))}
                        </Stack>
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
                
                <div className={styles.button_container}>
                    <Custombutton 
                        type="button" 
                        onClick={updateJobData} 
                        label={isSubmitting ? "Updating..." : "Update"} 
                        disabled={isSubmitting}
                        startIcon={isSubmitting && <CircularProgress size={20} />}
                    />
                    <Custombutton 
                        type="button" 
                        onClick={repostJob} 
                        label={isSubmitting ? "Reposting..." : "Repost"} 
                        disabled={isSubmitting}
                        startIcon={isSubmitting && <CircularProgress size={20} />}
                    />
                </div>
            </form>
        </div>
    );
};

export default EditData;
