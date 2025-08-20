import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
export default function DataTable({ rows }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Nome</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(r => (
          <TableRow key={r.id}>
            <TableCell>{r.id}</TableCell>
            <TableCell>{r.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
