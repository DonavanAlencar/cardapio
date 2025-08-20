import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from '../../config/apiConfig';
import debugLog from 'debug';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import TagIcon from '@mui/icons-material/Tag';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';

export default function Login() {
  const [email, setEmail] = useState('admin@empresa.com');
  const [senha, setSenha] = useState('admin123');
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState('email');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  
  const { login, loginWithPin, isLoading } = useAuth();
  const logUI = debugLog('ui:App');

  // Função para testar conectividade com o backend
  const testBackendConnectivity = async () => {
    console.log('🔍 Testando conectividade com o backend...');
    
    try {
      // Testa endpoint de health
      const healthResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.SYSTEM.HEALTH}`);
      console.log('✅ Health check OK:', healthResponse.status);
      
      // Testa endpoint de diagnóstico
      const diagnosticResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.SYSTEM.DIAGNOSTIC}`);
      console.log('🔍 Diagnóstico completo:', diagnosticResponse.status);
      
      // Testa endpoint de teste do banco
      const dbTestResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.AUTH.TEST_DB}`);
      console.log('🗄️ Teste do banco:', dbTestResponse.status);
      
      return {
        health: 'OK',
        diagnostic: { status: diagnosticResponse.status },
        database: { status: dbTestResponse.status },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error);
      return {
        health: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Função para validar dados antes do envio
  const validateFormData = (email, password) => {
    const errors = [];
    
    if (!email) errors.push('Email é obrigatório');
    if (!password) errors.push('Senha é obrigatória');
    if (email && !email.includes('@')) errors.push('Email deve conter @');
    if (password && password.length < 3) errors.push('Senha deve ter pelo menos 3 caracteres');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`🔐 [${requestId}] Iniciando processo de login...`);
    
    try {
      // 1. Validação dos dados do formulário
      console.log(`📝 [${requestId}] Validando dados do formulário...`);
      const validation = validateFormData(email, senha);
      
      if (!validation.isValid) {
        console.log(`❌ [${requestId}] Validação falhou:`, validation.errors);
        setError(`Erro de validação: ${validation.errors.join(', ')}`);
        setShowError(true);
        return;
      }
      
      console.log(`✅ [${requestId}] Validação do formulário OK`);
      
      // 2. Teste de conectividade (opcional - pode ser comentado em produção)
      console.log(`🔍 [${requestId}] Testando conectividade...`);
      const connectivityTest = await testBackendConnectivity();
      setDiagnosticInfo(connectivityTest);
      
      if (connectivityTest.health === 'ERROR') {
        console.log(`❌ [${requestId}] Problema de conectividade detectado`);
        setError(`Problema de conectividade: ${connectivityTest.error}`);
        setShowError(true);
        return;
      }
      
      console.log(`✅ [${requestId}] Conectividade OK`);
      
      // 3. Tentativa de login usando o contexto
      console.log(`🔐 [${requestId}] Enviando requisição de login...`);
      console.log(`📧 [${requestId}] Email:`, email);
      console.log(`🔑 [${requestId}] Senha:`, senha ? '***' : 'NÃO FORNECIDA');
      
      await login(email, senha);
      
      console.log(`✅ [${requestId}] Login bem-sucedido`);
      
    } catch (err) {
      console.error(`❌ [${requestId}] Erro no login:`, err);
      logUI(err);
      
      // Log detalhado do erro
      if (err.response) {
        console.log(`📊 [${requestId}] Resposta de erro:`, {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        // Mensagens de erro específicas baseadas no status
        if (err.response.status === 401) {
          if (err.response.data?.message === 'Usuário não encontrado.') {
            setError('Usuário não encontrado. Verifique o email.');
          } else if (err.response.data?.message === 'Senha incorreta.') {
            setError('Senha incorreta. Tente novamente.');
          } else {
            setError('Credenciais inválidas.');
          }
        } else if (err.response.status === 400) {
          setError(`Erro de validação: ${err.response.data?.message}`);
        } else if (err.response.status === 500) {
          setError('Erro interno do servidor. Tente novamente.');
        } else {
          setError(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro desconhecido'}`);
        }
      } else if (err.request) {
        console.log(`❌ [${requestId}] Requisição enviada mas sem resposta:`, err.request);
        setError('Sem resposta do servidor. Verifique a conectividade.');
      } else {
        console.log(`❌ [${requestId}] Erro na configuração da requisição:`, err.message);
        setError(`Erro de configuração: ${err.message}`);
      }
      
      setShowError(true);
    }
  };

  const handlePinInput = (digit) => {
    if (digit === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return;
    
    setError('');
    
    try {
      await loginWithPin(pin);
      console.log('✅ Login com PIN bem-sucedido');
    } catch (err) {
      console.error('Erro no login com PIN:', err);
      setError('PIN incorreto. Tente novamente.');
      setShowError(true);
      setPin('');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setPin('');
    setError('');
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Cardápio Digital
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestão de Restaurante
            </Typography>
          </Box>

          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab 
              icon={<MailOutlineIcon />} 
              label="Email" 
              value="email"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<TagIcon />} 
              label="PIN" 
              value="pin"
              sx={{ minHeight: 48 }}
            />
          </Tabs>

          {tab === 'email' ? (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Digite seu PIN
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {[0, 1, 2, 3].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: index < pin.length ? 'primary.main' : 'grey.300',
                        mx: 1
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <Button
                    key={digit}
                    variant="outlined"
                    onClick={() => handlePinInput(digit.toString())}
                    disabled={isLoading}
                    sx={{ height: 56 }}
                  >
                    {digit}
                  </Button>
                ))}
                <Button
                  variant="outlined"
                  onClick={() => handlePinInput('backspace')}
                  disabled={isLoading}
                  sx={{ height: 56 }}
                >
                  <BackspaceOutlinedIcon />
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handlePinInput('0')}
                  disabled={isLoading}
                  sx={{ height: 56 }}
                >
                  0
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePinSubmit}
                  disabled={pin.length !== 4 || isLoading}
                  sx={{ height: 56 }}
                >
                  ✓
                </Button>
              </Box>
            </Box>
          )}

          <Box textAlign="center" mt={2}>
            <Button variant="text" size="small" onClick={() => setShowDiagnostic(!showDiagnostic)}>
              {showDiagnostic ? 'Ocultar' : 'Mostrar'} Diagnóstico
            </Button>
          </Box>

          {showDiagnostic && diagnosticInfo && (
            <Box mt={2} p={2} sx={{ bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Informações de Diagnóstico
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 160 }}>
                {JSON.stringify(diagnosticInfo, null, 2)}
              </pre>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
            Verifique o console do navegador para logs detalhados
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
