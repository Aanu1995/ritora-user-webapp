import { scheduleEditorFormSchema } from '@/lib/schedule-schemas';
import { SlotMode, StepLabel } from '@/types/schedule';

describe('scheduleEditorFormSchema', () => {
  it('emits namespace-relative custom label validation keys', () => {
    const result = scheduleEditorFormSchema.safeParse({
      slotTime: '08:00',
      mode: SlotMode.Manual,
      slotNotes: '',
      steps: [
        {
          stepOrder: 0,
          inventoryProductId: null,
          stepLabel: StepLabel.Custom,
          customLabel: '   ',
          notes: null,
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0]?.message).toBe(
      'validation.customLabelRequired',
    );
  });
});
