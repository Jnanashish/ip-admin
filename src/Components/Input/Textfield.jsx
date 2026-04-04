import React from "react";
import { Input } from "Components/ui/input";
import { Textarea } from "Components/ui/textarea";
import { Label } from "Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "Components/ui/select";
import { cn } from "lib/utils";

const CustomTextField = (props) => {
    const { label, value, type, disabled, error, multiline, rows, className } = props;
    const fullWidth = props.fullWidth !== false;
    const widthStyle = props.sx?.width ? { width: props.sx.width } : {};

    if (type === "select") {
        return (
            <div className={cn("mt-4", fullWidth && "w-full")} style={widthStyle}>
                {label && <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>}
                <Select value={value || ""} onValueChange={(val) => props.onChange(val)} disabled={disabled || false}>
                    <SelectTrigger className={cn(error && "border-destructive", className)}>
                        <SelectValue placeholder={label || "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {props?.optionData?.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (multiline) {
        return (
            <div className={cn("mt-4", fullWidth && "w-full")} style={widthStyle}>
                {label && <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>}
                <Textarea
                    value={value || ""}
                    onChange={(e) => props.onChange(e.target.value)}
                    onBlur={props.onBlur ? (e) => props.onBlur(e.target.value) : undefined}
                    onFocus={props.onFocus ? (e) => props.onFocus(e.target.value) : undefined}
                    onKeyUp={props.onKeyUp ? (e) => props.onKeyUp(e.target.value) : undefined}
                    disabled={disabled || false}
                    className={cn(error && "border-destructive", className)}
                    rows={rows || 3}
                />
            </div>
        );
    }

    return (
        <div className={cn("mt-4", fullWidth && "w-full")} style={widthStyle}>
            {label && <Label className="mb-1.5 block text-sm text-muted-foreground">{label}</Label>}
            <Input
                value={value || ""}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={props.onBlur ? (e) => props.onBlur(e.target.value) : undefined}
                onFocus={props.onFocus ? (e) => props.onFocus(e.target.value) : undefined}
                onKeyUp={props.onKeyUp ? (e) => props.onKeyUp(e.target.value) : undefined}
                disabled={disabled || false}
                className={cn(error && "border-destructive", className)}
                type={type || "text"}
            />
        </div>
    );
};

export default CustomTextField;
