import React, { useState, useEffect, useRef, useCallback } from 'react';
import productService from '../services/productService';
import './SearchInput.css';

// Função debounce nativa
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

const SearchInput = ({ 
  placeholder = 'Pesquisar...', 
  onSearch, 
  onSelect, 
  minLength = 2,
  maxResults = 10,
  className = '',
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useDebounce(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < minLength) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await productService.searchProducts(searchTerm, maxResults);
      setResults(searchResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length >= minLength) {
      debouncedSearch(value);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
    
    // Call onSearch callback
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
        
      default:
        break;
    }
  };

  // Handle result selection
  const handleSelect = (item) => {
    setQuery(item.name);
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (onSelect) {
      onSelect(item);
    }
    
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleFocus = () => {
    if (query.length >= minLength && results.length > 0) {
      setShowResults(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding results to allow click events
    setTimeout(() => {
      setShowResults(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (onSearch) {
      onSearch('');
    }
    
    inputRef.current?.focus();
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className={`search-input-container ${className}`}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
        />
        
        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={clearSearch}
            aria-label="Limpar busca"
          >
            ×
          </button>
        )}
        
        {loading && (
          <div className="search-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div ref={resultsRef} className="search-results">
          {results.map((item, index) => (
            <div
              key={item.id}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="result-item-content">
                <div className="result-item-name">{item.name}</div>
                {item.description && (
                  <div className="result-item-description">{item.description}</div>
                )}
                <div className="result-item-meta">
                  <span className="result-item-category">{item.category_name}</span>
                  <span className="result-item-price">{formatPrice(item.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showResults && !loading && query.length >= minLength && results.length === 0 && (
        <div className="search-results">
          <div className="no-results">
            <p>Nenhum resultado encontrado para "{query}"</p>
            <p className="no-results-suggestion">Tente usar termos diferentes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
