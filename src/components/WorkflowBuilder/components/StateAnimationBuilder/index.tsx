import { memo } from "react";
import StateAnimationsRoadMapPreview from "./StateAnimationsRoadMapPreview";
import AllStatePreview from "./AllStatePreview";
import { TiArrowRightOutline } from "react-icons/ti";
import AddStateAnimation from "./AddStateAnimation";

const StateAnimationsBuilder = memo(function StateAnimations() {
    return (
        <div className="w-full h-full flex flex-col gap-1 p-1">
            <div className="w-full flex-1 min-h-0 flex">
                <div className="w-full h-full flex items-center shrink">
                    <AllStatePreview />
                    <div className="w-12 h-12 flex justify-center items-center">
                        < TiArrowRightOutline size={45} className="text-gray-700" />
                    </div>
                </div>
                <StateAnimationsRoadMapPreview />
            </div>

            <div className="h-96 w-full flex-shrink-0">
                <AddStateAnimation />
            </div>
        </div>
    );
});

export default StateAnimationsBuilder;