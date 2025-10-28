import { memo, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RoomViewer from "./RoomViewer";
import { sampleRoomData } from "./utils";
import { useRoom } from "../../context/RoomContextProvider";


const RoomStructureView = memo(function RoomStructureView() {
    const { setRoomData } = useRoom();

    useEffect(() => {
        setRoomData(sampleRoomData);
    }, [setRoomData]);
    
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
                    <RoomViewer />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
});

export default RoomStructureView;