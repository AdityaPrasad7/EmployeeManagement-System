import { TextField } from '@mui/material';

export const FormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  helperText,
  fullWidth = true,
  ...props
}) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      error={!!error}
      helperText={error || helperText}
      fullWidth={fullWidth}
      margin="normal"
      variant="outlined"
      {...props}
    />
  );
}; 