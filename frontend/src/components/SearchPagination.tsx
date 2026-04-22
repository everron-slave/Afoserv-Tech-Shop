import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

interface SearchPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
  showPageNumbers?: boolean
  showItemsCount?: boolean
}

const SearchPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
  showPageNumbers = true,
  showItemsCount = true,
}: SearchPaginationProps) => {
  if (totalPages <= 1) {
    return null
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const getPageNumbers = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      {/* Items Count */}
      {showItemsCount && totalItems > 0 && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...' || page === currentPage}
                className={`min-w-[40px] h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : page === '...'
                    ? 'border-transparent text-gray-500 cursor-default'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={typeof page === 'number' ? `Go to page ${page}` : 'More pages'}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page === '...' ? <MoreHorizontal className="w-4 h-4 mx-auto" /> : page}
              </button>
            ))}
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Page Size Selector (Optional) */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Items per page:</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={itemsPerPage}
          onChange={(e) => {
            // This would typically trigger a page size change
            console.log('Page size changed to:', e.target.value)
          }}
          disabled
        >
          <option value="20">20</option>
          <option value="40">40</option>
          <option value="60">60</option>
        </select>
      </div>
    </div>
  )
}

export default SearchPagination