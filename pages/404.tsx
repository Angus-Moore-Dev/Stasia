export default function NotFound({ statusCode }: any)
{
    return <div className="w-full h-full flex flex-col gap-4 items-center justify-center bg-secondary">
        <p className="text-4xl">404</p>
        <p>This page does not exist.</p>
    </div>
}