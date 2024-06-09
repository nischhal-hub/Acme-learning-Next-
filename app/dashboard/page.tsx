import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices, fetchRevenue } from '@/app/lib/data';

export default async function Page() {
    const revenue = await fetchRevenue();
    const latestInvoices = await fetchLatestInvoices();
    return (
        <>
            <RevenueChart revenue={revenue} />
            <LatestInvoices latestInvoices={latestInvoices}/>
        </>
    )
}