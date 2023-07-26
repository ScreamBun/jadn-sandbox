import React from "react";
import { Button } from "reactstrap";

const Spinner = (props: any) => {

    const { action } = props;

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