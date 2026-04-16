import { ApiError } from "@/lib/api-error";
import { getSkinProfileSubmitError } from "@/lib/skin-profile-submit-errors";

const translate = (key: string) => `translated:${key}`;

describe("skin-profile-submit-errors", () => {
  it("maps country validation errors to the country field", () => {
    const error = new ApiError("Invalid country code", {
      status: 400,
      body: {
        message: ["country code must be a valid ISO value"],
      },
    });

    expect(getSkinProfileSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        countryCode: "country code must be a valid ISO value",
      },
    });
  });

  it("maps location consent validation errors to the consent field", () => {
    const error = new ApiError("Consent required", {
      status: 400,
      body: {
        message: ["location consent is required to continue"],
      },
    });

    expect(getSkinProfileSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        locationConsent: "location consent is required to continue",
      },
    });
  });

  it("falls back to a form-level message when no field matches", () => {
    const error = new ApiError("Could not save profile", {
      status: 500,
      body: {
        message: "Could not save profile",
      },
    });

    expect(getSkinProfileSubmitError(error, translate)).toEqual({
      form: "Could not save profile",
      fields: {},
    });
  });
});
