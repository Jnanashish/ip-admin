import { Divider } from "@mui/material";

const CustomDivider = (props) => {
    return (
        <>
            {!!props.count ? (
                <>
                    <Divider />
                    <br />
                </>
            ) : (
                <>
                    <br />
                    <br />
                    <Divider />
                    <br />
                    <br />
                </>
            )}
        </>
    );
};

export default CustomDivider;
