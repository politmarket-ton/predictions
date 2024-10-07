import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface Option {
    label: string;
    value: number;
}

interface DropdownProps {
    options: Option[];
    selectedValue: number; // Added selectedValue prop
    onSelectionChange: (selectedValue: number) => void;
}

const MuiDropdown: React.FC<DropdownProps> = ({ options, selectedValue, onSelectionChange }) => {
    const handleChange = (event: SelectChangeEvent<number>) => {
        const value = parseInt(event.target.value as string, 10); // Corrected the radix parameter
        onSelectionChange(value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel
                id="mui-select-label"
                sx={{ color: "white" }}
            >
                Выбрать валюту
            </InputLabel>
            <Select
                labelId="mui-select-label"
                id="mui-select"
                value={selectedValue} // Using selectedValue from props
                label="Choose an option"
                onChange={handleChange}
                sx={{
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2c3f50',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2c3f50',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2c3f50',
                    },
                    '.MuiSvgIcon-root': {
                        color: '#2c3f50',
                    }
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default MuiDropdown; 
