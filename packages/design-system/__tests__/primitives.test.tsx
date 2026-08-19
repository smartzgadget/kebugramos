import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../src/Button";
import { Badge } from "../src/Badge";
import { EmptyState } from "../src/EmptyState";

describe("design-system", () => {
  it("Button renders and respects disabled/loading", () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    rerender(<Button loading>Save</Button>);
    expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
  });
  it("Badge renders variants", () => {
    render(<Badge variant="verified">Verified</Badge>);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });
  it("EmptyState renders", () => {
    render(<EmptyState title="No chats" description="Start a conversation" />);
    expect(screen.getByText("No chats")).toBeInTheDocument();
  });
});
