export type RoutineBreakStatus = "active" | "upcoming";

export type RoutineBreak = {
  id: string;
  status: RoutineBreakStatus;
  startedAt: string;
  endsAt: string | null;
  canResumeNow: boolean;
  message: string;
};

export type RoutineBreakState = {
  routineBreak: RoutineBreak | null;
};

export type StartRoutineBreakPayload = {
  endsAt?: string | null;
  reason?: string | null;
};

export type UpdateRoutineBreakPayload = {
  endsAt?: string | null;
};
