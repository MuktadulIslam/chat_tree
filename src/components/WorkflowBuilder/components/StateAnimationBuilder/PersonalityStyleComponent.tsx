import { memo } from "react";
import { State } from "../../type/stateAnimationBuilderDataType";
import { Personality } from "../../type";

interface PersonalityStyleComponentProps {
    personality: Personality;
    textSizeClass?: string;
}

const PersonalityStyleComponent = memo(function PersonalityStyleComponent({ personality, textSizeClass = 'text-xs' }: PersonalityStyleComponentProps) {
    const getPersonalityStyle = (type: State['personality']) => {
        const styles = {
            'Angry': 'text-red-800',
            'Annoyed': 'text-orange-800',
            'Neutral': 'text-gray-800',
            'Content': 'text-blue-800',
            'Happy': 'text-green-800'
        };
        return styles[type];
    };

    return (
        <span className={`${getPersonalityStyle(personality)} ${textSizeClass} font-extrabold line-clamp-1`}>
            Personality:
            <i className="ml-1">{personality}</i>
        </span>
    )
})

export default PersonalityStyleComponent;