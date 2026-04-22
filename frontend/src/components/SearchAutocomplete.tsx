import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, Tag, Star } from 'lucide-react'
import { searchService, SearchSuggestion } from '../services/searchService'
import { useNavigate } from 'react-router-dom'

interface SearchAutocompleteProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  showSuggestions?: boolean
  initialValue?: string
}

const SearchAutocomplete = ({
  placeholder = 'Search products...',
  className = '',
  onSearch,
  showSuggestions = true,
  initialValue = '',
}: SearchAutocompleteProps) => {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    }
  }, [])

  // Save search to recent searches
  const saveToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s.toLowerCase() !== searchQuery.toLowerCase())
    ].slice(0, 5)
    
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !showSuggestions) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const result = await searchService.getSuggestions(searchQuery, 8)
      setSuggestions(result.data)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [showSuggestions])

  // Debounced suggestion fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, fetchSuggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowDropdown(true)
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    let searchQuery = suggestion.text
    
    if (suggestion.type === 'category') {
      // For category suggestions, we might want to search within that category
      searchQuery = suggestion.text
    }
    
    setQuery(searchQuery)
    setShowDropdown(false)
    saveToRecentSearches(searchQuery)
    
    // Navigate to search results
    navigate(`/products?q=${encodeURIComponent(searchQuery)}${suggestion.type === 'category' ? `&category=${encodeURIComponent(suggestion.category)}` : ''}`)
    
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery)
    setShowDropdown(false)
    navigate(`/products?q=${encodeURIComponent(recentQuery)}`)
    
    if (onSearch) {
      onSearch(recentQuery)
    }
  }

  const handleRemoveRecentSearch = (e: React.MouseEvent, recentQuery: string) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== recentQuery)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setShowDropdown(false)
    saveToRecentSearches(query)
    
    // Navigate to search results
    navigate(`/products?q=${encodeURIComponent(query)}`)
    
    if (onSearch) {
      onSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return <Tag className="w-4 h-4" />
      case 'category':
        return <Tag className="w-4 h-4" />
      case 'popular':
        return <Star className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getSuggestionColor = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return 'text-blue-600 bg-blue-50'
      case 'category':
        return 'text-green-600 bg-green-50'
      case 'popular':
        return 'text-amber-600 bg-amber-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="input pl-10 pr-10 w-full"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Dropdown with suggestions */}
      {showDropdown && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div
          id="search-suggestions"
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center text-sm text-gray-500 px-3 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Recent Searches
              </div>
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={index}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => handleRecentSearchClick(recentQuery)}
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{recentQuery}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecentSearch(e, recentQuery)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={`Remove ${recentQuery} from recent searches`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-sm text-gray-500 px-3 py-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className={`p-1 rounded mr-3 ${getSuggestionColor(suggestion.type)}`}>
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{suggestion.text}</div>
                    {suggestion.category && (
                      <div className="text-xs text-gray-500">{suggestion.category}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{suggestion.type}</div>
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <div className="mt-2">Loading suggestions...</div>
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500">
              No suggestions found for "{query}"
            </div>
          )}

          {/* Search Button for Mobile */}
          <div className="p-2 border-t border-gray-100 md:hidden">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full btn btn-primary py-2"
              disabled={!query.trim()}
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAutocomplete