import "@testing-library/jest-dom";

// jsdom no implementa estas APIs del navegador. dnd-kit (drag & drop de
// TaskList) las usa para medir elementos y capturar el puntero; sin este
// polyfill, renderizar componentes que usan useSortable rompe en tests.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

type GlobalWithResizeObserver = typeof globalThis & {
  ResizeObserver?: typeof ResizeObserverMock;
};

const globalWithResizeObserver = globalThis as GlobalWithResizeObserver;
globalWithResizeObserver.ResizeObserver ??= ResizeObserverMock;

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
