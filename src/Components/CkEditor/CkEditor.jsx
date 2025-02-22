import React from "react";
import styles from "./ckeditor.module.scss";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { config } from "../../Config/editorConfig";

const CustomCKEditor = (props) => {
    ClassicEditor.defaultConfig = config;
    const { label, value } = props;
    return (
        <>
            {!!label && <p className={styles.editor_label}>{label}</p>}
            <CKEditor
                className={styles.ck_input}
                editor={ClassicEditor}
                data={!!value ? value : ""}
                onChange={(e, editor) => {
                    const data = editor.getData();
                    props.onChange(data);
                }}
            />
        </>
    );
};

export default CustomCKEditor;
