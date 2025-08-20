import CardMUI from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
export default function Card({ children, ...rest }) {
  return (
    <CardMUI variant="outlined" {...rest}>
      <CardContent>{children}</CardContent>
    </CardMUI>
  );
}
