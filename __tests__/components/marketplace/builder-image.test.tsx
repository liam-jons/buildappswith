import React from "react";
import { render, screen } from "@testing-library/react";
import { BuilderImage } from "@/components/marketplace/builder-image";
import { vi } from "vitest";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, onLoad, ...props }: any) => {
    // Call onLoad handler to simulate image loading
    if (onLoad) {
      setTimeout(() => {
        onLoad({ target: { complete: true } });
      }, 0);
    }
    return <img src={src} alt={alt} data-testid="next-image" {...props} />;
  },
}));

describe("BuilderImage Component", () => {
  it("renders with image source when provided", () => {
    render(
      <BuilderImage
        src="https://example.com/image.jpg"
        alt="Builder Profile"
      />
    );
    
    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "src",
      "https://example.com/image.jpg"
    );
    expect(screen.getByTestId("next-image")).toHaveAttribute(
      "alt",
      "Builder Profile"
    );
  });

  it("renders fallback with correct initial when no image source provided", () => {
    render(<BuilderImage alt="Builder Profile" />);
    
    expect(screen.queryByTestId("next-image")).not.toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("uses fallbackText when provided", () => {
    render(
      <BuilderImage
        alt="Builder Profile"
        fallbackText="Liam Jons"
      />
    );
    
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("applies size variants correctly", () => {
    const { rerender } = render(
      <BuilderImage
        alt="Builder Profile"
        size="sm"
      />
    );
    
    const smallAvatar = screen.getByText("B").closest('[class*="h-12 w-12"]');
    expect(smallAvatar).toBeInTheDocument();
    
    rerender(
      <BuilderImage
        alt="Builder Profile"
        size="lg"
      />
    );
    
    const largeAvatar = screen.getByText("B").closest('[class*="h-24 w-24"]');
    expect(largeAvatar).toBeInTheDocument();
  });

  it("provides proper accessibility attributes", () => {
    render(<BuilderImage alt="Builder Profile" />);
    
    // Ensure there's a visually hidden text for screen readers
    expect(screen.getByText("Builder Profile")).toHaveClass("sr-only");
  });
});
