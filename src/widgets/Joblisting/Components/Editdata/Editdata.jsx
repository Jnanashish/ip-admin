import { useState } from "react";

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
import { Stack, Chip } from "@mui/material";
import { categorytags } from "../../../Addjobs/Helpers/staticdata";

const EditData = (props) => {
    ClassicEditor.defaultConfig = config;

    // state to store all the links data
    const [jobDetails, setJobDetails] = useState({
        title: props.data.title,
        role: props.data.role,
        batch: props.data.batch,
        jobtype: props.data.jobtype,
        degree: props.data.degree,
        salary: props.data.salary,
        link: props.data.link,
        jobdesc: props.data.jobdesc,
        eligibility: props.data.eligibility,
        experience: props.data.experience,
        lastdate: props.data.lastdate,
        skills: props.data.skills,
        responsibility: props.data.responsibility,
        aboutCompany: props.data.aboutCompany,
        location: props.data.location,
        imagePath: props.data.imagePath,
        jdpage: props?.data?.jdpage,
        companytype: props?.data?.companytype,
        companyName: props?.data?.companyName,
        jdbanner: props?.data?.jdbanner,
        tags: props?.data?.tags,
    });

    const id = props.data._id;

    // update the selected job details
    const updateJobData = async (e) => {
        const res = await updateJobDetails(jobDetails, id);

        if (!!res) {
            showInfoToast("Data Updated Successfully");
            props.setSeletedJobId(true);
        } else {
            showErrorToast("An error Occured");
        }
    };

    // repost job edited data
    const repostJob = async () => {
        const res = await addJobDataHelper(jobDetails);

        if (res?.status === 200) {
            showSuccessToast("Job reposted");
            props.setSeletedJobId(true);
        }
    };

    const handleJobdetailsChange = (key, value) => {
        setJobDetails((prevState) => ({
            ...prevState,
            [key]: value,
        }));
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

    return (
        <div className="admin">
            <form method="POST">
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Title of the Job : </h3>
                    <input className={styles.admin_input} value={jobDetails.title} onChange={(e) => handleJobdetailsChange("title", e.target.value)} type="text" placeholder="Title of the job" />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Company name : </h3>
                    <input
                        className={styles.admin_input}
                        value={jobDetails.companyName}
                        onChange={(e) => handleJobdetailsChange("companyName", e.target.value)}
                        type="text"
                        placeholder="Title of the job"
                    />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Link to register : </h3>
                    <input
                        className={styles.admin_input}
                        value={jobDetails.link}
                        onChange={(e) => handleJobdetailsChange("link", e.target.value)}
                        type="text"
                        placeholder="Link"
                    />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Batch : </h3>
                    <input className={styles.admin_input} value={jobDetails.batch} onChange={(e) => handleJobdetailsChange("batch", e.target.value)} type="text" />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Role for the job : </h3>
                    <input className={styles.admin_input} value={jobDetails.role} onChange={(e) => handleJobdetailsChange("role", e.target.value)} type="text" />
                </div>
                <div className={styles.admin_grid}>
                    <Stack direction="row" spacing={1}>
                        {categorytags.map((tag) => (
                            <Chip label={tag} variant={jobDetails.tags.includes(tag) ? "" : "outlined"} color="primary" onClick={() => handleCategoryTagClick(tag, jobDetails)} />
                        ))}
                    </Stack>
                </div>
                <br/>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Job Type : </h3>
                    <input className={styles.admin_input} value={jobDetails.jobtype} onChange={(e) => handleJobdetailsChange("jobtype", e.target.value)} type="text" />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Degree : </h3>
                    <input className={styles.admin_input} value={jobDetails.degree} onChange={(e) => handleJobdetailsChange("degree", e.target.value)} type="text" />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Salary : </h3>
                    <input className={styles.admin_input} value={jobDetails.salary} onChange={(e) => handleJobdetailsChange("salary", e.target.value)} type="text" />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Last application date : </h3>
                    <input className={styles.admin_input} value={jobDetails.lastdate} onChange={(e) => handleJobdetailsChange("lastdate", e.target.value)} type="text" />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Experience needed : </h3>
                    <input className={styles.admin_input} value={jobDetails.experience} onChange={(e) => handleJobdetailsChange("experience", e.target.value)} type="text" />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Location : </h3>
                    <input className={styles.admin_input} value={jobDetails.location} onChange={(e) => handleJobdetailsChange("location", e.target.value)} type="text" />
                </div>

                <div className={styles.ck_grid}>
                    <h3 className={styles.admin_label}>Description of job : </h3>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        data={jobDetails.jobdesc}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            handleJobdetailsChange("jobdesc", data);
                        }}
                    />
                </div>

                <div className={styles.ck_grid}>
                    <h3 className={styles.admin_label}>Eligibility Criteria : </h3>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        data={jobDetails.eligibility}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            handleJobdetailsChange("eligibility", data);
                        }}
                    />
                </div>

                <div className={styles.ck_grid}>
                    <h3 className={styles.admin_label}>Responsibility of the job : </h3>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        data={jobDetails.responsibility}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            handleJobdetailsChange("responsibility", data);
                        }}
                    />
                </div>

                <div className={styles.ck_grid}>
                    <h3 className={styles.admin_label}>Skills needed : </h3>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        data={jobDetails.skills}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            handleJobdetailsChange("skills", data);
                        }}
                    />
                </div>

                <div className={styles.ck_grid}>
                    <h3 className={styles.admin_label}>About the company : </h3>
                    <CKEditor
                        className={styles.ck_input}
                        editor={ClassicEditor}
                        data={jobDetails.aboutCompany}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            handleJobdetailsChange("aboutCompany", data);
                        }}
                    />
                </div>
                <div className={styles.admin_grid}>
                    <h3 className={styles.admin_label}>Image Path : </h3>
                    <input className={styles.admin_input} value={jobDetails.imagePath} onChange={(e) => handleJobdetailsChange("imagePath", e.target.value)} type="text" />
                </div>
                <br />

                <div className={styles.button_container}>
                    <Custombutton type="button" onClick={updateJobData} label="Update" />
                    <Custombutton type="button" onClick={repostJob} label="Repost" />
                </div>
            </form>
            <CustomDivider count />
        </div>
    );
};

export default EditData;
