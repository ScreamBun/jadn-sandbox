import React from 'react';
import {toast} from "react-toastify";
import {Button} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh} from "@fortawesome/free-solid-svg-icons/faRefresh";

const PrettyPrintJson = ({data}:any) => {
    // (destructured) data could be a prop for example
    return (<div><pre>{ JSON.stringify(data, null, 2) }</pre></div>);
}

const ViewConformanceTests = (props: any) => {
    const getConformanceTests = props.getConformanceTests;
    let data:any = {};

    function onViewTests() {
        getConformanceTests().then((results: any) => {
            console.log(JSON.stringify(results.payload, null, 2));
            data = results.payload;
            return toast('Possible Tests Loaded');
        }).catch((_err:any) => {
            console.log(_err);
        });
    }

    return (
        <div className="m-2">
            <Button id="viewTests" color="primary" onClick={ onViewTests } >
                <FontAwesomeIcon icon={ faRefresh } color="white" /> Reload Tests
            </Button>
            <PrettyPrintJson data={data} />
        </div>
    );
}

export default ViewConformanceTests;