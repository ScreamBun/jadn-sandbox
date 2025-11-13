import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { escaped2cbor, format, hexify } from '../../utils';
import { getMsgFiles, getSelectedSchema, getValidMsgTypes } from "reducers/util";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { useLocation } from "react-router-dom";
import SBSaveFile from "components/common/SBSaveFile";
import SBSelect, { Option } from "components/common/SBSelect";
import { getFilenameExt, getFilenameOnly } from "components/utils/general";
import { LANG_JADN, LANG_JSON } from "components/utils/constants";
import SBFileLoader from "components/common/SBFileLoader";
import SBValidBtn from "components/common/SBValidBtn";


const DataToTranslate = (props: any) => {
    const location = useLocation();

    const { selectedFile, setSelectedFile, 
            loadedData, setLoadedData, 
            dataFormat, setDataFormat, 
            schemaTypes, 
            dataType, setDataType, 
            isLoading, 
            isDataValid, 
            setIsDataValid, 
            formId } = props;

    const validSchema = useSelector(getSelectedSchema);
    const [fileName, setFileName] = useState({
        name: '',
        ext: LANG_JSON
    });
    const msgOpts = useSelector(getMsgFiles);
    const validMsgFormat = useSelector(getValidMsgTypes)
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (location.state) {
            const index = Object.values(validMsgFormat).indexOf(location.state)
            setDataFormat({ value: Object.values(validMsgFormat)[index], label: Object.values(validMsgFormat)[index] });
        }
    }, [])

    const onFileLoad = async (dataFile?: any, fileStr?: Option) => {
        if (fileStr) {
            setSelectedFile(fileStr);
            const fileName = {
                name: getFilenameOnly(fileStr.label),
                ext: getFilenameExt(fileStr.label) || LANG_JSON
            }
            setFileName(fileName);
            if (dataFile) {
                fileName.ext == LANG_JADN ? setDataFormat({ value: LANG_JSON, label: LANG_JSON }) : setDataFormat({ value: fileName.ext, label: fileName.ext });
                const formattedData = format(dataFile, fileName.ext, 2);
                if (formattedData.startsWith('Error')) {
                    setLoadedData(dataFile);
                } else {
                    setLoadedData(formattedData);
                }
            } else {
                switch (fileName.ext) {
                    case 'cbor':
                        dataFile = escaped2cbor(hexify(dataFile));
                        break;
                    default:
                        sbToastError(`File cannot be loaded: Invalid JSON`);
                }
            }
        }
    };

    const onMsgChange = (data: any) => {
        setLoadedData(data);
        setIsDataValid(false);
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => {
        if (e) {
            e.preventDefault();
        }
        setSelectedFile('');
        setFileName({
            name: '',
            ext: LANG_JADN
        });
        setLoadedData('');
        if (ref.current) {
            ref.current.value = '';
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-sm-8'>
                        <div className="d-flex">                           

                            <SBFileLoader
                                customClass={'me-1'}
                                opts={msgOpts}
                                selectedOpt={selectedFile}
                                fileName={fileName}
                                setSelectedFile={setSelectedFile}
                                onCancelFileUpload={onCancelFileUpload}
                                onFileChange={onFileLoad}
                                acceptableExt={'.json, .cbor, .xml'}
                                ref={ref}
                                placeholder={'Select a data file...'}
                                loc={'messages'}
                            />

                            <SBSelect id={"data-format-list"}
                                    customClass={'me-1'}
                                    data={validMsgFormat.filter((fmt: any) => {
                                        const key = Object.keys(fmt)[0];
                                        const value = fmt[key];
                                        return value !== "compact";
                                    }).map((fmt: any) => {
                                        const key = Object.keys(fmt)[0];
                                        const value = fmt[key];
                                        return { value: value, label: key };
                                    })}
                                    onChange={(e: Option) => setDataFormat(e)}
                                    value={dataFormat}
                                    placeholder={'Format...'}
                                    isSmStyle
                                    isClearable />                             

                            <SBSelect id={"data-decode-list"}
                                customClass={'me-1'}
                                data={schemaTypes.roots}
                                onChange={(e: Option) => setDataType(e)}
                                value={dataType}
                                placeholder={'Type...'}
                                isSmStyle
                                isClearable
                                customNoOptionMsg={'Select a schema to begin'} />
                        </div>
                    </div>

                    <div className='col-sm-4'>
                        <div className='d-flex float-end'>
                            <SBCopyToClipboard buttonId='copyData' data={loadedData} customClass='float-end me-1' />
                            <SBSaveFile data={loadedData} loc={'messages'} customClass={"float-end"} filename={fileName.name} ext={dataFormat ? dataFormat.value : LANG_JSON} setDropdown={setSelectedFile} />                            
                            <SBValidBtn buttonId='validateBtn'
                                buttonTxt='Valid'
                                buttonTitle='Validate the data against the given schema'
                                isLoading={isLoading}
                                formId={formId}
                                isValid={isDataValid}
                                isDisabled={Object.keys(validSchema).length != 0 && loadedData && dataType && dataFormat ? false : true}
                            ></SBValidBtn>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body-page">
                <SBEditor data={loadedData} convertTo={dataFormat ? dataFormat.value : ''} onChange={onMsgChange}></SBEditor>
            </div>
        </div>
    )
}

export default DataToTranslate
