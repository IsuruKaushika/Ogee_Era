import * as Yup from "yup";
import { SRI_LANKA_DISTRICTS } from "../data/districts";

// Names allow spaces, hyphens, apostrophes and dots (e.g. "De Silva", "O'Connor") and any script (Sinhala, Tamil).
const NAME = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;

// Accepts 0712345678, 071 234 5678, 071-234-5678, +94 71 234 5678
export const normalizePhone = (value = "") => String(value).replace(/[\s\-().]/g, "");

const placeOrderSchema = Yup.object().shape({
  firstName: Yup.string().trim().matches(NAME, "Please enter a valid first name").required("First name is required"),
  lastName: Yup.string().trim().matches(NAME, "Please enter a valid last name").required("Last name is required"),
  email: Yup.string().trim().required("Email is required").email("Enter a valid email address"),
  phone: Yup.string()
    .required("Phone number is required")
    .test("phone", "Enter a valid phone number, e.g. 071 234 5678", (v) => /^(\+94|0)?7\d{8}$|^\+?\d{9,15}$/.test(normalizePhone(v))),
  street: Yup.string().trim().min(5, "Please enter your full address").required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().oneOf(SRI_LANKA_DISTRICTS, "Please choose your district").required("District is required"),
  zipcode: Yup.string().trim().matches(/^(\d{3,10})?$/, "Enter a valid postal code").notRequired(),
});

export const validatePlaceOrderForm = async (formData) => {
  try {
    await placeOrderSchema.validate(formData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      if (!errors[error.path]) errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};
