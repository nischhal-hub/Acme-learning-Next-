import CardWrapper, { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData, fetchLatestInvoices, fetchRevenue } from '@/app/lib/data';

export default async function Page() {
    const revenue = await fetchRevenue();
    const latestInvoices = await fetchLatestInvoices();
    
    return (
        <>
        <div className='md:flex'>
            <RevenueChart revenue={revenue} />
            <LatestInvoices latestInvoices={latestInvoices}/>
        </div>
        <div>
            <CardWrapper />
        </div>
        </>
    )
}