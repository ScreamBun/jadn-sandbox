import React from 'react'
import { getSelectedSchema } from 'reducers/util'
import { useSelector } from 'react-redux'
import { AllFieldArray } from '../schema/interface'
import Field from 'components/create/data/lib/field/Field'
import SBEditor from 'components/common/SBEditor'
import SBScrollToTop from 'components/common/SBScrollToTop'
import SBSelect, { Option } from 'components/common/SBSelect'

const DataCreator = (props: any) => {
    // Destructure props
    const { generatedMessage, setGeneratedMessage, selection, setSelection } = props;

    // Field Change Handler
    const fieldChange = (k: string, v: any) => {
        setGeneratedMessage((prev: any) => {
            const updated = { ...prev };
            if (v === "" || v === undefined || v === null) {
                delete updated[k];
            } else {
                updated[k] = v;
            }
            return updated;
        });
    };

    // Get the selected schema & selected roots/types
    const schemaObj = useSelector(getSelectedSchema);
    const roots = schemaObj.meta ? schemaObj.meta && schemaObj.meta.roots : [];
    const types = schemaObj.types ? schemaObj.types.filter((t: any) => t[0] === selection?.value) : [];

    // Handle user dropdown selection
    const handleSelection = (e: Option) => {
        setSelection(e);
        setGeneratedMessage({});
    }

    // Decide which fields to display
    let fieldDefs: null | JSX.Element | JSX.Element[] = null;
    if (selection?.value) {
        fieldDefs = types.map((field: AllFieldArray, idx: number) => {
            return (
                <Field
                    key={idx}
                    field={field}
                    fieldChange={fieldChange}
                />
            );
        });
    }

    return (
        <div className='row'>
            <div className='col-md-6'>
                <div className='card'>
                    <div className='card-body p-2'>
                         <div className="d-flex">
                            <SBSelect id={"command-list"}
                                data={roots}
                                onChange={handleSelection}
                                placeholder={'Select a data type...'}
                                value={selection}
                                isSmStyle
                                isClearable
                                customNoOptionMsg={"Schema is missing Roots"}
                            />
                        </div>
                        <div id = "message-editor" className = 'card-body-page'>
                            {fieldDefs}
                        </div>
                        <SBScrollToTop divID = "message-editor" />
                    </div>
                </div>
            </div>
             <div className ='col-md-6'>
                <div className='card'>
                    <div className='card-body p-2'>
                        <SBEditor data={generatedMessage} isReadOnly={true}></SBEditor>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataCreator;