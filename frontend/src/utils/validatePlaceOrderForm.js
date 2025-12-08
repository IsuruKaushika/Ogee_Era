import * as Yup from "yup";

const placeOrderSchema = Yup.object().shape({
	firstName: Yup.string()
		.trim()
		.matches(/^[A-Za-z]+$/, "First Name can only contain letters")
		.required("First name is required"),
	lastName: Yup.string()
		.trim()
		.matches(/^[A-Za-z]+$/, "Last Name can only contain letters")
		.required("Last name is required"),
	email: Yup.string().trim().required("Email is required").email("Enter a valid email address"),
	street: Yup.string().trim().required("Street is required"),
	city: Yup.string()
		.trim()
		.matches(/^[A-Za-z\s]+$/, "City can only contain letters and spaces")
		.required("City is required"),
	state: Yup.string()
		.trim()
		.matches(/^[A-Za-z\s]+$/, "State can only contain letters and spaces")
		.required("State is required"),
	zipcode: Yup.string()
		.trim()
		.required("Zip code is required")
		.matches(/^\d{3,10}$/, "Enter a valid zip code"),
	country: Yup.string()
		.trim()
		.matches(/^[A-Za-z\s]+$/, "Country can only contain letters and spaces")
		.required("Country is required"),
	phone: Yup.string()
		.trim()
		.required("Phone number is required")
		.matches(/^\+?\d{7,15}$/, "Enter a valid phone number"),
});

export const validatePlaceOrderForm = async (formData) => {
	try {
		await placeOrderSchema.validate(formData, { abortEarly: false });
		return {
			isValid: true,
			errors: {},
		};
	} catch (err) {
		const errors = {};
		err.inner.forEach((error) => {
			errors[error.path] = error.message;
		});
		return {
			isValid: false,
			errors,
		};
	}
};
