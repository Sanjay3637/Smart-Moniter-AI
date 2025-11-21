import { Link } from 'react-router-dom';
import { ReactComponent as LogoDark } from 'src/assets/images/logos/brand-mark.svg';
import { styled } from '@mui/material';

const LinkStyled = styled(Link)(() => ({
  height: '56px',
  width: '180px',
  overflow: 'hidden',
  display: 'block',
}));

const Logo = () => {
  return (
    <LinkStyled to="/">
      <LogoDark height={48} />
    </LinkStyled>
  )
};

export default Logo;
