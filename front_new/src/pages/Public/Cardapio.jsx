import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Divider,
  Button
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import api from '../../services/api';
import { getImageUrl } from '../../config/images';

const Cardapio = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        api.get('/product-categories'),
        api.get('/products')
      ]);
      
      setCategories(categoriesRes.data);
      setProducts(productsRes.data.products.filter(p => p.status === 'active'));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <RestaurantIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cardápio Digital
          </Typography>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={getCartItemCount()} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Tabs de Categorias */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Todos" value="all" />
            {categories.map((category) => (
              <Tab 
                key={category.id} 
                label={category.name} 
                value={category.id} 
              />
            ))}
          </Tabs>
        </Box>

        {/* Grid de Produtos */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                {product.image_url && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrl(product.image_url)}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {product.name}
                  </Typography>
                  
                  {product.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                      {product.description}
                    </Typography>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="primary">
                      R$ {product.price.toFixed(2)}
                    </Typography>
                    
                    {product.preparation_time && (
                      <Chip
                        label={`${product.preparation_time} min`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {categories.find(c => c.id === product.category_id)?.name}
                    </Typography>
                    
                    <Chip
                      label="Adicionar"
                      color="primary"
                      onClick={() => addToCart(product)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredProducts.length === 0 && (
          <Box textAlign="center" py={8}>
            <RestaurantIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum produto encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente selecionar uma categoria diferente
            </Typography>
          </Box>
        )}

        {/* Carrinho Flutuante */}
        {cart.length > 0 && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000
            }}
          >
            <Card sx={{ minWidth: 300, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Carrinho ({getCartItemCount()} itens)
                </Typography>
                
                {cart.map((item) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box>
                      <Typography variant="body2">
                        {item.name} x{item.quantity}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        R$ {item.price.toFixed(2)} cada
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label="-"
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        sx={{ cursor: 'pointer' }}
                      />
                      <Typography variant="body2">{item.quantity}</Typography>
                      <Chip
                        label="+"
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </Box>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    R$ {getCartTotal().toFixed(2)}
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => {
                    // Aqui você pode implementar a lógica para finalizar o pedido
                    alert('Funcionalidade de finalização de pedido será implementada');
                  }}
                >
                  Finalizar Pedido
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Cardapio;
