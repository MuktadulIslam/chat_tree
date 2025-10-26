import { memo} from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RoomSelector from "./RoomSelector";


const RoomStructure = memo(function RoomStructure() {
    return (
        <div className="w-full h-full overflow-hidden">
            <TransformWrapper
                minScale={0.1}
                maxScale={5}
                centerOnInit={false}
                alignmentAnimation={{ disabled: true }}
                limitToBounds={false}
            >
                <TransformComponent
                    wrapperStyle={{
                        width: "100%",
                        height: "100%"
                    }}
                    contentStyle={{
                        width: "100%",
                        height: "100%"
                    }}
                >
                    <RoomSelector />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
});

export default RoomStructure;