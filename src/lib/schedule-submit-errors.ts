import {
  getApiErrorCode,
  getApiErrorMessage,
} from '@/lib/api-error';
import type { SubmissionValidationResult } from '@/lib/form-submission';
import {
  MAX_STEPS_PER_SLOT,
  ScheduleApiErrorCode,
} from '@/types/schedule';

type ScheduleTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export type AddSlotFieldName = 'daysOfWeek' | 'slotTime';
export type ScheduleEditorFieldName = 'slotTime' | 'slotNotes' | 'steps';

export function getCreateSlotsSubmitError(
  error: unknown,
  t: ScheduleTranslator,
): SubmissionValidationResult<AddSlotFieldName> {
  if (getApiErrorCode(error) === ScheduleApiErrorCode.SlotConflict) {
    return {
      form: undefined,
      fields: {
        slotTime: t('save.errorDuplicate'),
      },
    };
  }

  return {
    form: getApiErrorMessage(error) ?? t('save.errorGeneric'),
    fields: {},
  };
}

export function getScheduleEditorSubmitError(
  error: unknown,
  t: ScheduleTranslator,
): SubmissionValidationResult<ScheduleEditorFieldName> {
  const code = getApiErrorCode(error);

  if (code === ScheduleApiErrorCode.SlotConflict) {
    return {
      form: undefined,
      fields: {
        slotTime: t('save.errorDuplicate'),
      },
    };
  }

  if (code === ScheduleApiErrorCode.TooManySteps) {
    return {
      form: undefined,
      fields: {
        steps: t('validation.maxSteps', { max: MAX_STEPS_PER_SLOT }),
      },
    };
  }

  if (code === ScheduleApiErrorCode.CustomLabelRequired) {
    return {
      form: undefined,
      fields: {
        steps: t('validation.customLabelRequired'),
      },
    };
  }

  if (code === ScheduleApiErrorCode.ProductsNotOwned) {
    return {
      form: undefined,
      fields: {
        steps: t('validation.productsNotOwned'),
      },
    };
  }

  if (code === ScheduleApiErrorCode.SlotNotFound) {
    return {
      form: t('save.errorNotFound'),
      fields: {},
    };
  }

  return {
    form: getApiErrorMessage(error) ?? t('save.errorGeneric'),
    fields: {},
  };
}
