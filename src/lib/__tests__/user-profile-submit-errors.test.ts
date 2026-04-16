import { ApiError } from "@/lib/api-error";
import { getUserProfileSubmitError } from "@/lib/user-profile-submit-errors";

const translate = (key: string) => `translated:${key}`;

describe("user-profile-submit-errors", () => {
  it("maps first-name validation errors to the first-name field", () => {
    const error = new ApiError("Validation failed", {
      status: 400,
      body: {
        message: ["first name must not be empty"],
      },
    });

    expect(getUserProfileSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        firstName: "first name must not be empty",
      },
    });
  });

  it("maps last-name validation errors to the last-name field", () => {
    const error = new ApiError("Validation failed", {
      status: 400,
      body: {
        message: ["last name must be shorter than or equal to 100 characters"],
      },
    });

    expect(getUserProfileSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        lastName: "last name must be shorter than or equal to 100 characters",
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

    expect(getUserProfileSubmitError(error, translate)).toEqual({
      form: "Could not save profile",
      fields: {},
    });
  });
});
