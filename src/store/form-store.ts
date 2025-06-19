import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IFormStore<T = any> {
	formValues: Record<string, T>;
	formProperties: Record<string, T>;
	setFormValues: (key: string, data: T) => void;
	resetFormValue: (key: string) => void;
	setFormProperties: (key: string, data: T) => void;
	clearFormValues: () => void;
}

export const useForm = create(
	persist<IFormStore>(
		(set, get) => ({
			formValues: {},
			formProperties: {},

			// Set form values
			setFormValues: (key, data) => {
				const currentValues = get().formValues;
				if (currentValues[key] !== data) {
					set({
						formValues: {
							...currentValues,
							[key]: data,
						},
					});
				}
			},
			setFormProperties: (key, data) => {
				const currentProperties = get().formProperties;
				if (currentProperties[key] !== data) {
					set({
						formProperties: {
							...currentProperties,
							[key]: data,
						},
					});
				}
			},

			resetFormValue: (key) => {
				const { formValues, formProperties } = get();
				const updatedValues = { ...formValues };
				const updatedProperties = { ...formProperties };

				delete updatedValues[key];
				delete updatedProperties[key];

				set({
					formValues: updatedValues,
					formProperties: updatedProperties,
				});
			},

			clearFormValues: () => {
				set({
					formValues: {},
					formProperties: {},
				});
			},
		}),
		{
			name: "form-store",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);