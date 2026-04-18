import React from "react";
import { Button } from "Components/ui/button";
import { cn } from "lib/utils";

const variantMap = {
    contained: "default",
    outlined: "outline",
    text: "ghost",
    destructive: "destructive",
};

const sizeMap = {
    small: "sm",
    medium: "default",
    large: "lg",
};

function CustomButton(props) {
    const { size, fullWidth, label, variant, endIcon, disabled, style, startIcon, className } = props;
    return (
        <div>
            <Button
                variant={variantMap[variant] || "default"}
                size={sizeMap[size] || "default"}
                className={cn("capitalize", fullWidth !== false && "w-full", className)}
                disabled={disabled || false}
                onClick={() => props.onClick?.()}
                style={style || {}}
            >
                {startIcon && <span className="mr-2">{startIcon}</span>}
                {label}
                {endIcon && <span className="ml-2">{endIcon}</span>}
            </Button>
        </div>
    );
}

export default CustomButton;
