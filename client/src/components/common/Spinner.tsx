import React from "react";
import { Button } from "reactstrap";

const Spinner = (props: any) => {

    const { action, div } = props;

    if (div) {
        return (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <div className="spinner-border spinner-border-lg" color="inherit" role="status">
                    <div className="sr-only">Loading...</div>
                </div>
                <div>{action}...</div>
            </div>
        );
    }

    return (
        <Button color="success" id="loadingBtn" className="btn-sm mr-1 float-right" disabled>
            <span className="spinner-border spinner-border-sm" color="inherit" role="status">
                <span className="sr-only">Loading...</span>
            </span>
            <span className="ml-1">{action}...</span>
        </Button>
    );
}

export default Spinner;