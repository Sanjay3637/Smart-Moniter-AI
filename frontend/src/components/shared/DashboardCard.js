import React from 'react';
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
}) => {

  return (
    <Card
      sx={{ padding: 0 }}
      elevation={9}
      variant={undefined}
    >
      {cardheading ? (
        <CardContent>
          <Typography variant="h5">{headtitle}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {headsubtitle}
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={{ p: "30px" }}>
          {title ? (
            <Box sx={{
              mb: 3,
              p: 2,
              bgcolor: 'primary.light',
              borderRadius: 2,
            }}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems={'center'}
              >
                <Box>
                  {title ? <Typography variant="h5" color="primary.dark">{title}</Typography> : ''}
                  {subtitle ? (
                    <Typography variant="subtitle2" color="textSecondary">
                      {subtitle}
                    </Typography>
                  ) : (
                    ''
                  )}
                </Box>
                {action}
              </Stack>
            </Box>
          ) : null}

          {children}
        </CardContent>
      )}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
