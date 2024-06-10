import React, { useState } from "react";
import { useDispatch } from "react-redux";

const DataTranslator = () => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {

    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {

    }

    return (
        <div>hit</div>
    )

}

export default DataTranslator