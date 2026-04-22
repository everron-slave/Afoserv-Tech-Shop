import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { validate } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';
import { validators } from '../utils/validators';

const router = Router();

// Apply rate limiting to all search routes
router.use(apiLimiter);

/**
 * @route   GET /api/search
 * @desc    Advanced product search with full-text search, filtering, and sorting
 * @access  Public
 */
router.get(
  '/',
  validate(validators.searchSchema),
  SearchController.advancedSearch
);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions/autocomplete
 * @access  Public
 */
router.get(
  '/suggestions',
  validate(validators.searchSuggestionsSchema),
  SearchController.getSearchSuggestions
);

/**
 * @route   GET /api/search/filters
 * @desc    Get search filters metadata (available categories, price ranges, etc.)
 * @access  Public
 */
router.get('/filters', SearchController.getSearchFilters);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular search terms
 * @access  Public
 */
router.get('/popular', SearchController.getPopularSearches);

export { router };