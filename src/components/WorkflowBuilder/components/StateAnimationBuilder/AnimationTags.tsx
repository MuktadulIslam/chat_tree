import { memo } from "react";
import { AnimationType } from "../../type/stateAnimationBuilderDataType";

const AnimationTags = memo(function AnimationTags({ types }: { types: AnimationType[] }) {
    const getAnimationStyle = (type: 'Pre' | 'During' | 'Post') => {
        const styles = {
            'Pre': 'bg-pink-100 text-pink-800 border-pink-200',
            'During': 'bg-amber-100 text-amber-800 border-amber-200',
            'Post': 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
        return styles[type];
    };

    return (
        <div className="flex flex-wrap gap-2">
            {types.map((type, index) => (
                <span
                    key={index}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getAnimationStyle(type)}`}
                >
                    {type}
                </span>
            ))}
        </div>
    );
});

export default AnimationTags;