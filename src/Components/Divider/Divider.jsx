import { Separator } from "Components/ui/separator";

const CustomDivider = (props) => {
    return (
        <>
            {!!props.count ? (
                <>
                    <Separator />
                    <br />
                </>
            ) : (
                <>
                    <br />
                    <br />
                    <Separator />
                    <br />
                    <br />
                </>
            )}
        </>
    );
};

export default CustomDivider;
