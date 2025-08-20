export default function Badge({ children }) {
  return (
    <span style={{
      background: '#d4af37',
      color: '#2d1b1e',
      padding: '2px 6px',
      borderRadius: 4,
      fontSize: 12
    }}>
      {children}
    </span>
  );
}
