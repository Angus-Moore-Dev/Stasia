import { MinorFeature } from "@/models/projects/MinorFeature";

interface MajorFeatureBox
{
    title: string;

}

export function MajorFeatureBox()
{
    return <div className="w-96 h-96 rounded bg-tertiary p-4">
        
    </div>
}



interface MinorFeatureBox
{
    feature: MinorFeature;
}

export function MinorFeatureBox({ feature }: MinorFeatureBox)
{
    return <div className="w-96 h-96 rounded bg-tertiary p-4">
        {
            JSON.stringify(feature)
        }
    </div>
}




interface TaskBoxProps
{
    title: string;

}

export function TaskBox()
{
    return <div className="w-96 h-96 rounded bg-tertiary p-4">

    </div>
}