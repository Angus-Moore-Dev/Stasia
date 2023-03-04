interface ButtonProps
{
    text: string;
    onClick: () => void;
    className?: string; // Allows you to extend the functionality of the button.
    ariaSelected?: boolean;
}

export default function Button({ text, onClick, className, ariaSelected }: ButtonProps)
{
    return <button className={`px-4 py-1 rounded-lg bg-secondary text-primary transition hover:bg-primary hover:text-secondary font-bold ${className ?? ''}`}
    aria-selected={ariaSelected}
    onClick={onClick}>
        {text}
    </button>
}