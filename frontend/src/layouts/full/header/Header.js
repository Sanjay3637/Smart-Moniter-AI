import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import PropTypes from 'prop-types';
import _ from 'lodash';

// components
import Profile from './Profile';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';
import { useSelector } from 'react-redux';

const Header = (props) => {
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { userInfo } = useSelector((state) => state.auth);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(6px)',
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={props.toggleMobileSidebar}
          sx={{
            display: {
              lg: 'none',
              xs: 'inline',
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, ml: 1, color: 'text.primary', letterSpacing: 0.2 }}>
          SmartMonitor
        </Typography>

        <IconButton
          size="large"
          aria-label="notifications"
          color="inherit"
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>
        </IconButton>
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <Chip label={_.startCase(userInfo.role || 'user')} color="primary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
          <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
            Hello, {_.startCase(userInfo.name)}
          </Typography>
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
