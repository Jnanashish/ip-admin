import React from "react";
import { useController } from "react-hook-form";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Label } from "Components/ui/label";
import { config as editorConfig } from "Config/editorConfig";

const RichTextEditor = ({ name, control, label, helperText }) => {
    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: "",
    });

    return (
        <div className="space-y-1.5">
            {label && <Label htmlFor={name}>{label}</Label>}
            <div className={fieldState.error ? "rounded-md ring-1 ring-destructive" : undefined}>
                <CKEditor
                    editor={ClassicEditor}
                    config={editorConfig}
                    data={field.value || ""}
                    onChange={(_e, editor) => field.onChange(editor.getData())}
                    onBlur={field.onBlur}
                />
            </div>
            {helperText && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
            {fieldState.error && (
                <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}
        </div>
    );
};

export default RichTextEditor;
