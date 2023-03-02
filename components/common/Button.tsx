interface ButtonProps
{
    text: string;
    onClick: () => void;
}

export default function Button({ text, onClick }: ButtonProps)
{
    return <button className="px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold"
    onClick={onClick}>
        {text}
    </button>
}