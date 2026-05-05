import React from "react";
import { Button, ButtonProps } from "@mui/material";

export default function AuthPrimaryButton({ children, ...props }: ButtonProps) {
    return (
        <Button
            variant="contained"
            fullWidth
            size="large"
            {...props}
            sx={{
                borderRadius: 3,
                py: 1.5,
                backgroundColor: "#8E7CC3",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                '&:hover': {
                    backgroundColor: '#7B69B1',
                },
                ...props.sx,
            }}
        >
            {children}
        </Button>
    );
}
