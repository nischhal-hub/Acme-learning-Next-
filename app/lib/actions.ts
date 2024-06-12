'use server'
import { z } from 'zod';
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    }
    message?: string | null;
}

// ...

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: "Please select a customer."
    }),
    amount: z.coerce.number().gt(0, "Please add the amount greater than $0."),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: "Please select a status."
    }),
    date: z.date()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })
export async function createInvoice(prevState: State, formData: FormData) {
    try {
        const validatedFields = CreateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: Number(formData.get('amount')),
            status: formData.get('status')
        })
        // Check if the form data is valid according to the defined schema.
        // If the form data is not valid, return an error message and the fields with errors.
        if (!validatedFields.success) {
            // "flatten" is a method of the zod.ParseError object,
            // it returns an object with field errors and their corresponding messages.
            // The "fieldErrors" property is a dictionary with the field names as keys
            // and the error messages as values.
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                // The "Missing fields, failed to create invoice" message is just a generic error message.
                // The actual error message should be displayed to the user based on the field errors returned by the "flatten" method.
                message: 'Missing fields, failed to create invoice'
            }
        }

        const { customerId, amount, status } = validatedFields.data
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0]

        await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `

        revalidatePath('/dashboard/invoices')
        redirect('/dashboard/invoices')
    }
    catch (err) {
        return {
            message: 'Database error: Failed to create invoice.'
        }
    }
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    "use server"
    try {
        const validatedFields = UpdateInvoice.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });

        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: "Missing fileds, failed to edit invoice."
            }
        }

        const { customerId, amount, status } = validatedFields.data
        const amountInCents = amount * 100;

        await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;

        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    } catch (err) {
        return {
            message: "Database error!! Couldn't update the invoice."
        }
    }
}

export async function deleteInvoice(id: string) {
    // throw new Error('Database error! Cannot be deleted.')
    try {
        await sql`DELETE from invoices WHERE id = ${id}`
        revalidatePath('/dashboard/invoices')
    } catch (err) {
        return {
            message: "Database error!! Couldn't delete the invoice."
        }
    }
}