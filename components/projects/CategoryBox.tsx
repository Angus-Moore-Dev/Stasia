import { TaskCategory } from "@/models/projects/TaskCategory";

interface CategoryBoxProps
{
    category: TaskCategory;
    currentCategoryId: string;
    onClick: () => void;
}

export default function CategoryBox({ category, currentCategoryId, onClick }: CategoryBoxProps)
{
    return <button className={`min-w-[150px] w-[16%] max-w-[280px] p-1 rounded text-zinc-100 bg-tertiary transition hover:bg-primary hover:text-secondary font-semibold 
    flex items-center justify-between px-4 aria-selected:bg-primary aria-selected:text-secondary`}
    aria-selected={currentCategoryId === category.id} onClick={onClick}>
        {category.name}
    </button>
}