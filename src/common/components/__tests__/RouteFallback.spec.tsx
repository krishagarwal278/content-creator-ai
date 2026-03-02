/**
 * RouteFallback – loading UI for route-level Suspense (code splitting)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteFallback } from "../RouteFallback";

describe("RouteFallback", () => {
  it("renders a loading spinner", () => {
    render(<RouteFallback />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("has accessible loading label", () => {
    render(<RouteFallback />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
});
