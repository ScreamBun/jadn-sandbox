import React from "react";

interface SBInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SBInput = (props: SBInputProps) => {
    return (
        <label>
          {props.label}
          {' '}
          <input
            className="form-control form-control-sm"
            type="text"
            value={props.value}
            onChange={props.onChange}
          />
        </label>
      );
}
export default SBInput;