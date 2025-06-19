import { Card as MuiCard, CardContent, CardHeader, CardActions } from '@mui/material';

export const Card = ({
  title,
  subheader,
  children,
  actions,
  ...props
}) => {
  return (
    <MuiCard elevation={2} {...props}>
      {title && (
        <CardHeader
          title={title}
          subheader={subheader}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
}; 