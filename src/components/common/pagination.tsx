"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Determine page numbers to display
  const pageNumbers = [];
  const maxPagesToShow = 5; // Max number of page buttons (e.g., 1, 2, ..., 5, 6, 7, ..., 9, 10)
  
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always show first page
    pageNumbers.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      startPage = 2;
      endPage = Math.min(totalPages - 1, maxPagesToShow - 2);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - (maxPagesToShow - 3));
      endPage = totalPages - 1;
    }
    
    if (startPage > 2) {
      pageNumbers.push(-1); // Ellipsis
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push(-1); // Ellipsis
    }
    
    // Always show last page
    pageNumbers.push(totalPages);
  }


  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className="button-hover"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageNumbers.map((page, index) =>
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            className="button-hover"
          >
            {page}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className="button-hover"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
