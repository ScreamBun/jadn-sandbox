import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getValidTranslations } from "reducers/convert";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { useLocation } from "react-router-dom";
import SBCollapseViewer from "components/common/SBCollapseViewer";
import SBDownloadFile from "components/common/SBDownloadFile";
import SBSpinner from "components/common/SBSpinner";
import SBSelect, { Option } from "components/common/SBSelect";
import { initConvertedSchemaState } from "components/visualize/SchemaVisualizer";
import { getSelectedSchema } from "reducers/util";

const SchemaTranslated = (props: any) => {
    const location = useLocation();

    const { translation, setTranslation, translatedSchema, setTranslatedSchema, isLoading } = props;
    const validSchema = useSelector(getSelectedSchema);
    const data = useSelector(getValidTranslations);
    let translateOpts: Option[] = [];
    for (let i = 0; i < Object.keys(data).length; i++) {
        translateOpts.push({ ['label']: Object.keys(data)[i], ['value']: Object.values(data)[i] });
    }

    useEffect(() => {
        if (location.state) {
            const index = Object.values(data).indexOf(location.state)
            setTranslation({ value: Object.values(data)[index], label: Object.keys(data)[index] });
        }
    }, [])

    const handleTranslation = (e: Option[]) => {
        let translateTo = [];
        for (let i = 0; i < Object.values(e).length; i++) {
            translateTo.push(Object.values(e)[i])
        }
        setTranslation(translateTo);
        setTranslatedSchema(initConvertedSchemaState);
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-6'>
                        <SBSelect id={"translation-list"} data={translateOpts} onChange={handleTranslation}
                            placeholder={'Translate to...(select at least one)'}
                            value={translation} isMultiSelect isSmStyle
                        />
                    </div>
                    <div className='col-md-6'>
                        <div className={`${translatedSchema.length != 0 ? '' : ' d-none'}`}>
                            <SBCopyToClipboard buttonId='copyTranslatededSchema' data={translatedSchema[0].schema} customClass='float-end' />
                            <SBDownloadFile buttonId='schemaDownload' data={translatedSchema[0].schema} ext={(translation.length == 1 ? translation[0].value : translation)} customClass={`me-1 float-end${translatedSchema[0].schema ? '' : ' d-none'}`} />
                        </div>

                        {isLoading ? <SBSpinner action={'Translating'} /> :
                            <button type="submit" id="translateSchema" className="btn btn-success btn-sm me-1 float-end"
                                disabled={Object.keys(validSchema).length != 0 && translation.length != 0 ? false : true}
                                title={"Translate the given JADN schema to the selected format"}
                            >
                                Translate
                            </button>}
                    </div>
                </div>
            </div>
            <div className="card-body-page">
                {translation.length > 1 && translatedSchema.length > 1 ?
                    <SBCollapseViewer data={translatedSchema} /> :
                    <SBEditor data={translatedSchema[0].schema} isReadOnly={true} convertTo={(translation.length == 1 ? translation[0].value : translation)}></SBEditor>
                }
            </div>
        </div>
    )
}
export default SchemaTranslated;