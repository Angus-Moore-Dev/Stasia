import Button from "@/components/common/Button";

export default function CustomersPage()
{
    return <div className='w-full h-full flex flex-col items-center justify-center gap-4 max-w-[1920px] p-8 mx-auto'>
        <section className="w-full flex justify-between">
            <span className="">Customers - All Paying Contacts</span>
            <Button text='New Customer' onClick={() => {
                alert('new customer!');
            }} />
        </section>
        <section className="flex-grow flex flex-col max-w-6xl w-full mx-auto">

        </section>
    </div>
}