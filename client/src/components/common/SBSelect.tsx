import React, { CSSProperties, Fragment, useState } from 'react';
import Select, { components } from 'react-select';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const groupStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
};
const groupBadgeStyles: CSSProperties = {
    backgroundColor: '#EBECF0',
    borderRadius: '2em',
    color: '#172B4D',
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: '1',
    minWidth: 1,
    padding: '0.16666666666667em 0.5em',
    textAlign: 'center',
};

const customMenuOptionStyle: CSSProperties = {
    border: 'none',
    fontWeight: 'bold',
    textAlign: 'center'
}

export interface Option {
    readonly value: string;
    readonly label: string;
}

interface GroupedOption {
    readonly label: string;
    readonly options: readonly Option[];
}

const SBSelect = (props: any) => {

    const { id, data, onChange, placeholder, isGrouped, isMultiSelect } = props;
    const [toggleModal, setToggleModal] = useState(false);

    const Menu = (props: any) => {
        return (
            <Fragment>
                <components.Menu {...props}>
                    <div>
                        <div>{props.children}</div>
                        <hr />
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => onChange({ value: 'file' })}
                            style={customMenuOptionStyle}
                        >
                            Upload New File ...
                        </button>
                        <hr />
                        <button type="button" className="list-group-item list-group-item-action"
                            onClick={() => setToggleModal(true)}
                            style={customMenuOptionStyle}
                        >
                            Remove Custom Files
                        </button>
                    </div>
                </components.Menu>
            </Fragment >
        );
    };

    let opts, customOpts, customOptList;
    if (isGrouped) {
        opts = Object.keys(data).map((groupLabel) => ({
            label: groupLabel,
            options: Object.values(data[groupLabel]).map((opt) => ({
                value: `${groupLabel == 'custom' ? `custom/${opt}` : opt}`,
                label: opt
            }))
        }));

        customOpts = [];
        for (let i = 0; i < opts.length; i++) {
            if (opts[i].label == 'custom') {
                if (opts[i].hasOwnProperty('options') && opts[i].options.length != 0) {
                    for (let j = 0; j < opts[i].options.length; j++) {
                        customOpts.push({
                            value: opts[i].options[j].value,
                            label: opts[i].options[j].label
                        });
                    }
                }
            }
        }
        //TODO: select multiple files
        customOptList = customOpts.map((opt) =>
            <button type="button" className="list-group-item list-group-item-action" key={opt.value}> {opt.label} </button>
        );

    } else {
        opts = data.map((opt: string) => ({
            value: opt, label: opt
        }));
    }

    const formatGroupLabel = (data: GroupedOption) => (
        <div style={groupStyles}>
            <span>{data.label}</span>
            <span style={groupBadgeStyles}>{data.options.length}</span>
        </div>
    );

    return (
        <>
            <div>
                <Select<Option, false, GroupedOption>
                    id={id}
                    placeholder={placeholder}
                    options={opts}
                    formatGroupLabel={formatGroupLabel}
                    isClearable
                    onChange={onChange}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    isMulti={isMultiSelect}
                    components={{ Menu }}
                />
            </div>

            <Modal isOpen={toggleModal}>
                <ModalHeader>
                    Delete Custom Files
                </ModalHeader>
                <ModalBody>
                    <div className="list-group">
                        {customOptList && customOptList.length != 0 ? customOptList : 'No custom files exist'}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={() => alert("YE")}>Confirm Delete</Button>
                    <Button color="secondary" onClick={() => setToggleModal(false)}>Cancel</Button>
                </ModalFooter>
            </Modal >
        </>
    );
}

export default SBSelect;