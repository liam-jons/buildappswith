"use client";

import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

/**
 * Pagination component for navigating through multiple pages of content
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  // Generate the range of pages to show
  const generatePages = () => {
    const pages: (number | string)[] = [];
    
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;
    
    // Always show first page
    pages.push(1);
    
    // Show left dots if needed
    if (showLeftDots) {
      pages.push('leftDots');
    } else if (currentPage > 3) {
      pages.push(2);
    }
    
    // Show sibling pages and current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Show right dots if needed
    if (showRightDots) {
      pages.push('rightDots');
    } else if (currentPage < totalPages - 2) {
      pages.push(totalPages - 1);
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pages = generatePages();
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  return (
    <nav className={cn("flex items-center justify-center", className)}>
      <ul className="flex items-center gap-1">
        {/* Previous button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>
        
        {/* Page buttons */}
        {pages.map((page, index) => (
          <li key={index}>
            {typeof page === 'number' ? (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => handlePageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 cursor-default"
                disabled
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </li>
        ))}
        
        {/* Next button */}
        <li>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}