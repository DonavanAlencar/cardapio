import { TextField, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  
  const handleSubmit = e => {
    e.preventDefault();
    navigate('/');
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">🍴</div>
            <div className="logo-text">
              <h1>RestaurantPro</h1>
              <p>Sistema de Gestão</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <TextField 
              label="Email" 
              type="email"
              required 
              fullWidth
              variant="outlined"
            />
          </div>
          
          <div className="form-group">
            <TextField 
              label="Senha" 
              type="password" 
              required 
              fullWidth
              variant="outlined"
            />
          </div>
          
          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
