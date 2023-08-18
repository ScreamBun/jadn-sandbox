import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { getValidTranslations } from "reducers/convert";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { useLocation } from "react-router-dom";
import SBCollapseViewer from "components/common/SBCollapseViewer";
import SBDownloadFile from "components/common/SBDownloadFile";
import Spinner from "components/common/Spinner";
import SBSelect, { Option } from "components/common/SBSelect";
import { initConvertedSchemaState } from "components/visualize/SchemaVisualizer";

const SchemaTranslated = (props: any) => {
    const location = useLocation()
    const { navConvertTo } = location.state

    const { loadedSchema, translation, setTranslation, translatedSchema, setTranslatedSchema, isLoading } = props;
    const data = useSelector(getValidTranslations);
    let translateOpts: Option[] = [];
    for (let i = 0; i < Object.keys(data).length; i++) {
        translateOpts.push({ ['label']: Object.keys(data)[i], ['value']: Object.values(data)[i] });
    }

    useEffect(() => {
        if (navConvertTo != '') {
            const index = Object.values(data).indexOf(navConvertTo)
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
                            placeholder={'Translate to...'}
                            value={translation} isMultiSelect
                        />
                    </div>
                    <div className='col-md-6'>
                        <div className={`${translatedSchema.length != 0 ? '' : ' d-none'}`}>
                            <SBCopyToClipboard buttonId='copyTranslatededSchema' data={translatedSchema[0].schema} customClass='float-right' />
                            <SBDownloadFile buttonId='schemaDownload' data={translatedSchema[0].schema} ext={(translation.length == 1 ? translation[0].value : translation)} customClass={`mr-1 float-right${translatedSchema[0].schema ? '' : ' d-none'}`} />
                        </div>

                        {isLoading ? <Spinner action={'Translating'} /> : <Button color="success" type="submit" id="translateSchema" className="btn-sm mr-1 float-right"
                            disabled={loadedSchema && translation.length != 0 ? false : true}
                            title={"Translate the given JADN schema to the selected format"}
                        >
                            Translate
                        </Button>}
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                {translation.length > 1 && translatedSchema.length > 1 ?
                    <SBCollapseViewer data={translatedSchema} /> :
                    <SBEditor data={translatedSchema[0].schema} isReadOnly={true} convertTo={(translation.length == 1 ? translation[0].value : translation)}></SBEditor>
                }
            </div>
        </div>
    )
}
export default SchemaTranslated;