import React from 'react';
import CreatableSelect from 'react-select/creatable';
import { Option, GroupedOption, groupBadgeStyles, groupStyles } from './SBSelect';

const SBCreatableSelect = (props: any) => {

    const { id, data, onChange, placeholder, isGrouped, isMultiSelect, value } = props;

    const customStyles = {
        control: base => ({
            ...base,
            cursor: 'pointer'
        }),
    
        container: css => ({ ...css, flex: '1 1 auto', alignSelf: 'stretch' }),
    
        option: (styles, state) => ({
            ...styles,
            cursor: 'pointer',
        }),
    
        menuPortal: base => ({
            ...base,
            zIndex: 9999,
            color: '#172B4D'
        })
    };

    const formatGroupLabel = (data: GroupedOption) => (
        <div style={groupStyles}>
            <span>{data.label}</span>
            <span style={groupBadgeStyles}>{data.options.length}</span>
        </div>
    );


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

        customOptList = customOpts.map((opt, index) => (
            <label className="list-group-item" style={{ textAlign: 'center' }} key={index}>
                <input className="form-check-input me-1" type="checkbox" name={'custom-file'} value={opt.label} />
                {opt.label}
            </label>
        ));

    } else {
        opts = data.map((opt: string | Option) => ({
            value: (opt.value ? opt.value : opt), label: (opt.label ? opt.label : opt)
        }));
    }


    return (
        <div style={{ width: '100%' }}>
            <CreatableSelect<Option, false, GroupedOption>
                id={id}
                placeholder={placeholder}
                options={opts}
                formatGroupLabel={formatGroupLabel}
                isClearable
                onChange={onChange}
                menuPortalTarget={document.body}
                styles={customStyles}
                isMulti={isMultiSelect}
                value={value}
            />
        </div>
    );
}

export default SBCreatableSelect;