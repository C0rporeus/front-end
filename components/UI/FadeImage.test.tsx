import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import FadeImage from "./FadeImage";

const frame = (container: HTMLElement) => container.querySelector(".fade-image") as HTMLElement;

describe("FadeImage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("stays hidden while the image downloads and fades in once it is loaded", async () => {
    const { container } = render(<FadeImage src="/a.jpg" alt="Portada" wrapperClassName="card-media" />);

    expect(frame(container)).toHaveClass("card-media");
    expect(frame(container)).not.toHaveClass("is-loaded");

    await act(async () => {
      fireEvent.load(screen.getByAltText("Portada"));
    });
    await waitFor(() => expect(frame(container)).toHaveClass("is-loaded"));
  });

  it("reveals images that were already cached before React attached its load event", async () => {
    jest.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    jest.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(800);

    const { container } = render(<FadeImage src="/cached.jpg" alt="En caché" />);

    await waitFor(() => expect(frame(container)).toHaveClass("is-loaded"));
  });

  it("starts hidden again when the source changes", async () => {
    const { container, rerender } = render(<FadeImage src="/one.jpg" alt="Foto" />);
    await act(async () => {
      fireEvent.load(screen.getByAltText("Foto"));
    });
    await waitFor(() => expect(frame(container)).toHaveClass("is-loaded"));

    rerender(<FadeImage src="/two.jpg" alt="Foto" />);
    expect(frame(container)).not.toHaveClass("is-loaded");
  });

  it("reports errors and never reveals a broken image", () => {
    const onError = jest.fn();
    const { container } = render(<FadeImage src="/broken.jpg" alt="Rota" onError={onError} />);

    fireEvent.error(screen.getByAltText("Rota"));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(frame(container)).not.toHaveClass("is-loaded");
  });

  it("requests visible images eagerly with high priority and the rest lazily", () => {
    render(
      <>
        <FadeImage src="/hero.jpg" alt="Visible" priority />
        <FadeImage src="/below.jpg" alt="Debajo" />
      </>,
    );

    expect(screen.getByAltText("Visible")).toHaveAttribute("loading", "eager");
    expect(screen.getByAltText("Visible")).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByAltText("Debajo")).toHaveAttribute("loading", "lazy");
  });
});
