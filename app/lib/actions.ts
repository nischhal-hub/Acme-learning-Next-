'use server'
import { z } from 'zod';
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.number(),
    status: z.enum(['pending', 'paid']),
    date: z.date()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })
export async function createInvoice(formData: FormData) {
    try {
        const { customerId, amount, status } = CreateInvoice.parse({
            customerId: formData.get('customerId'),
            amount: Number(formData.get('amount')),
            status: formData.get('status')
        })
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

export async function updateInvoice(id: string, formData: FormData) {
    "use server"
    try{
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
    }catch(err){
        return{
            message:"Database error!! Couldn't update the invoice."
        }
    }
}

export async function deleteInvoice(id: string) {
    // throw new Error('Database error! Cannot be deleted.')
    try{
    await sql`DELETE from invoices WHERE id = ${id}`
    revalidatePath('/dashboard/invoices')
    }catch(err){
        return{
            message:"Database error!! Couldn't delete the invoice."
            }
    }
}