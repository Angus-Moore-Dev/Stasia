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
import { useState } from 'react';
import { v4 } from 'uuid';

const allPagesAvailable = [
    {
        route: '/customers',
        name: 'customers',
        icon: () => <AttachMoneySharpIcon fontSize='medium' />
    },
    {
        route: '/contacts',
        name: 'contacts',
        icon: () => <PersonSharpIcon fontSize='medium' />
    },
    {
        route: '/leads',
        name: 'leads',
        icon: () => <PersonOutlineSharpIcon fontSize='medium' />
    },
    {
        route: '/chat',
        name: 'chat',
        icon: () => <ChatBubbleSharpIcon fontSize='medium' />
    },
    {
        route: '/files',
        name: 'files',
        icon: () => <AccountTreeIcon fontSize='medium' />
    },
    {
        route: '/projects',
        name: 'projects',
        icon: () => <CodeSharpIcon fontSize='medium' />
    },
    {
        route: '/calendar',
        name: 'calendar',
        icon: () => <CalendarMonthSharpIcon fontSize='medium' />
    },
    {
        route: '/staff',
        name: 'staff',
        icon: () => <BadgeIcon fontSize='medium' />
    },
]

interface QuickNavBoxProps
{
    route: string;
    name: string;
    Icon: any;
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


/**
 * This is for when you are on a page that isn't the homepage, we want to have the ability to navigate seamlessly 
 * to other pages without having to go back to previous pages.
 */
export default function SideBar()
{
    return <div className="w-10 min-w-[60px] bg-tertiary py-16 min-h-full border-quaternary border-r-2 hidden md:flex flex-col gap-3 items-center justify-start">
        {
            allPagesAvailable.map(page => <QuickNavBox key={v4()} route={page.route} name={page.name} Icon={page.icon} />)
        }
    </div>
}