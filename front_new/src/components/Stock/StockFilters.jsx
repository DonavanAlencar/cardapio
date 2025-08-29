import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import stockService from '../../services/stockService';

export default function StockFilters({ onFiltersChange, onClearFilters }) {
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    status: '',
    localizacao: ''
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const [categoriesData, locationsData] = await Promise.all([
        stockService.getStockCategories(),
        stockService.getStockLocations()
      ]);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      categoria: '',
      status: '',
      localizacao: ''
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Busca */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Buscar por SKU, nome ou categoria"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            size="small"
          />
        </Grid>

        {/* Categoria */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Categoria</InputLabel>
            <Select
              value={filters.categoria}
              label="Categoria"
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.categoria} value={cat.categoria}>
                  {cat.categoria}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ok">OK</MenuItem>
              <MenuItem value="low">Baixo</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Localização */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Localização</InputLabel>
            <Select
              value={filters.localizacao}
              label="Localização"
              onChange={(e) => handleFilterChange('localizacao', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">Todas</MenuItem>
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.nome}>
                  {loc.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Botões de ação */}
        <Grid item xs={12} md={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Limpar filtros">
              <IconButton
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                color="secondary"
                size="small"
              >
                <Clear />
              </IconButton>
            </Tooltip>
            
            {hasActiveFilters && (
              <Chip
                icon={<FilterList />}
                label={`${Object.values(filters).filter(v => v !== '').length} filtros ativos`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
