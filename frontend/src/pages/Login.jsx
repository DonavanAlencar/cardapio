import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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
  Button
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
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState('email');
  const [pin, setPin] = useState('');
  const navigate = useNavigate();
  const logUI = debugLog('ui:App');

  // Função para testar conectividade com o backend
  const testBackendConnectivity = async () => {
    console.log('🔍 Testando conectividade com o backend...');
    
    try {
      // Testa endpoint de health
      const healthResponse = await api.get('/health');
      console.log('✅ Health check OK:', healthResponse.data);
      
      // Testa endpoint de diagnóstico
      const diagnosticResponse = await api.get('/diagnostic');
      console.log('🔍 Diagnóstico completo:', diagnosticResponse.data);
      
      // Testa endpoint de teste do banco
      const dbTestResponse = await api.get('/auth/test-db');
      console.log('🗄️ Teste do banco:', dbTestResponse.data);
      
      return {
        health: 'OK',
        diagnostic: diagnosticResponse.data,
        database: dbTestResponse.data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Erro no teste de conectividade:', error);
      return {
        health: 'ERROR',
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
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
    setIsLoading(true);
    
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`🔐 [${requestId}] Iniciando processo de login...`);
    
    try {
      // 1. Validação dos dados do formulário
      console.log(`📝 [${requestId}] Validando dados do formulário...`);
      const validation = validateFormData(email, senha);
      
      if (!validation.isValid) {
        console.log(`❌ [${requestId}] Validação falhou:`, validation.errors);
        alert(`Erro de validação: ${validation.errors.join(', ')}`);
        return;
      }
      
      console.log(`✅ [${requestId}] Validação do formulário OK`);
      
      // 2. Teste de conectividade (opcional - pode ser comentado em produção)
      console.log(`🔍 [${requestId}] Testando conectividade...`);
      const connectivityTest = await testBackendConnectivity();
      setDiagnosticInfo(connectivityTest);
      
      if (connectivityTest.health === 'ERROR') {
        console.log(`❌ [${requestId}] Problema de conectividade detectado`);
        alert(`Problema de conectividade: ${connectivityTest.error}`);
        return;
      }
      
      console.log(`✅ [${requestId}] Conectividade OK`);
      
      // 3. Tentativa de login
      console.log(`🔐 [${requestId}] Enviando requisição de login...`);
      console.log(`📧 [${requestId}] Email:`, email);
      console.log(`🔑 [${requestId}] Senha:`, senha ? '***' : 'NÃO FORNECIDA');
      
      const res = await api.post('/auth/login', { 
        email, 
        password: senha 
      });
      
      console.log(`📥 [${requestId}] Resposta recebida:`, {
        status: res.status,
        hasToken: !!res.data?.token,
        hasUser: !!res.data?.user,
        userRole: res.data?.user?.role
      });
      
      // 4. Verifica se a resposta está correta antes de continuar
      if (res.data && res.data.token && res.data.user) {
        console.log(`✅ [${requestId}] Login bem-sucedido para usuário:`, res.data.user.email);
        console.log(`👤 [${requestId}] Role do usuário:`, res.data.user.role);
        
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Redireciona com base na role do usuário
        if (res.data.user.role === 'admin') {
          navigate('/admin/pedidos');
        } else {
          navigate('/new-features');
        }
      } else {
        // Caso a resposta não seja válida, exibe um erro
        console.log(`❌ [${requestId}] Resposta inválida do servidor:`, res.data);
        throw new Error('Resposta inválida do servidor');
      }
      
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
            alert('Usuário não encontrado. Verifique o email.');
          } else if (err.response.data?.message === 'Senha incorreta.') {
            alert('Senha incorreta. Tente novamente.');
          } else {
            alert('Credenciais inválidas.');
          }
        } else if (err.response.status === 400) {
          alert(`Erro de validação: ${err.response.data?.message}`);
        } else if (err.response.status === 500) {
          alert('Erro interno do servidor. Tente novamente.');
        } else {
          alert(`Erro ${err.response.status}: ${err.response.data?.message || 'Erro desconhecido'}`);
        }
      } else if (err.request) {
        console.log(`❌ [${requestId}] Requisição enviada mas sem resposta:`, err.request);
        alert('Sem resposta do servidor. Verifique a conectividade.');
      } else {
        console.log(`❌ [${requestId}] Erro na configuração da requisição:`, err.message);
        alert(`Erro de configuração: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const clearPin = () => setPin('');

  const removeLastDigit = () => setPin((prev) => prev.slice(0, -1));

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login-pin', { pin });
      if (res.data && res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        if (res.data.user.role === 'admin') {
          navigate('/admin/pedidos');
        } else {
          navigate('/new-features');
        }
      } else {
        alert('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro no login com PIN:', err);
      alert('Erro no login com PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, rgba(139,21,56,0.05), rgba(212,175,55,0.05))'
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box textAlign="center" mb={4}>
          <Box
            className="restaurant-gradient"
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <RestaurantIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold">RestaurantPro</Typography>
          <Typography color="text.secondary">Sistema de Gerenciamento</Typography>
        </Box>
        <Card className="restaurant-glass">
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
          >
            <Tab icon={<MailOutlineIcon fontSize="small" />} iconPosition="start" label="Email" value="email" />
            <Tab icon={<TagIcon fontSize="small" />} iconPosition="start" label="PIN" value="pin" />
          </Tabs>
          <CardContent>
            {tab === 'email' && (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                          {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  className="restaurant-gradient touch-button"
                  sx={{ mt: 1 }}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </Box>
            )}

            {tab === 'pin' && (
              <Box
                component="form"
                onSubmit={handlePinSubmit}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[0, 1, 2, 3].map((idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 48,
                        height: 48,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {pin[idx] ? <LockOutlinedIcon fontSize="small" /> : null}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, width: '100%', maxWidth: 220 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <Button key={digit} variant="outlined" onClick={() => handlePinInput(String(digit))} disabled={pin.length >= 4}>
                      {digit}
                    </Button>
                  ))}
                  <Button variant="outlined" onClick={clearPin}>Limpar</Button>
                  <Button variant="outlined" onClick={() => handlePinInput('0')} disabled={pin.length >= 4}>0</Button>
                  <Button variant="outlined" onClick={removeLastDigit}>
                    <BackspaceOutlinedIcon />
                  </Button>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || pin.length !== 4}
                  className="restaurant-gradient touch-button"
                  sx={{ mt: 2, width: '100%' }}
                >
                  {isLoading ? 'Entrando...' : 'Entrar com PIN'}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

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
      </Box>
    </Box>
  );
}
