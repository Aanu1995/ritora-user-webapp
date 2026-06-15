import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { RoutineMemoryTab } from "@/components/skin-journal/routine-memory-tab";
import { useRoutineMemory } from "@/hooks/use-skin-journal";
import { useJournalUiStore } from "@/stores/journal-ui-store";
import { renderWithProviders } from "@/test/utils";
import { RoutineMemoryDurationDay } from "@/types/routine-memory";

jest.mock("@/hooks/use-skin-journal", () => ({
  useRoutineMemory: jest.fn(),
}));

const mockedUseRoutineMemory = jest.mocked(useRoutineMemory);

describe("RoutineMemoryTab", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-13T12:00:00.000Z"));
    mockedUseRoutineMemory.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useRoutineMemory>);
    useJournalUiStore.setState({
      routineMemoryDurationDays: RoutineMemoryDurationDay.Thirty,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("limits routine memory requests to the selected duration window", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithProviders(<RoutineMemoryTab />);

    expect(mockedUseRoutineMemory).toHaveBeenLastCalledWith({
      from: "2026-05-15",
      to: "2026-06-13",
    });

    await user.click(screen.getByRole("button", { name: "7 days" }));

    expect(mockedUseRoutineMemory).toHaveBeenLastCalledWith({
      from: "2026-06-07",
      to: "2026-06-13",
    });
  });
});
