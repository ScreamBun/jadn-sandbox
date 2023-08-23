import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";


const SBScrollToTop = () => {

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

    const onScrollUp = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    return (
        // <div className="btn-rounded" style={{ display: isVisible ? 'block' : 'none' }}>
        //     <Button color={"warning"} id="scollToTopBtn" className="btn"
        //         onClick={onScrollUp}>
        //         <FontAwesomeIcon icon={faArrowUp} />

        //     </Button >
        //     <p className="small"> Back to Top </p>
        // </div>
        <small style={{ display: isVisible ? '' : 'none' }} className='mr-2 ml-2'>
            <a title="Scroll to the top of the page" onClick={onScrollUp} href="#">[Scroll to Top]</a>
        </small>

    );
}

export default SBScrollToTop;