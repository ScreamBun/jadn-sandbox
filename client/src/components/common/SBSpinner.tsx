import React, { CSSProperties } from "react";
import { Button } from "reactstrap";

const spinnerContainer: CSSProperties = {
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const SBSpinner = (props: any) => {

    const { action, color, isDiv } = props;

    if (isDiv) {
        return (
            <div style={spinnerContainer}>
                <div className="spinner-border spinner-border-lg" color="inherit" role="status">
                    <div className="sr-only">Loading...</div>
                </div>
                <div>{action ? `${action} ...` : ''}</div>
            </div>
        );
    }

    return (
        <Button color={color || "success"} id="loadingBtn" className="btn-sm mr-1 float-right" disabled>
            <span className="spinner-border spinner-border-sm" color="inherit" role="status">
                <span className="sr-only">Loading...</span>
            </span>
            <span className="ml-1">{action ? `${action} ...` : ''}</span>
        </Button>
    );
}

export default SBSpinner;