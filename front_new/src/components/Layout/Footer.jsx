export default function Footer() {
  return (
    <footer style={{ padding: '12px 24px', borderTop: '1px solid #eee', fontSize: 12, textAlign: 'center' }}>
      © {new Date().getFullYear()} RestaurantPro
    </footer>
  );
}
