import CodeSharpIcon from '@mui/icons-material/CodeSharp';
import PersonOutlineSharpIcon from '@mui/icons-material/PersonOutlineSharp';
import PersonSharpIcon from '@mui/icons-material/PersonSharp';
import ChatBubbleSharpIcon from '@mui/icons-material/ChatBubbleSharp';
import CalendarMonthSharpIcon from '@mui/icons-material/CalendarMonthSharp';
import AttachMoneySharpIcon from '@mui/icons-material/AttachMoneySharp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BadgeIcon from '@mui/icons-material/Badge';
import Link from 'next/link';
import { SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { useRouter } from 'next/router';
import AssignmentSharpIcon from '@mui/icons-material/AssignmentSharp';
import ForumSharpIcon from '@mui/icons-material/ForumSharp';
import KeySharpIcon from '@mui/icons-material/KeySharp';
import LibraryBooksSharpIcon from '@mui/icons-material/LibraryBooksSharp';
import ViewTimelineSharpIcon from '@mui/icons-material/ViewTimelineSharp';

const allPagesAvailable = [
    {
        route: '/contacts',
        name: 'Contacts',
        icon: () => <PersonSharpIcon fontSize='medium' />,
        quickNav: [],
    },
    {
        route: '/files',
        name: 'Files',
        icon: () => <AccountTreeIcon fontSize='medium' />,
        quickNav: [],
    },
    {
        route: '/projects',
        name: 'Projects',
        icon: () => <CodeSharpIcon fontSize='medium' />,
        quickNav: [
            {
                name: 'Tasks',
                route: (id: string) => `/projects/${id}/tasks`,
                icon: () => <AssignmentSharpIcon fontSize='small' />,
            },
            {
                name: 'Discussion',
                route: (id: string) => `/projects/${id}/discussion`,
                icon: () => <ForumSharpIcon fontSize='small' />,
            },
            {
                name: 'Plasia Board',
                route: (id: string) => `/projects/${id}/roadmap`,
                icon: () => <ViewTimelineSharpIcon fontSize='small' />,
            },
            {
                name: 'Documentation',
                route: (id: string) => `/projects/${id}/documentation`,
                icon: () => <LibraryBooksSharpIcon fontSize='small' />,
            },
            {
                name: 'Secrets',
                route: (id: string) => `/projects/${id}/secrets`,
                icon: () => <KeySharpIcon fontSize='small' />,
            },
            
        ]
    },
    {
        route: '/staff',
        name: 'Team',
        icon: () => <BadgeIcon fontSize='medium' />,
        quickNav: [],
    },
]

interface QuickNavBoxProps
{
    route: string;
    name: string;
    Icon: any;
}

interface SmallerQuickNavBoxProps
{
    route: (id: string) => string;
    name: string;
    Icon: any;
    dynamicId: string;
}

function QuickNavBox({ route, name, Icon }: QuickNavBoxProps)
{
    const [showTooltip, setShowTooltip] = useState(false);
    return <Link href={route} className='w-10 h-10 rounded bg-tertiary  text-primary transition duration-150 hover:border-secondary hover:text-secondary hover:bg-primary flex items-center justify-center relative'
    onMouseOver={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
    >
        <Icon />
        {
            showTooltip &&
            <small className='px-2 py-1 rounded bg-primary text-secondary font-bold absolute left-14 capitalize'>
                {name}
            </small>
        }
    </Link>
}


function SmallerQuickNavBox({ route, name, Icon, dynamicId }: SmallerQuickNavBoxProps)
{
    const [showTooltip, setShowTooltip] = useState(false);
    return <Link href={route(dynamicId)} className='w-10 h-10 rounded  text-primary transition duration-150 
    hover:border-secondary hover:text-secondary hover:bg-primary flex items-center justify-center relative mx-auto'
    onMouseOver={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
    >
        <Icon />
        {
            showTooltip &&
            <small className='px-2 py-1 rounded bg-tertiary text-zinc-100 font-bold absolute left-14 capitalize'>
                {name}
            </small>
        }
    </Link>
}


/**
 * This is for when you are on a page that isn't the homepage, we want to have the ability to navigate seamlessly 
 * to other pages without having to go back to previous pages.
 */
export default function SideBar()
{
    const router = useRouter();
    const { projectId } = router.query;

    return <div className="w-10 min-w-[60px] bg-tertiary py-16 min-h-full border-quaternary border-r-2 hidden md:flex flex-col gap-3 items-center justify-start">
        {
            allPagesAvailable.map(page => <div>
                <QuickNavBox key={v4()} route={page.route} name={page.name} Icon={page.icon} />
                {
                    projectId && page.name === 'Projects' &&
                    <div className='flex flex-col gap-4 border-b-2 border-b-primary py-2 my-2 bg-quaternary rounded'>
                    {
                        page.quickNav.map(subPage => <SmallerQuickNavBox route={subPage.route} name={subPage.name} Icon={subPage.icon} dynamicId={projectId as string} />)
                    }
                    </div>
                }
            </div>)
        }
    </div>
}