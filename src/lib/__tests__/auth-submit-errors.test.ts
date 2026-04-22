import { ApiError } from "@/lib/api-error";
import {
  getEmailOnlySubmitError,
  getLoginSubmitError,
  getRegisterSubmitError,
  getResetPasswordSubmitError,
} from "@/lib/auth-submit-errors";

const translate = (key: string) => `translated:${key}`;

describe("auth-submit-errors", () => {
  it("maps duplicate registration email errors to the email field", () => {
    const error = new ApiError("Email already in use", {
      status: 409,
      body: {
        code: "EMAIL_IN_USE",
        message: "Email already in use",
      },
    });

    expect(getRegisterSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        email: "translated:errors.emailInUse",
      },
    });
  });

  it("maps first-name validation messages to the first-name field", () => {
    const error = new ApiError("Validation failed", {
      status: 400,
      body: {
        message: ["Det här fältet är obligatoriskt"],
        fieldErrors: {
          firstName: ["Det här fältet är obligatoriskt"],
        },
      },
    });

    expect(getRegisterSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        firstName: "Det här fältet är obligatoriskt",
      },
    });
  });

  it("maps password validation messages to the password field", () => {
    const error = new ApiError("Validation failed", {
      status: 400,
      body: {
        message: ["Password must contain at least 8 characters"],
        fieldErrors: {
          password: ["Password must contain at least 8 characters"],
        },
      },
    });

    expect(getRegisterSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        password: "Password must contain at least 8 characters",
      },
    });
  });

  it("maps login errors to a form-level message", () => {
    const error = new ApiError("Invalid credentials", {
      status: 401,
      body: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      },
    });

    expect(getLoginSubmitError(error, translate)).toEqual({
      form: "translated:errors.invalidCredentials",
      fields: {},
    });
  });

  it("maps email-only errors to the email field", () => {
    const error = new ApiError("Email is invalid", {
      status: 400,
      body: {
        message: ["Ange en giltig e-postadress"],
        fieldErrors: {
          email: ["Ange en giltig e-postadress"],
        },
      },
    });

    expect(getEmailOnlySubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        email: "Ange en giltig e-postadress",
      },
    });
  });

  it("maps terms and privacy validation errors to their fields", () => {
    const termsError = new ApiError("Terms required", {
      status: 400,
      body: {
        message: ["You must accept the terms of service and privacy policy"],
        fieldErrors: {
          termsAccepted: ["You must accept the terms of service and privacy policy"],
        },
      },
    });
    const privacyError = new ApiError("Privacy required", {
      status: 400,
      body: {
        message: ["Du måste godkänna användarvillkoren och integritetspolicyn"],
        fieldErrors: {
          privacyPolicyAccepted: [
            "Du måste godkänna användarvillkoren och integritetspolicyn",
          ],
        },
      },
    });

    expect(getRegisterSubmitError(termsError, translate)).toEqual({
      form: undefined,
      fields: {
        termsAccepted: "You must accept the terms of service and privacy policy",
      },
    });
    expect(getRegisterSubmitError(privacyError, translate)).toEqual({
      form: undefined,
      fields: {
        privacyPolicyAccepted:
          "Du måste godkänna användarvillkoren och integritetspolicyn",
      },
    });
  });

  it("maps reset-password validation to the password field", () => {
    const error = new ApiError("Password too short", {
      status: 400,
      body: {
        message: ["Password must contain at least 8 characters"],
        fieldErrors: {
          newPassword: ["Password must contain at least 8 characters"],
        },
      },
    });

    expect(getResetPasswordSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        newPassword: "Password must contain at least 8 characters",
      },
    });
  });

  it("maps login field validation without relying on translated text", () => {
    const error = new ApiError("Validation failed", {
      status: 400,
      body: {
        message: ["Ange en giltig e-postadress"],
        fieldErrors: {
          email: ["Ange en giltig e-postadress"],
        },
      },
    });

    expect(getLoginSubmitError(error, translate)).toEqual({
      form: undefined,
      fields: {
        email: "Ange en giltig e-postadress",
      },
    });
  });

  it("falls back to a translated form error when no field matches", () => {
    const error = new ApiError("Server exploded", {
      status: 500,
      body: {
        message: "Server exploded",
      },
    });

    expect(getRegisterSubmitError(error, translate)).toEqual({
      form: "translated:errors.serverError",
      fields: {},
    });
  });
});
