import React from "react";
import { uploadSchema } from "actions/load";
import { sbToastError, sbToastSuccess } from "./SBToast";
import { useDispatch } from "react-redux";

const SBSaveFile = (props: any) => {

    const { id } = props;

    const dispatch = useDispatch();

    const onSaveFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length != 0) {
            const file = e.target.files[0];
            const name = file.name;
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let dataStr = ev.target.result;
                    try {
                        dispatch(uploadSchema(name, dataStr, 'schemas'))
                            .then((_val) => {
                                sbToastSuccess('Added file to list successfully');
                            })
                            .catch((err) => {
                                console.log(err);
                                sbToastError('Failed to add file to list');
                            });
                    } catch (err) {
                        sbToastError(`File cannot be loaded: Invalid JSON`);
                    }
                }
            }
        }
    }

    return (
        <input type="file" id={id} accept={".jadn"} onChange={onSaveFile} className='form-control-sm' />
    );
}

export default SBSaveFile;