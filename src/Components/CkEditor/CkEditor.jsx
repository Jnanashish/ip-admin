import React from "react";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { config } from "../../Config/editorConfig";

const CustomCKEditor = (props) => {
    ClassicEditor.defaultConfig = config;
    const { label, value } = props;
    return (
        <>
            {!!label && <p className="my-4 mb-2 text-foreground font-semibold">{label}</p>}
            <CKEditor
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
