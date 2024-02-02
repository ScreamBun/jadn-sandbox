import React, { CSSProperties } from "react";

const spinnerContainer: CSSProperties = {
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const SBSpinner = (props: any) => {

    const { action, color = 'success', isDiv } = props;

    if (isDiv) {
        return (
            <div style={spinnerContainer}>
                <div className="spinner-border spinner-border-lg" color="inherit" role="status">
                </div>
                <div className="ms-2">{action ? `${action} ...` : ''}</div>
            </div>
        );
    }

    return (
        <button id="loadingBtn" type='button' className={`btn btn-sm btn-${color} me-1 float-end`} disabled>
            <span className="spinner-border spinner-border-sm" color="inherit" role="status">
            </span>
            <span className={`${action} ? 'ms-2' : ''`}>{action ? `${action} ...` : ''}</span>
        </button>
    );
}

export default SBSpinner;