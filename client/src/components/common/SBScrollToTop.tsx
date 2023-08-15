import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";


const SBScrollToTop = (props: any) => {

    const { color } = props;

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility, false);
        return () =>
            window.removeEventListener("scroll", toggleVisibility, false);
    }, [])

    const toggleVisibility = () => {
        if (window.scrollY > 20 || document.body.scrollTop > 20 ||
            document.documentElement.scrollTop > 20) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }

    const onScrollUp = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    return (
        <Button color={color || "secondary"} id="scollToTopBtn" className="btn btn-block"
            onClick={onScrollUp} style={{ display: isVisible ? 'block' : 'none' }}>
            <FontAwesomeIcon icon={faArrowUp} />
        </Button >
    );
}

export default SBScrollToTop;