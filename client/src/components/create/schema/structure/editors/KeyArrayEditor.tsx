import React, { memo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faMinusSquare, faPlusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { SBConfirmModal } from 'components/common/SBConfirmModal';
import SBSelect, { Option } from 'components/common/SBSelect';
import { shallowEqual } from 'react-redux';
import { useAppSelector } from 'reducers';
import { ModalSize } from './options/ModalSize';
import { PrimitiveTypeObject, StandardTypeObject, TypeKeys } from './consts';
import { zip } from 'components/utils';
import { Types } from '../structure';
import { typeDef } from '../types';
import { dismissAllToast, sbToastError } from 'components/common/SBToast';
import { InfoConfig } from '../../interface';

// Interface
interface KeyArrayEditorProps {
  id: string;
  name: string;
  description: string;
  placeholder?: string;
  value: Array<any>;
  addTypeChange: (v: any) => void;
  change: (_v: Record<string, any>) => void;
  remove: (_id: string) => void;
  config: InfoConfig;
}

// Key Array Editor: Exports
const KeyArrayEditor = memo(function KeyArrayEditor(props: KeyArrayEditorProps) {
  const { name, description, placeholder, value, config, change, addTypeChange, remove } = props;
  const [dataArr, setDataArr] = useState(value);
  const [newExportType, setNewExportType] = useState<Option | null>(null);
  const [addTypeName, setAddTypeName] = useState<string>('');

  const schemaTypes = useAppSelector((state) => (Object.keys(state.Util.types.schema)), shallowEqual) //TODO: keep state after validation 
  const types = useAppSelector((state) => ({
    base: (state.Util.types.base)
  }), shallowEqual);
  const validExports = dataArr.length != 0 ? schemaTypes.filter(type => !dataArr.includes(type)) : schemaTypes;

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [toggleAddToTypesModal, setToggleAddToTypesModal] = useState(false);

  const onChange = (e: Option, idx: number) => {
    dismissAllToast();
    const tmpValues = [...dataArr];
    const regex = new RegExp(config.$TypeName, "g");
    const baseTypes = types.base.map(type => type.toLowerCase());
    if (e == null) {
      tmpValues[idx] = "";
      //Check Config 
    } else if (baseTypes.includes(e.value.toLowerCase())) {
      sbToastError('Error: Export TypeName MUST NOT be a JADN predefined type');
      return;
    } else if (e.value.length >= 64) {
      sbToastError('Error: Export Character Max length reached');
      return;
    } else if (e.value.includes(config.$Sys)) { //TODO empty
      sbToastError('Error: Export TypeNames SHOULD NOT contain the System character');
      return;
    } else if (!regex.test(e.value)) {
      sbToastError('Error: Export TypeName format is not permitted');
      return;
      //Check if export exists
    } else if (tmpValues.includes(e.value)) {
      sbToastError(`Export ${e.value} already exists.`);
      return;
    } else {
      tmpValues[idx] = e.value;
    }
    setDataArr(tmpValues);
    change(tmpValues);
  }

  const onRemoveItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const removeAll = (response: boolean) => {
    setIsConfirmModalOpen(false);
    if (response == true) {
      remove(name.toLowerCase());
    }
  }

  const removeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (dataArr.length > 1) {
      const { dataset } = e.currentTarget;
      const index = parseInt(dataset.index || '', 10);
      const tmpValues = [...dataArr];
      tmpValues.splice(index, 1);
      setDataArr(tmpValues);
      change(tmpValues);
    } else {
      setDataArr([]);
      change([]);
    }
  }

  const addIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDataArr([...dataArr, '']);
  }

  const addToTypes = (val: string) => {
    setToggleAddToTypesModal(true);
    setAddTypeName(val);
  }

  const onSelectChange = (e: Option) => {
    if (e == null) {
      setNewExportType(null);
    } else {
      setNewExportType(e);
    }
  }

  const onCloseClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    dismissAllToast();
    setToggleAddToTypesModal(false)
  };

  const onCreateTypeClick = (e: React.MouseEvent<HTMLElement>, newExportType: Option | null) => {
    e.preventDefault();
    const exportType: string = newExportType?.value;
    if (newExportType == null) {
      sbToastError('Please select a type');
      return;
    }

    let typeArr;
    if (Types[exportType.toLowerCase()].type == 'structure') {
      const typeVal = typeDef({
        type: exportType,
        name: addTypeName,
        options: [],
        comment: ''
      })
      typeArr = zip(TypeKeys, typeVal) as StandardTypeObject

    } else {
      const typeVal = typeDef({
        type: exportType,
        name: addTypeName,
        options: [],
        comment: ''
      })
      typeArr = zip(TypeKeys, typeVal) as PrimitiveTypeObject;
    }

    addTypeChange(typeArr);
    setToggleAddToTypesModal(false)
  };

  const indices = dataArr.map((val, i) => (
    <div className="input-group mb-1" key={i}>
      <SBSelect
        id={`keyArrayEditor-${i}`}
        placeholder={placeholder}
        value={val ? { value: val, label: val } : null}
        onChange={(e: Option) => onChange(e, i)}
        data={validExports}
        isSmStyle
        isCreatable
        customNoOptionMsg={'Begin typing to add an Export...'}
      />
      <button type='button' className='btn btn-sm btn-danger' onClick={removeIndex} data-index={i}>
        <FontAwesomeIcon icon={faMinusSquare} />
      </button>
      {val && !schemaTypes.includes(val) &&
        <button type='button' className='btn btn-sm btn-primary' onClick={() => addToTypes(val)} data-index={i}
          title={'Add Export to Types'}>
          <FontAwesomeIcon icon={faPlusSquare} />
        </button>
      }
    </div>
  ))

  return (
    <>
      <div className="card mb-2" id={name.toLowerCase()}>
        <div className="card-header px-2 py-2">
          <div className='row no-gutters'>
            <div className='col'>
              <span>{name} <small style={{ fontSize: '10px' }}> {description} </small></span>
            </div>
            <div className='col'>
              <div className="btn-group float-end" role="group" aria-label="button group">
                <button type='button' className='btn btn-sm btn-primary' onClick={addIndex} >
                  <FontAwesomeIcon icon={faPlusCircle} />
                </button>
                <button type='button' className='btn btn-sm btn-danger' onClick={onRemoveItemClick} >
                  <FontAwesomeIcon icon={faMinusCircle} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body px-2 py-2">
          <div className="row m-0">
            <div className="col-12 m-0">
              {indices}
            </div>
          </div>
        </div>
      </div>
      <SBConfirmModal
        isOpen={isConfirmModalOpen}
        title={`Remove ${name}`}
        message={`Are you sure you want to remove ${name}?`}
        onResponse={removeAll}>
      </SBConfirmModal>
      <div id='addtoTypesModal' className={`modal fade ${toggleAddToTypesModal ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
        <div className={`modal-dialog modal-dialog-centered ${ModalSize.sm}`} role='document'>
          <div className='modal-content'>
            <div className="modal-header">
              <h5 className='modal-title'>
                Add Export {addTypeName}  to Types
              </h5>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={onCloseClick} />
            </div>
            <div className="modal-body">
              <p>Please specify Type</p>
              <SBSelect id={`newExportType`}
                name="type"
                value={newExportType}
                onChange={onSelectChange}
                data={types}
                isGrouped
                isCreatable
                isClearable />
            </div>
            <div className="modal-footer">
              <button type='button' className='btn btn-sm btn-success' onClick={(e) => onCreateTypeClick(e, newExportType)}>Create</button>
              <button type='button' className='btn btn-sm btn-secondary' onClick={onCloseClick}>Cancel</button>
            </div>
          </div>
        </div>
        <div className={`modal-backdrop fade ${toggleAddToTypesModal ? 'show' : ''}`} style={{
          zIndex: -1
        }}></div>
      </div>
    </>
  );
})

export default KeyArrayEditor;
