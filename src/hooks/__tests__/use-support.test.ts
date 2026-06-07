import { useCreateSupportFeedback } from "@/hooks/use-support";

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn((options) => options),
}));

jest.mock("@/services/support.service", () => ({
  createSupportFeedback: jest.fn(),
}));

describe("use-support", () => {
  it("uses TanStack mutation for support feedback submissions", () => {
    const mutation = useCreateSupportFeedback();

    expect(mutation.mutationFn).toBeDefined();
  });
});
