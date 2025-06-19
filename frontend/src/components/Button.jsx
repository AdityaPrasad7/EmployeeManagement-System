import { Button as MuiButton } from '@mui/material';

export const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  onClick,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      {...props}
    >
      {children}
    </MuiButton>
  );
}; 