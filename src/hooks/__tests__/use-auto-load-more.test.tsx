import { act, render, screen, waitFor } from '@testing-library/react';
import { useAutoLoadMore } from '@/hooks/use-auto-load-more';

type MockIntersectionObserverInstance = {
  callback: IntersectionObserverCallback;
  disconnect: jest.Mock<void, []>;
  observe: jest.Mock<void, [Element]>;
};

const intersectionObservers: MockIntersectionObserverInstance[] = [];

function installIntersectionObserverMock() {
  class MockIntersectionObserver {
    private readonly instance: MockIntersectionObserverInstance;

    constructor(callback: IntersectionObserverCallback) {
      this.instance = {
        callback,
        disconnect: jest.fn(),
        observe: jest.fn(),
      };
      intersectionObservers.push(this.instance);
    }

    observe(element: Element) {
      this.instance.observe(element);
    }

    disconnect() {
      this.instance.disconnect();
    }

    unobserve() {
      return undefined;
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(global, 'IntersectionObserver', {
    configurable: true,
    value: MockIntersectionObserver,
  });
}

function triggerIntersection(isIntersecting = true) {
  const observer = intersectionObservers.at(-1);
  if (!observer) {
    throw new Error('No IntersectionObserver instance was registered.');
  }

  observer.callback(
    [
      {
        isIntersecting,
        target: screen.getByTestId('load-more-sentinel'),
      } as IntersectionObserverEntry,
    ],
    {} as IntersectionObserver,
  );
}

function AutoLoadMoreHarness({
  onLoadMore,
}: {
  onLoadMore: () => Promise<unknown>;
}) {
  const sentinelRef = useAutoLoadMore({
    hasNextPage: true,
    isFetchingNextPage: false,
    onLoadMore,
  });

  return <div ref={sentinelRef} data-testid="load-more-sentinel" />;
}

describe('useAutoLoadMore', () => {
  beforeEach(() => {
    intersectionObservers.length = 0;
    installIntersectionObserverMock();
  });

  it('releases the in-flight guard when a load-more request fails', async () => {
    const onLoadMore = jest
      .fn<Promise<unknown>, []>()
      .mockRejectedValueOnce(new Error('load_failed'))
      .mockResolvedValueOnce(undefined);

    render(<AutoLoadMoreHarness onLoadMore={onLoadMore} />);

    act(() => triggerIntersection());

    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => triggerIntersection());

    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(2));
  });
});
