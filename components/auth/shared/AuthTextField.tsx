import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

export default function AuthTextField(props: TextFieldProps) {
    return (
        <TextField
            fullWidth
            variant="outlined"
            size="medium"
            {...props}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#F3F0FA',
                    boxShadow: '0 6px 10px rgba(0,0,0,0.15)',
                },
                ...props.sx,
            }}
        />
    );
}
