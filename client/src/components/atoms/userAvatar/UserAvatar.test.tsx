import { render, screen } from "@testing-library/react";
import { UserAvatar } from "./UserAvatar";

describe("UserAvatar", () => {
  it("renders a blobatar with a concrete size in the header", () => {
    render(<UserAvatar name="alice" />);

    const svg = screen.getByRole("img", { hidden: true });
    expect(svg).toBeTruthy();
    expect(svg.getAttribute("width")).toBe("32");
    expect(svg.getAttribute("height")).toBe("32");
  });
});
